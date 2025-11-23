import { Injectable } from '@nestjs/common';
import { PrismaService } from 'libs/prisma';
import { RedisRateLimiterService } from '../../../../libs/redis/redis-rate-limiter.service';
import { RedisCacheService } from '../../../../libs/redis/redis-cache.service';
import { CartItem, CartState } from '../types/basket.type';

const CART_TTL_SECONDS = 6000;

@Injectable()
export class ProductsBasketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rateLimiter: RedisRateLimiterService,
    private readonly cache: RedisCacheService,
  ) {}

  async addToBasket(userId: number, productId: number, quantity = 1) {
    await this.guardRateLimit(userId);
    await this.ensureProductAvailable(productId, true);

    const cart = await this.getCartFromCache(userId);
    if (cart.items.some(i => i.productId === productId)) {
      throw new Error('Product already in basket. Use updateQuantity.');
    }

    cart.items.push({ productId, quantity });
    return this.recalculateAndCache(userId, cart);
  }

  async updateQuantity(userId: number, productId: number, quantity: number) {
    await this.guardRateLimit(userId);
    if (quantity <= 0) throw new Error('Quantity must be greater than 0');
    await this.ensureProductAvailable(productId);

    const cart = await this.getCartFromCache(userId);
    const item = cart.items.find(i => i.productId === productId);
    if (!item) throw new Error('Item not found in basket');

    item.quantity = quantity;
    return this.recalculateAndCache(userId, cart);
  }

  async removeFromBasket(userId: number, productId: number) {
    await this.guardRateLimit(userId);
    const cart = await this.getCartFromCache(userId);

    const nextItems = cart.items.filter(i => i.productId !== productId);
    if (nextItems.length === cart.items.length) throw new Error('Item not found in basket');

    cart.items = nextItems;
    return this.recalculateAndCache(userId, cart);
  }

  async clearBasket(userId: number) {
    await this.cache.del(this.cartKey(userId));
    return { message: 'Basket cleared' };
  }

  async getBasket(userId: number) {
    const cart = await this.getCartFromCache(userId);
    return this.recalculateAndCache(userId, cart);
  }

  async finalizeBasket(userId: number) {
    const cart = await this.getCartFromCache(userId);
    if (cart.items.length === 0) throw new Error('Basket is empty');

    let basket = await this.prisma.basket.findFirst({ where: { userId, deletedAt: null } });
    if (!basket) {
      basket = await this.prisma.basket.create({ data: { userId } });
    }

    await this.prisma.basketItem.updateMany({
      where: { basketId: basket.id, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    const itemsToCreate = cart.items.map(i => ({
      basketId: basket.id,
      productId: i.productId,
      quantity: i.quantity,
    }));

    if (itemsToCreate.length > 0) {
      await this.prisma.basketItem.createMany({ data: itemsToCreate });
    }

    const persisted = await this.prisma.basket.findFirst({
      where: { userId, deletedAt: null },
      include: { basketItems: { where: { deletedAt: null }, include: { product: true } } },
    });

    const totalPrice = (persisted?.basketItems ?? [])
      .reduce((sum, bi) => sum + this.getFinalPrice(bi.product) * bi.quantity, 0);

    return { ...persisted, totalPrice };
  }
 
  async deleteBasket(userId: number) {
    const basket = await this.prisma.basket.findFirst({ where: { userId, deletedAt: null } });
    if (!basket) throw new Error('Basket not found');

    await this.prisma.basketItem.updateMany({
      where: { basketId: basket.id, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    await this.prisma.basket.update({
      where: { id: basket.id },
      data: { deletedAt: new Date() },
    });

    await this.cache.del(this.cartKey(userId));

    return { message: 'Basket deleted' };
  }

  async listBaskets() {
    return this.prisma.basket.findMany({
      where: { deletedAt: null },
      include: { basketItems: { where: { deletedAt: null }, include: { product: true } } },
    });
  }

  private cartKey(userId: number) {
    return `basket:${userId}`;
  }

  private async guardRateLimit(userId: number) {
    const allowed = await this.rateLimiter.isAllowed(this.cartKey(userId), 100, 60);
    if (!allowed) throw new Error('Rate limit exceeded');
  }

  private async getCartFromCache(userId: number): Promise<CartState> {
    const raw: string | null = await this.cache.get(this.cartKey(userId));
    if (!raw) return { items: [], totalPrice: 0 };
    try {
      return JSON.parse(raw) as CartState;
    } catch {
      return { items: [], totalPrice: 0 };
    }
  }

  private getFinalPrice(product: { price: number; discount?: number }): number {
    const discount = product.discount ?? 0;
    return product.price * (1 - discount);
  }

  private async recalculateAndCache(userId: number, cart: CartState) {
    let sum = 0;
    for (const item of cart.items) {
      const product = await this.prisma.product.findFirst({
        where: { id: item.productId, deletedAt: null }, 
      });
      if (!product || product.status !== 'AVAILABLE') continue;
      sum += this.getFinalPrice(product) * item.quantity;
    }
    cart.totalPrice = sum;
    await this.cache.set(this.cartKey(userId), JSON.stringify(cart), CART_TTL_SECONDS);
    return cart;
  }

  private async ensureProductAvailable(productId: number, checkStock = false) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },  
    });
    if (!product || product.status !== 'AVAILABLE') {
      throw new Error('Product not available');
    }
    if (checkStock && product.stock <= 0) {
      throw new Error('Product out of stock');
    }
    return product;
  }
}
