import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'libs/prisma';
import { RedisCacheService } from '../../../../libs/redis/redis-cache.service';
import { ProductStatus, ProductCategory } from 'libs/prisma/generated'; 

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: RedisCacheService,
  ) {}

  async getProduct(id: number) {
    const key = `product:${id}`;
    return this.getOrSetCache(key, async () => {
      const product = await this.prisma.product.findFirst({
        where: this.availableFilter({ id }),
      });
      if (!product) throw new NotFoundException('Product not found or unavailable');
      return product;
    });
  }

  async listProducts(skip: number, take: number) {
    const products = await this.prisma.product.findMany({
      where: { status: ProductStatus.AVAILABLE, deletedAt: null },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return products.map(p => ({
      ...p,
      finalPrice: this.getFinalPrice(p),
    }));
  }

  async countProducts() {
    return this.prisma.product.count({
      where: { status: 'AVAILABLE', deletedAt: null },
    });
  }

  async getProductsByCategory(category: ProductCategory) {
    const key = `products:category:${category}`;
    return this.getOrSetCache(key, async () => {
      const products = await this.prisma.product.findMany({
        where: this.availableFilter({ category }),
        orderBy: { createdAt: 'desc' },
      });
      if (!products.length) throw new NotFoundException(`No products found in category ${category}`);

      return products.map(p => ({
        ...p,
        finalPrice: this.getFinalPrice(p),
      }));
    });
  }

  async searchProductsByName(query: string) {
    const key = `products:search:${query.toLowerCase()}`;
    return this.getOrSetCache(key, async () => {
      return this.prisma.product.findMany({
        where: this.availableFilter({
          name: { contains: query, mode: 'insensitive' },
        }),
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  async getProductsByPriceRange(min: number, max: number) {
    const key = `products:price:${min}-${max}`;
    return this.getOrSetCache(key, async () => {
      return this.prisma.product.findMany({
        where: this.availableFilter({
          price: { gte: min, lte: max },
        }),
        orderBy: { price: 'asc' },
      });
    });
  }



  private availableFilter(extra?: object) {
    return { status: ProductStatus.AVAILABLE, deletedAt: null, ...extra };
  }

  private async getOrSetCache<T>(key: string, fetchFn: () => Promise<T>, ttl = 300): Promise<T> {
    const cached = await this.cache.get<T>(key);
    if (cached) return cached;
    const fresh = await fetchFn();
    await this.cache.set(key, fresh, ttl);
    return fresh;
  }

  private getFinalPrice(product: { price: number; discount?: number }): number {
    const discount = product.discount ?? 0;
    return product.price * (1 - discount);
  }
}
