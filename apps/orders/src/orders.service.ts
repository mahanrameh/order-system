import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BasketRepository } from 'apps/products-basket/src/repositories/basket.repository';
import { ProductRepository } from 'apps/products-basket/src/repositories/product.repository';
import { OrderRepository } from './repositories/order.repository';
import { StockMovementRepository } from './repositories/stock-movement.repository';
import { OrderStatus } from 'libs/prisma/generated';
import { RedisLockService } from 'libs/redis/redis-lock.service';
import { StockMovementReason } from 'libs/prisma/generated';

@Injectable()
export class OrdersService {
  constructor(
    private readonly basketRepo: BasketRepository,
    private readonly productRepo: ProductRepository,
    private readonly orderRepo: OrderRepository,
    private readonly stockRepo: StockMovementRepository,
    private readonly redisLock: RedisLockService
  ) {}

  async createOrder(userId: number, address: string) {
    return this.redisLock.withLock(`basket:${userId}`, async () => {
      const basket = await this.basketRepo.findActiveBasketByUser(userId);
      if (!basket || basket.basketItems.length === 0) {
        throw new BadRequestException('Basket is empty');
      }

      const existingOrder = await this.orderRepo.findByBasketId(basket.id);
      if (existingOrder) return existingOrder;

      const { orderItemsData, totalAmount } = this.mapBasketItems(basket.basketItems);

      const order = await this.orderRepo.createOrder({
        userId,
        basketId: basket.id,
        address,
        totalAmount,
        status: OrderStatus.PENDING,
        orderItems: { create: orderItemsData },
      });

      await this.applyStockMovements(basket.basketItems, StockMovementReason.ORDER_PLACED);

      return order;
    });
  }

  async getOrder(id: number) {
    const order = await this.orderRepo.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async listAllOrders() {
    return this.orderRepo.listAll();
  }

  async listUserOrders(userId?: number) {
    return userId ? this.orderRepo.listByUser(userId) : this.orderRepo.listAll();
  }

  async updateOrderStatus(orderId: number, status: OrderStatus) {
    return this.orderRepo.updateStatus(orderId, status);
  }

  async cancelOrder(orderId: number) {
    const order = await this.getOrder(orderId);

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Completed orders cannot be cancelled');
    }

    await this.applyStockMovements(order.orderItems, StockMovementReason.ORDER_CANCELLED);

    return this.orderRepo.updateStatus(orderId, OrderStatus.CANCELLED);
  }







  private mapBasketItems(basketItems: any[]): { orderItemsData: any[]; totalAmount: number } {
    let totalAmount = 0;
    const orderItemsData = basketItems.map(bi => {
      const finalPrice = this.getFinalPrice(bi.product);
      totalAmount += finalPrice * bi.quantity;
      return { productId: bi.productId, quantity: bi.quantity, price: finalPrice };
    });
    return { orderItemsData, totalAmount };
  }

  private async applyStockMovements(items: any[], reason: StockMovementReason) {
    await Promise.all(
      items.map(item =>
        this.stockRepo.recordMovement(
          item.productId,
          reason === StockMovementReason.ORDER_PLACED ? -item.quantity : item.quantity,
          reason
        )
      )
    );

    await Promise.all(
      items.map(item =>
        reason === StockMovementReason.ORDER_PLACED
          ? this.productRepo.decrementStock(item.productId, item.quantity)
          : this.productRepo.incrementStock(item.productId, item.quantity)
      )
    );
  }

  private getFinalPrice(product: { price: number; discount?: number | null }): number {
    const discount = product.discount ?? 0;
    return product.price * (1 - discount);
  }
}
