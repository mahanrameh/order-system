import { Injectable } from '@nestjs/common';
import { PrismaService } from 'libs/prisma';
import { Product, StockMovement, Prisma } from 'libs/prisma/generated';

@Injectable()
export class CatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.prisma.product.create({ data });
  }

  async findProductById(id: number): Promise<Product | null> {
    return this.prisma.product.findFirst({ where: { id, deletedAt: null } });
  }

  async updateProduct(id: number, data: Prisma.ProductUpdateInput): Promise<Product> {
    return this.prisma.product.update({ where: { id }, data });
  }

  async softDeleteProduct(id: number): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restoreProduct(id: number): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async createStockMovement(data: Prisma.StockMovementCreateInput): Promise<StockMovement> {
    return this.prisma.stockMovement.create({ data });
  }
}
