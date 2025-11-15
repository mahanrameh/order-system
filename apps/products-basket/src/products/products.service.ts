import { Injectable } from '@nestjs/common';
import { PrismaService } from 'libs/prisma';
import { RedisCacheService } from '../../../../libs/redis/redis-cache.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: RedisCacheService,
  ) {}

  async getProduct(id: number) {
    const key = `product:${id}`;

    const cached = await this.cache.get<any>(key);
    if (cached) {
      return cached;
    }

    const product = await this.prisma.client.product.findUnique({
      where: { id },
    });


    if (product) {
      await this.cache.set(key, product, 300);
    }

    return product;
  }


  async listProducts() {
    const key = `products:all`;

    const cached = await this.cache.get<any[]>(key);
    if (cached) {
      return cached;
    }

    const products = await this.prisma.client.product.findMany();

    if (products.length > 0) {
      await this.cache.set(key, products, 300);
    }

    return products;
  }

}