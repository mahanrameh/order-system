import { Injectable } from '@nestjs/common';
import { PrismaService } from 'libs/prisma';
import { PaymentStatus, PaymentMethod } from 'libs/prisma/generated';

@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number) {
    return this.prisma.payment.findUnique({ where: { id } });
  }

  async findByOrderId(orderId: number) {
    return this.prisma.payment.findFirst({
      where: { orderId, status: PaymentStatus.PENDING },
    });
  }

  async findByGatewayRef(gatewayRef: string) {
    return this.prisma.payment.findFirst({ where: { gatewayRef } });
  }


  async create(data: {
    userId: number;
    orderId: number;
    amount: number;
    method: PaymentMethod;
    status?: PaymentStatus;
    gatewayRef: string;
    redirectUrl: string;
  }) {
    const statusToWrite = data.status ?? PaymentStatus.PENDING;

    const [payment] = await this.prisma.$transaction([
      this.prisma.payment.create({
        data: {
          userId: data.userId,
          orderId: data.orderId,
          amount: data.amount,
          method: data.method,
          status: statusToWrite,
          gatewayRef: data.gatewayRef,
          redirectUrl: data.redirectUrl,
        },
      }),
    ]);

    await this.prisma.paymentEventOutbox.create({
      data: {
        paymentId: payment.id,
        type: PaymentStatus.PENDING,
        payload: {
          paymentId: payment.id,
          orderId: payment.orderId,
          userId: payment.userId,
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
        },
      },
    });

    return payment;
  }

  async update(
    id: number,
    data: Partial<{ status: PaymentStatus; gatewayRef: string; redirectUrl: string }>,
  ) {
    const updated = await this.prisma.payment.update({ where: { id }, data });

    if (updated.status === PaymentStatus.COMPLETED) {
      await this.prisma.paymentEventOutbox.create({
        data: {
          paymentId: updated.id,
          type: PaymentStatus.COMPLETED,
          payload: {
            paymentId: updated.id,
            orderId: updated.orderId,
            userId: updated.userId,
            amount: updated.amount,
            method: updated.method,
            status: updated.status,
          },
        },
      });
    }

    if (updated.status === PaymentStatus.FAILED) {
      await this.prisma.paymentEventOutbox.create({
        data: {
          paymentId: updated.id,
          type: PaymentStatus.FAILED,
          payload: {
            paymentId: updated.id,
            orderId: updated.orderId,
            userId: updated.userId,
            amount: updated.amount,
            method: updated.method,
            status: updated.status,
            reason: 'verification_failed',
          },
        },
      });
    }

    return updated;
  }

  async fetchUndispatchedOutboxBatch(limit = 100) {
    return this.prisma.paymentEventOutbox.findMany({
      where: { dispatchedAt: null },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  async markOutboxDispatched(id: number) {
    return this.prisma.paymentEventOutbox.update({
      where: { id },
      data: { dispatchedAt: new Date() },
    });
  }
}
