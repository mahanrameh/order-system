import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentRepository } from './repositories/payment.repository';
import { FakeIranBankAdapter } from './fake-iran-bank.adapter';
import { PaymentMethod, PaymentStatus } from 'libs/prisma/generated';
import { RedisLockService } from 'libs/redis/redis-lock.service';
import { RabbitMqService } from 'libs/messaging';
import {
  PaymentPendingEvent,
  PaymentCompletedEvent,
  PaymentFailedEvent,
} from 'libs/messaging/events/payment.events';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly gateway: FakeIranBankAdapter,
    private readonly events: RabbitMqService,
    private readonly redisLock: RedisLockService,
  ) {}

  async initiatePayment(
    userId: number,
    orderId: number,
    amount: number,
    idempotencyKey: string,
    currency = 'IRR',
  ) {

    return this.redisLock.withLock(`payment:init:order:${orderId}`, async () => {
      if (!idempotencyKey || idempotencyKey.trim().length === 0) {
        throw new BadRequestException('Missing idempotency key');
      }
      if (amount <= 0) {
        throw new BadRequestException('Invalid amount');
      }

      const existingByOrder = await this.paymentRepo.findByOrderId(orderId);
      if (existingByOrder) return existingByOrder;

      const existingByKey = await this.paymentRepo.findByIdempotencyKeyAndUser(idempotencyKey, userId);
      if (existingByKey) return existingByKey;

      const { gatewayRef, redirectUrl } = await this.gateway.initiate(amount, currency, orderId);

      const payment = await this.paymentRepo.create({
        userId,
        orderId,
        amount,
        method: PaymentMethod.CREDIT_CARD,
        status: PaymentStatus.PENDING,
        idempotencyKey,
        gatewayRef,
        redirectUrl,
      });

      const event: PaymentPendingEvent = {
        paymentId: payment.id,
        orderId: payment.orderId,
        userId: payment.userId,
        amount: payment.amount,
        method: payment.method.toString(), 
      };
      await this.events.publish<PaymentPendingEvent>('payment.pending', event);

      return payment;
    });
  }

  async handleWebhook(payload: any, signature: string) {
    if (!this.gateway.verifySignature(payload, signature)) {
      throw new BadRequestException('Invalid signature');
    }

    const { paymentId, gatewayRef } = payload;
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) throw new NotFoundException('Payment not found');

    return this.redisLock.withLock(`payment:finalize:${payment.id}`, async () => {
      if (payment.status !== PaymentStatus.PENDING) return payment;

      if (gatewayRef && payment.gatewayRef !== gatewayRef) {
        throw new BadRequestException('Gateway reference mismatch');
      }

      const verification = await this.gateway.verify(payment.gatewayRef!);
      const finalStatus =
        verification.status === 'SUCCESS' ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;

      const updated = await this.paymentRepo.update(payment.id, { status: finalStatus });

      if (finalStatus === PaymentStatus.COMPLETED) {
        const event: PaymentCompletedEvent = {
          paymentId: updated.id,
          orderId: updated.orderId,
          userId: updated.userId,
          amount: updated.amount,
          method: updated.method.toString(),
        };
        await this.events.publish<PaymentCompletedEvent>('payment.completed', event);
      } else {
        const event: PaymentFailedEvent = {
          paymentId: updated.id,
          orderId: updated.orderId,
          userId: updated.userId,
          amount: updated.amount,
          method: updated.method.toString(),
          reason: 'Verification failed',
        };
        await this.events.publish<PaymentFailedEvent>('payment.failed', event);
      }

      return updated;
    });
  }

  async verifyPayment(paymentId: number, idempotencyKey: string) {
    return this.redisLock.withLock(`payment:verify:${paymentId}`, async () => {
      if (!idempotencyKey || idempotencyKey.trim().length === 0) {
        throw new BadRequestException('Missing idempotency key');
      }

      const payment = await this.paymentRepo.findById(paymentId);
      if (!payment) throw new NotFoundException('Payment not found');
      if (payment.status !== PaymentStatus.PENDING) return payment;

      const res = await this.gateway.verify(payment.gatewayRef!);
      const finalStatus = res.status === 'SUCCESS' ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;

      const updated = await this.paymentRepo.update(payment.id, { status: finalStatus });

      if (finalStatus === PaymentStatus.COMPLETED) {
        const event: PaymentCompletedEvent = {
          paymentId: updated.id,
          orderId: updated.orderId,
          userId: updated.userId,
          amount: updated.amount,
          method: updated.method.toString(),
        };
        await this.events.publish<PaymentCompletedEvent>('payment.completed', event);
      } else {
        const event: PaymentFailedEvent = {
          paymentId: updated.id,
          orderId: updated.orderId,
          userId: updated.userId,
          amount: updated.amount,
          method: updated.method.toString(),
          reason: 'Verification failed',
        };
        await this.events.publish<PaymentFailedEvent>('payment.failed', event);
      }

      return updated;
    });
  }
}
