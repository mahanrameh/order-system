import { Injectable } from '@nestjs/common';
import { PrismaService } from 'libs/prisma';
import { Basket, BasketItem, Product } from 'libs/prisma/generated';

@Injectable()
export class BasketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBasketByUser(userId: number): Promise<Basket | null> {
    return this.prisma.basket.findFirst({ where: { userId, deletedAt: null } });
  }

  async findActiveBasketByUser(userId: number) {
    return this.prisma.basket.findFirst({
      where: { userId, deletedAt: null },
      include: { basketItems: { where: { deletedAt: null }, include: { product: true } } },
    });
  }

  async createBasket(userId: number): Promise<Basket> {
    return this.prisma.basket.create({ data: { userId } });
  }

  async findBasketItem(basketId: number, productId: number): Promise<BasketItem | null> {
    return this.prisma.basketItem.findFirst({
      where: { basketId, productId, deletedAt: null },
    });
  }

  async createBasketItem(basketId: number, productId: number, quantity: number): Promise<BasketItem> {
    return this.prisma.basketItem.create({
      data: { basketId, productId, quantity },
    });
  }

  async updateBasketItemQuantity(itemId: number, quantity: number): Promise<BasketItem> {
    return this.prisma.basketItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  async softDeleteBasketItem(itemId: number): Promise<BasketItem> {
    return this.prisma.basketItem.update({
      where: { id: itemId },
      data: { deletedAt: new Date() },
    });
  }

  async softDeleteAllItems(basketId: number): Promise<void> {
    await this.prisma.basketItem.updateMany({
      where: { basketId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }

  async softDeleteBasket(basketId: number): Promise<Basket> {
    return this.prisma.basket.update({
      where: { id: basketId },
      data: { deletedAt: new Date() },
    });
  }

  async getBasketItemsWithProducts(basketId: number): Promise<(BasketItem & { product: Product })[]> {
    return this.prisma.basketItem.findMany({
      where: { basketId, deletedAt: null },
      include: { product: true },
    });
  }

  async findProduct(productId: number): Promise<Product | null> {
    return this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });
  }

  async removeProductFromAllBaskets(productId: number): Promise<void> {
    await this.prisma.basketItem.deleteMany({
      where: { productId },
    });
  }
}
