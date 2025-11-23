import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'libs/prisma';
import { RedisCacheService } from '../../../libs/redis/redis-cache.service';
import { RedisLockService } from '../../../libs/redis/redis-lock.service';
import { 
  CreateProductDto, 
  UpdateProductDto, 
  ReserveInventoryDto, 
  RestockProductDto 
} from './dto/product-catalog.dto';
import { ProductStatus } from 'libs/prisma/generated';

@Injectable()
export class CatalogService {
  constructor(
    private prisma: PrismaService,
    private cache: RedisCacheService,
    private lock: RedisLockService,
  ) {}

  async createProduct(dto: CreateProductDto) {
    const product = await this.prisma.product.create({ data: dto });

    if (dto.stock > 0) {
      await this.prisma.stockMovement.create({
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
      const existing = await this.prisma.product.findFirst({
        where: { id, deletedAt: null }, 
      });
      if (!existing) throw new NotFoundException('Product not found');

      const updated = await this.prisma.product.update({
        where: { id },
        data: dto,
      });

      // re‑cache updated product
      await this.cache.set(`product:${id}`, updated, 300);
      return updated;
    });
  }

  async deleteProduct(id: number) {
    return this.lock.withLock(`product:${id}`, async () => {
      const existing = await this.prisma.product.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) throw new NotFoundException('Product not found');

      const deleted = await this.prisma.product.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      await this.cache.del(`product:${id}`);
      return deleted;
    });
  }

  async restoreProduct(id: number) {
    const product = await this.prisma.product.findFirst({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    const restored = await this.prisma.product.update({
      where: { id },
      data: { deletedAt: null },
    });

    await this.cache.set(`product:${id}`, restored, 300);
    return restored;
  }

  async reserveInventory(productId: number, dto: ReserveInventoryDto) {
    return this.lock.withLock(`inventory:${productId}`, async () => {
      const product = await this.prisma.product.findFirst({
        where: { id: productId, deletedAt: null },
      });
      if (!product) throw new NotFoundException('Product not found');
      if (product.stock < dto.quantity) {
        throw new BadRequestException('Not enough stock');
      }

      const newStock = product.stock - dto.quantity;
      const updated = await this.prisma.product.update({
        where: { id: productId },
        data: { 
          stock: newStock,
          status: newStock <= 0 ? ProductStatus.OUT_OF_STOCK : ProductStatus.AVAILABLE,
        },
      });

      await this.prisma.stockMovement.create({
        data: {
          productId,
          change: -dto.quantity,
          reason: dto.reason ?? 'Reserved inventory',
        },
      });

      await this.cache.set(`product:${productId}`, updated, 300);
      return updated;
    });
  }

  async restockProduct(productId: number, dto: RestockProductDto) {
    return this.lock.withLock(`inventory:${productId}`, async () => {
      const product = await this.prisma.product.findFirst({
        where: { id: productId, deletedAt: null },
      });
      if (!product) throw new NotFoundException('Product not found');

      const newStock = product.stock + dto.quantity;
      const updated = await this.prisma.product.update({
        where: { id: productId },
        data: { 
          stock: newStock,
          status: newStock > 0 ? ProductStatus.AVAILABLE : ProductStatus.OUT_OF_STOCK,
        },
      });

      await this.prisma.stockMovement.create({
        data: {
          productId,
          change: dto.quantity,
          reason: dto.reason,
        },
      });

      await this.cache.set(`product:${productId}`, updated, 300);
      return updated;
    });
  }
}
