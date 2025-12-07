import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisCacheService } from '../../../../libs/redis/redis-cache.service';
import { ProductRepository } from '../repositories/product.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly cache: RedisCacheService,
  ) {}

  async getProduct(id: number) {
    const key = `product:${id}`;
    return this.getOrSetCache(key, async () => {
      const product = await this.productRepo.findById(id);
      if (!product) throw new NotFoundException('Product not found or unavailable');
      return {
        ...product,
        finalPrice: this.getFinalPrice(product),
      };
    });
  }

  async listProducts(skip: number, take: number) {
    const products = await this.productRepo.findMany(skip, take);
    return products.map(p => ({
      ...p,
      finalPrice: this.getFinalPrice(p),
    }));
  }

  async countProducts() {
    return this.productRepo.countAvailable();
  }

  async getProductsByFilter(
    skip: number,
    take: number,
    filters?: {
      category?: any;
      nameQuery?: string;
      minPrice?: number;
      maxPrice?: number;
    },
  ) {
    const { category, nameQuery, minPrice, maxPrice } = filters || {};

    const keyParts = [
      'products',
      category && `category:${category}`,
      nameQuery && `search:${nameQuery.toLowerCase()}`,
      minPrice !== undefined && maxPrice !== undefined && `price:${minPrice}-${maxPrice}`,
      `skip:${skip}`,
      `take:${take}`,
    ].filter(Boolean);
    const cacheKey = keyParts.join(':');

    return this.getOrSetCache(cacheKey, async () => {
      const products = await this.productRepo.findByFilter(skip, take, filters);
      if (!products.length) {
        throw new NotFoundException('No products found with given filters');
      }
      return products.map(product => ({
        ...product,
        finalPrice: this.getFinalPrice(product),
      }));
    });
  }

  private async getOrSetCache<T>(key: string, fetchFn: () => Promise<T>, ttl = 300): Promise<T> {
    const cached = await this.cache.get<T>(key);
    if (cached) return cached;
    const fresh = await fetchFn();
    await this.cache.set(key, fresh, ttl);
    return fresh;
  }

  private getFinalPrice(product: { price: number; discount?: number | null }): number {
    const discount = product.discount ?? 0;
    return product.price * (1 - discount);
  }
}
