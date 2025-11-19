import { Injectable } from '@nestjs/common';
import { PrismaService } from 'libs/prisma';
import { RedisCacheService } from '../../../libs/redis/redis-cache.service';
import { RedisLockService } from '../../../libs/redis/redis-lock.service';
import { 
  CreateProductDto, 
  UpdateProductDto, 
  ReserveInventoryDto, 
  RestockProductDto 
} from './dto/product-catalog.dto';

@Injectable()
export class CatalogService {
  constructor(
    private prisma: PrismaService,
    private cache: RedisCacheService,
    private lock: RedisLockService,
  ) {}

  async createProduct(dto: CreateProductDto) {
    const product = await this.prisma.client.product.create({ data: dto });

    if (dto.stock > 0) {
      await this.prisma.client.stockMovement.create({
        data: {
          productId: product.id,
          change: dto.stock,
          reason: 'Initial stock',
        },
      });
    }

    await this.cache.set(`product:${product.id}`, product, 300);
    return product;
  }

  async updateProduct(id: number, dto: UpdateProductDto) {
    return this.lock.withLock(`product:${id}`, async () => {
      const updated = await this.prisma.client.product.update({
        where: { id },
        data: dto,
      });
      await this.cache.del(`product:${id}`);
      return updated;
    });
  }

  async deleteProduct(id: number) {
    return this.lock.withLock(`product:${id}`, async () => {
      const deleted = await this.prisma.client.product.delete({ where: { id } });
      await this.cache.del(`product:${id}`);
      return deleted;
    });
  }

  async reserveInventory(productId: number, dto: ReserveInventoryDto) {
    return this.lock.withLock(`inventory:${productId}`, async () => {
      const product = await this.prisma.client.product.findUnique({ where: { id: productId } });
      if (!product || product.stock < dto.quantity) {
        throw new Error('Not enough stock');
      }

      const updated = await this.prisma.client.product.update({
        where: { id: productId },
        data: { stock: product.stock - dto.quantity },
      });

      await this.prisma.client.stockMovement.create({
        data: {
          productId,
          change: -dto.quantity,
          reason: dto.reason ?? 'Reserved inventory',
        },
      });

      return updated;
    });
  }

  async restockProduct(productId: number, dto: RestockProductDto) {
    return this.lock.withLock(`inventory:${productId}`, async () => {
      const product = await this.prisma.client.product.findUnique({ where: { id: productId } });
      if (!product) {
        throw new Error('Product not found');
      }

      const updated = await this.prisma.client.product.update({
        where: { id: productId },
        data: { stock: product.stock + dto.quantity },
      });

      await this.prisma.client.stockMovement.create({
        data: {
          productId,
          change: dto.quantity,
          reason: dto.reason,
        },
      });

      return updated;
    });
  }
}
