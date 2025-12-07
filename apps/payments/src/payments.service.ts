import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { PaymentRepository } from './repositories/payment.repository';
import { BankAdapter, BankVerifyResult } from './adapters/bank.adapter';
import { PaymentMethod, PaymentStatus } from 'libs/prisma/generated';
import { RedisLockService } from 'libs/redis/redis-lock.service';
import { RabbitMqService } from 'libs/messaging';
import { RedisCacheService } from 'libs/redis/redis-cache.service';
import { createHash } from 'crypto';
import { PaymentEventPayload } from './types/payment-event-payload';

@Injectable()
export class PaymentsService {
  private readonly webhookSkewMs = 5 * 60 * 1000;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly gateway: BankAdapter,
    private readonly events: RabbitMqService,
    private readonly redisLock: RedisLockService,
    private readonly redisCache: RedisCacheService,
  ) {}

  private async publishOutbox() {
    const batch = await this.paymentRepo.fetchUndispatchedOutboxBatch(100);

    const statusToTopic: Record<string, string | null> = {
      [PaymentStatus.PENDING]: null,
      [PaymentStatus.COMPLETED]: 'payment.completed',
      [PaymentStatus.FAILED]: 'payment.failed',
    };

    await Promise.all(
      batch.map(async evt => {
        try {
          const topic = statusToTopic[evt.type as keyof typeof statusToTopic];
          if (!topic) {
            await this.paymentRepo.markOutboxDispatched(evt.id);
            return;
          }

          const payLoad = evt.payload as unknown as PaymentEventPayload;

          const payload = {
            paymentId: payLoad.paymentId,
            orderId: payLoad.orderId,
            status: payLoad.status,
            reason: payLoad.reason,
          };

          await this.events.publish(topic, payload);

          if (payload.status === PaymentStatus.COMPLETED) {
            await this.events.notify(
              payLoad.userId,
              'EMAIL',
              `Payment #${payload.paymentId} for order #${payload.orderId} was completed successfully.`,
            );
          } else if (payload.status === PaymentStatus.FAILED) {
            await this.events.notify(
              payLoad.userId,
              'EMAIL',
              `Payment #${payload.paymentId} for order #${payload.orderId} failed. Reason: ${payload.reason ?? 'Unknown'}.`,
            );
          }

          await this.paymentRepo.markOutboxDispatched(evt.id);
        } catch (err) {
          this.logger.error(
            `Failed to publish outbox event ${evt.id}`,
            err?.stack ?? err,
          );
        }
      }),
    );
  }

  async initiatePayment(userId: number, orderId: number, amount: number, currency = 'IRR') {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Invalid amount');
    }

    const key = await this.buildIdempotencyKey(userId, orderId);

    return this.redisLock.withLock(`payment:init:order:${orderId}`, async () => {
      const cached = await this.redisCache.get<string>(`payment:idempotency:${key}`);
      if (cached) {
        return JSON.parse(cached);
      }

      const existing = await this.paymentRepo.findByOrderId(orderId);
      if (existing) {
        await this.redisCache.set(`payment:idempotency:${key}`, JSON.stringify(existing), 3600);
        return existing;
      }

      const { gatewayRef, redirectUrl } = await this.gateway.initiate(amount, currency, orderId);

      const payment = await this.paymentRepo.create({
        userId,
        orderId,
        amount,
        method: PaymentMethod.CREDIT_CARD,
        status: PaymentStatus.PENDING,
        gatewayRef,
        redirectUrl,
      });

      await this.redisCache.set(`payment:idempotency:${key}`, JSON.stringify(payment), 3600);
      await this.publishOutbox();
      return payment;
    });
  }

  async verifyPayment(requestorUserId: number | null, paymentId: number) {
    return this.redisLock.withLock(`payment:verify:${paymentId}`, async () => {
      const payment = await this.paymentRepo.findById(paymentId);
      if (!payment) throw new NotFoundException('Payment not found');
      if (requestorUserId !== null && payment.userId !== requestorUserId) {
        throw new ForbiddenException('You are not allowed to verify this payment');
      }
      if (payment.status !== PaymentStatus.PENDING) return payment;

      let res: BankVerifyResult;
      try {
        res = await this.gateway.verify(payment.gatewayRef!);
      } catch (err) {
        this.logger.error('Gateway verify failed', (err as Error)?.stack ?? err);
        throw new InternalServerErrorException('Failed to verify with gateway');
      }

      const finalStatus = res.status === 'SUCCESS' ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;

      const updated = await this.paymentRepo.update(payment.id, { status: finalStatus });
      await this.publishOutbox();
      return updated;
    });
  }

  async handleGatewayWebhook(payload: { gatewayRef: string; status: 'ok' | 'cancel'; timestamp?: number }) {
    const { gatewayRef, status } = payload;
    if (!gatewayRef) throw new BadRequestException('Missing gatewayRef');

    const payment = await this.paymentRepo.findByGatewayRef(gatewayRef);
    if (!payment) {
      this.logger.warn(`Webhook for unknown gatewayRef=${gatewayRef}`);
      return { ok: true };
    }

    if (payment.status !== PaymentStatus.PENDING) {
      this.logger.log(`Webhook received for payment ${payment.id} with status ${payment.status}; ignoring`);
      return { ok: true };
    }

    if (status === 'cancel') {
      const updated = await this.paymentRepo.update(payment.id, { status: PaymentStatus.FAILED });
      await this.publishOutbox();
      return { ok: true, payment: updated };
    }

    const verified = await this.verifyPayment(null, payment.id);
    return { ok: true, payment: verified };
  }

  private async buildIdempotencyKey(userId: number, orderId: number) {
    return createHash('sha256').update(`${userId}:${orderId}`).digest('hex');
  }
}
