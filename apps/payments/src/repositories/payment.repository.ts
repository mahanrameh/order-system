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
    return this.prisma.payment.findUnique({ where: { orderId } });
  }

  async findByIdempotencyKeyAndUser(idempotencyKey: string, userId: number) {
    return this.prisma.payment.findFirst({
      where: { idempotencyKey, userId },
    });
  }

  async create(data: {
    userId: number;
    orderId: number;
    amount: number;
    method: PaymentMethod;
    status?: PaymentStatus;
    idempotencyKey: string;
    gatewayRef: string;
    redirectUrl: string;
  }) {
    return this.prisma.payment.create({
      data: {
        userId: data.userId,
        orderId: data.orderId,
        amount: data.amount,
        method: data.method,
        status: data.status ?? PaymentStatus.PENDING,
        idempotencyKey: data.idempotencyKey,
        gatewayRef: data.gatewayRef,
        redirectUrl: data.redirectUrl,
      },
    });
  }

  async update(
    id: number,
    data: Partial<{
      status: PaymentStatus;
      gatewayRef: string;
      redirectUrl: string;
    }>,
  ) {
    return this.prisma.payment.update({ where: { id }, data });
  }
}
