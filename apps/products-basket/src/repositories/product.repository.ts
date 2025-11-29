import { Injectable } from '@nestjs/common';
import { PrismaService } from 'libs/prisma';
import { ProductStatus, ProductCategory, Prisma, Product } from 'libs/prisma/generated';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Product | null> {
    return this.prisma.product.findFirst({
      where: { id, status: ProductStatus.AVAILABLE, deletedAt: null },
    });
  }

  async findMany(skip: number, take: number): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: { status: ProductStatus.AVAILABLE, deletedAt: null },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async countAvailable(): Promise<number> {
    return this.prisma.product.count({
      where: { status: ProductStatus.AVAILABLE, deletedAt: null },
    });
  }

  async findByFilter(
    skip: number,
    take: number,
    filters?: {
      category?: ProductCategory;
      nameQuery?: string;
      minPrice?: number;
      maxPrice?: number;
    },
  ): Promise<Product[]> {
    const { category, nameQuery, minPrice, maxPrice } = filters || {};

    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.AVAILABLE,
      deletedAt: null,
    };

    if (category) where.category = category;
    if (nameQuery) {
      where.name = { contains: nameQuery, mode: 'insensitive' };
    }
    if (minPrice !== undefined && maxPrice !== undefined) {
      where.price = { gte: minPrice, lte: maxPrice };
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      minPrice !== undefined && maxPrice !== undefined
        ? { price: 'asc' }
        : { createdAt: 'desc' };

    return this.prisma.product.findMany({
      where,
      orderBy,
      skip,
      take,
    });
  }

  async decrementStock(productId: number, quantity: number) {
    return this.prisma.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    });
  }

  async incrementStock(productId: number, quantity: number) {
    return this.prisma.product.update({
      where: { id: productId },
      data: { stock: { increment: quantity } },
    });
  }
}
