import { Injectable } from '@nestjs/common';
import { RedisRateLimiterService } from '../../../../libs/redis/redis-rate-limiter.service';
import { RedisCacheService } from '../../../../libs/redis/redis-cache.service';
import { CartItem, CartState } from '../types/basket.type';
import { BasketRepository } from '../repositories/basket.repository';
import { RabbitMqService } from 'libs/messaging';

const CART_TTL_SECONDS = 6000;

@Injectable()
export class ProductsBasketService {
  constructor(
    private readonly basketRepo: BasketRepository,
    private readonly rateLimiter: RedisRateLimiterService,
    private readonly cache: RedisCacheService,
    private readonly events: RabbitMqService
  ) {}

  async addToBasket(userId: number, productId: number, quantity = 1) {
    await this.guardRateLimit(userId);

    await this.ensureProductAvailable(productId, quantity);

    let basket = await this.basketRepo.findBasketByUser(userId);
    if (!basket) basket = await this.basketRepo.createBasket(userId);

    const existing = await this.basketRepo.findBasketItem(basket.id, productId);
    if (existing) throw new Error('Product already in basket. Use updateQuantity.');

    await this.basketRepo.createBasketItem(basket.id, productId, quantity);

    const cart = await this.buildCartFromDb(basket.id);

    await this.events.notify(
      userId,
      'EMAIL',
      `Product #${productId} added to your basket.`
    );
    return this.recalculateAndCache(userId, cart);
  }

  async updateQuantity(userId: number, productId: number, quantity: number) {
    await this.guardRateLimit(userId);
    if (quantity <= 0) throw new Error('Quantity must be greater than 0');

    await this.ensureProductAvailable(productId, quantity);

    let basket = await this.basketRepo.findBasketByUser(userId);
    if (!basket) basket = await this.basketRepo.createBasket(userId);

    const item = await this.basketRepo.findBasketItem(basket.id, productId);
    if (!item) throw new Error('Item not found in basket');

    await this.basketRepo.updateBasketItemQuantity(item.id, quantity);

    const cart = await this.buildCartFromDb(basket.id);

    await this.events.notify(
      userId,
      'EMAIL',
      `Quantity for product #${productId} updated to ${quantity} in your basket.`
    );

    return this.recalculateAndCache(userId, cart);
  }

  async removeFromBasket(userId: number, productId: number) {
    await this.guardRateLimit(userId);
    const basket = await this.ensureBasket(userId);

    const item = await this.basketRepo.findBasketItem(basket.id, productId);
    if (!item) throw new Error('Item not found in basket');

    await this.basketRepo.softDeleteBasketItem(item.id);

    const cart = await this.buildCartFromDb(basket.id);

    await this.events.notify(
      userId,
      'EMAIL',
      `Product #${productId} removed from your basket.`
    );    

    return this.recalculateAndCache(userId, cart);
  }

  async clearBasket(userId: number) {
    const basket = await this.ensureBasket(userId);
    await this.basketRepo.softDeleteAllItems(basket.id);
    await this.cache.del(this.cartKey(userId));

    await this.events.notify(
      userId,
      'EMAIL',
      `Your basket has been cleared.`
    );

    return { message: 'Basket cleared' };
  }

  async getBasket(userId: number) {
    const basket = await this.ensureBasket(userId);
    const cart = await this.buildCartFromDb(basket.id);
    return this.recalculateAndCache(userId, cart);
  }

  async deleteBasket(userId: number) {
    const basket = await this.basketRepo.findBasketByUser(userId);
    if (!basket) throw new Error('Basket not found');

    await this.basketRepo.softDeleteAllItems(basket.id);
    await this.basketRepo.softDeleteBasket(basket.id);

    await this.cache.del(this.cartKey(userId));

    await this.events.notify(
      userId,
      'EMAIL',
      `Your basket has been deleted.`
    );

    return { message: 'Basket deleted' };
  }





  private cartKey(userId: number) {
    return `basket:${userId}`;
  }

  private async guardRateLimit(userId: number) {
    const allowed = await this.rateLimiter.isAllowed(this.cartKey(userId), 100, 60);
    if (!allowed) throw new Error('Rate limit exceeded');
  }

  private async ensureBasket(userId: number) {
    let basket = await this.basketRepo.findBasketByUser(userId);
    if (!basket) basket = await this.basketRepo.createBasket(userId);
    return basket;
  }

  private async buildCartFromDb(basketId: number): Promise<CartState> {
    const items = await this.basketRepo.getBasketItemsWithProducts(basketId);

    const cartItems: CartItem[] = items.map(i => ({
      productId: i.productId,
      quantity: i.quantity,
    }));

    const totalPrice = items.reduce(
      (sum, i) => sum + this.getFinalPrice(i.product) * i.quantity,
      0,
    );

    return { items: cartItems, totalPrice };
  }

  private getFinalPrice(product: { price: number; discount?: number | null }): number {
    const discount = product.discount ?? 0;
    return product.price * (1 - discount);
  }

  private async recalculateAndCache(userId: number, cart: CartState) {
    await this.cache.set(this.cartKey(userId), JSON.stringify(cart), CART_TTL_SECONDS);
    return cart;
  }


  private async ensureProductAvailable(productId: number, requestedQuantity: number) {
    const product = await this.basketRepo.findProduct(productId);
    if (!product || product.status !== 'AVAILABLE') {
      throw new Error('Product not available');
    }
    if (product.stock < requestedQuantity) {
      throw new Error(`Only ${product.stock} items available`);
    }
    return product;
  }
}
