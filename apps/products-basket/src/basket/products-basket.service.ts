import { Injectable } from '@nestjs/common';
import { PrismaService } from 'libs/prisma';
import { RedisRateLimiterService } from '../../../../libs/redis/redis-rate-limiter.service';

@Injectable()
export class ProductsBasketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rateLimiter: RedisRateLimiterService,
  ) {}


  async createBasket(userId: number) {
    return this.prisma.client.basket.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  async addToBasket(userId: number, productId: number, quantity = 1) {
    const allowed = await this.rateLimiter.isAllowed(`basket:${userId}`, 10, 60);
    if (!allowed) throw new Error('Rate limit exceeded');

    
    const product = await this.prisma.client.product.findUnique({ where: { id: productId } });
    if (!product || product.status !== 'AVAILABLE' || product.stock <= 0) {
      throw new Error('Product not available');
    }

    return this.prisma.client.$transaction(async (tx) => {
      const basket = await tx.basket.upsert({
        where: { userId },
        update: {},
        create: { userId },
      });

      const existingItem = await tx.basketItem.findFirst({
        where: { basketId: basket.id, productId },
      });

      if (existingItem) {
        return tx.basketItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
        });
      }

      return tx.basketItem.create({
        data: { basketId: basket.id, productId, quantity },
      });
    });
  }

  async removeFromBasket(userId: number, productId: number) {
    const basket = await this.prisma.client.basket.findUnique({ where: { userId } });
    if (!basket) throw new Error('Basket not found');

    return this.prisma.client.basketItem.deleteMany({
      where: { basketId: basket.id, productId },
    });
  }

  async updateBasket(userId: number, items: { productId: number; quantity: number }[]) {
    const basket = await this.prisma.client.basket.findUnique({ where: { userId } });
    if (!basket) throw new Error('Basket not found');

    await this.prisma.client.basketItem.deleteMany({ where: { basketId: basket.id } });

    await this.prisma.client.basketItem.createMany({
      data: items.map(i => ({ basketId: basket.id, productId: i.productId, quantity: i.quantity })),
    });

    return this.getBasket(userId);
  }

  async getBasket(userId: number) {
    return this.prisma.client.basket.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
  }

  async deleteBasket(userId: number) {
    const basket = await this.prisma.client.basket.findUnique({ where: { userId } });
    if (!basket) throw new Error('Basket not found');

    await this.prisma.client.basketItem.deleteMany({ where: { basketId: basket.id } });

    return this.prisma.client.basket.delete({ where: { userId } });
  }

  async listBaskets() {
    return this.prisma.client.basket.findMany({
      include: { items: { include: { product: true } } },
    });
  }

}
