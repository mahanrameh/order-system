import { Injectable } from '@nestjs/common';
import { PrismaService } from 'libs/prisma';
import { RedisRateLimiterService } from '../../../../libs/redis/redis-rate-limiter.service';

@Injectable()
export class ProductsBasketService {
  constructor(
    private prisma: PrismaService,
    private rateLimiter: RedisRateLimiterService,
  ) {}

  async addToBasket(userId: number, productId: number) {
    const allowed = await this.rateLimiter.isAllowed(
      `basket:${userId}`,
      5, 
      60, 
    );
    if (!allowed) {
      throw new Error('Rate limit exceeded');
    }

    return this.prisma.client.basket.upsert({
      where: { userId },
      update: {
        products: { connect: { id: productId } },
      },
      create: {
        userId,
        products: { connect: { id: productId } },
      },
    });
  }

  async getBasket(userId: number) {
    return this.prisma.client.basket.findUnique({
      where: { userId },
      include: { products: true },
    });
  }
}
