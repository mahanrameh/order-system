import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { RedisCacheService } from '../../../libs/redis/redis-cache.service';
import { RedisLockService } from '../../../libs/redis/redis-lock.service';
import { 
  CreateProductDto, 
  UpdateProductDto, 
  ReserveInventoryDto, 
  RestockProductDto 
} from './dto/product-catalog.dto';
import { ProductStatus, StockMovementReason } from 'libs/prisma/generated';
import { CatalogRepository } from './repositories/catalog.repository';

@Injectable()
export class CatalogService {
  constructor(
    private readonly repo: CatalogRepository,
    private readonly cache: RedisCacheService,
    private readonly lock: RedisLockService,
  ) {}

  async createProduct(dto: CreateProductDto) {
    const product = await this.repo.createProduct(dto);

    if (dto.stock > 0) {
      await this.repo.createStockMovement({
        product: { connect: { id: product.id } },
        change: dto.stock,
        reason: StockMovementReason.INITIAL_STOCK,
      });
    }

    await this.cache.set(`product:${product.id}`, product, 300);
    return product;
  }

  async updateProduct(id: number, dto: UpdateProductDto) {
    return this.lock.withLock(`product:${id}`, async () => {
      const existing = await this.repo.findProductById(id);
      if (!existing) throw new NotFoundException('Product not found');

      const updated = await this.repo.updateProduct(id, dto);
      await this.cache.set(`product:${id}`, updated, 300);
      return updated;
    });
  }

  async deleteProduct(id: number) {
    return this.lock.withLock(`product:${id}`, async () => {
      const existing = await this.repo.findProductById(id);
      if (!existing) throw new NotFoundException('Product not found');

      const deleted = await this.repo.softDeleteProduct(id);
      await this.cache.del(`product:${id}`);
      return deleted;
    });
  }

  async restoreProduct(id: number) {
    const product = await this.repo.findProductById(id);
    if (!product) throw new NotFoundException('Product not found');

    const restored = await this.repo.restoreProduct(id);
    await this.cache.set(`product:${id}`, restored, 300);
    return restored;
  }

  async reserveInventory(productId: number, dto: ReserveInventoryDto) {
    return this.lock.withLock(`inventory:${productId}`, async () => {
      const product = await this.repo.findProductById(productId);
      if (!product) throw new NotFoundException('Product not found');
      if (product.stock < dto.quantity) {
        throw new BadRequestException('Not enough stock');
      }

      const newStock = product.stock - dto.quantity;
      const updated = await this.repo.updateProduct(productId, { 
        stock: newStock,
        status: newStock <= 0 ? ProductStatus.OUT_OF_STOCK : ProductStatus.AVAILABLE,
      });

      await this.repo.createStockMovement({
        product: { connect: { id: productId } },
        change: -dto.quantity,
        reason: StockMovementReason.ORDER_PLACED,
      });

      await this.cache.set(`product:${productId}`, updated, 300);
      return updated;
    });
  }

  async restockProduct(productId: number, dto: RestockProductDto) {
    return this.lock.withLock(`inventory:${productId}`, async () => {
      const product = await this.repo.findProductById(productId);
      if (!product) throw new NotFoundException('Product not found');

      const newStock = product.stock + dto.quantity;
      const updated = await this.repo.updateProduct(productId, { 
        stock: newStock,
        status: newStock > 0 ? ProductStatus.AVAILABLE : ProductStatus.OUT_OF_STOCK,
      });

      await this.repo.createStockMovement({
        product: { connect: { id: productId } },
        change: dto.quantity,
        reason: StockMovementReason.STOCK_ADJUSTMENT,
      });

      await this.cache.set(`product:${productId}`, updated, 300);
      return updated;
    });
  }
}
