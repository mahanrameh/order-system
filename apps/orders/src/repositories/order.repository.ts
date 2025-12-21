import { Injectable } from '@nestjs/common';
import { PrismaService } from 'libs/prisma';
import { OrderStatus } from 'libs/prisma/generated';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByBasketId(basketId: number) {
    return this.prisma.order.findFirst({ where: { basketId, deletedAt: null, status: 'PENDING' } });
  }

  async createOrder(data: any) {
    return this.prisma.order.create({
      data,
      include: { orderItems: { include: { product: true } } },
    });
  }

  async findById(id: number) {
    return this.prisma.order.findFirst({
      where: { id, deletedAt: null },
      include: { orderItems: { include: { product: true } } },
    });
  }

  async listAll() {
    return this.prisma.order.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listByUser(userId: number) {
    return this.prisma.order.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { orderItems: { include: { product: true } }, payment: true },
    });
  }

  async updateStatus(orderId: number, status: OrderStatus) {
    return this.prisma.order.update({ where: { id: orderId }, data: { status } });
  }
}
