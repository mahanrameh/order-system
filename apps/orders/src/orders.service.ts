import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BasketRepository } from 'apps/products-basket/src/repositories/basket.repository';
import { ProductRepository } from 'apps/products-basket/src/repositories/product.repository';
import { OrderRepository } from './repositories/order.repository';
import { StockMovementRepository } from './repositories/stock-movement.repository';
import { OrderStatus, StockMovementReason } from 'libs/prisma/generated';
import { RedisLockService } from 'libs/redis/redis-lock.service';
import { RabbitMqService } from 'libs/messaging';
import { OrderCreatedEvent, OrderCancelledEvent, OrderCompletedEvent, OrderFailedEvent } from 'libs/messaging/events/order.events';

@Injectable()
export class OrdersService {
  constructor(
    private readonly basketRepo: BasketRepository,
    private readonly productRepo: ProductRepository,
    private readonly orderRepo: OrderRepository,
    private readonly stockRepo: StockMovementRepository,
    private readonly redisLock: RedisLockService,
    private readonly events: RabbitMqService,
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

      const event: OrderCreatedEvent = {
        orderId: order.id,
        userId: order.userId,
        totalAmount: order.totalAmount,
      };
      await this.events.publish<OrderCreatedEvent>('order.created', event);

      await this.events.notify(
        order.userId,
        'EMAIL',
        `Your order #${order.id} has been created with total ${order.totalAmount}.`
      );

      return order;
    });
  }

  async getOrder(id: number) {
    const order = await this.orderRepo.findById(id);
    if (!order) throw new BadRequestException('Order not found');
    return order;
  }

  async listAllOrders() {
    return this.orderRepo.listAll();
  }

  async listUserOrders(userId?: number) {
    return userId ? this.orderRepo.listByUser(userId) : this.orderRepo.listAll();
  }

  async updateOrderStatus(orderId: number, status: OrderStatus) {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new BadRequestException('Order not found');
    if (order.status === status) return order;

    const updated = await this.orderRepo.updateStatus(orderId, status);


    if (status === OrderStatus.COMPLETED) {
      const event: OrderCompletedEvent = {
        orderId: updated.id,
        userId: updated.userId,
        totalAmount: updated.totalAmount,
      };
      await this.events.publish<OrderCompletedEvent>('order.completed', event);
    } else if (status === OrderStatus.FAILED) {
      const event: OrderFailedEvent = {
        orderId: updated.id,
        userId: updated.userId,
        totalAmount: updated.totalAmount,
        reason: 'Payment failed',
      };
      await this.events.publish<OrderFailedEvent>('order.failed', event);
    }

    return updated;
  }

  async cancelOrder(orderId: number) {
    const order = await this.getOrder(orderId);

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Completed orders cannot be cancelled');
    }

    await this.applyStockMovements(order.orderItems, StockMovementReason.ORDER_CANCELLED);

    const updated = await this.orderRepo.updateStatus(orderId, OrderStatus.CANCELLED);

    const event: OrderCancelledEvent = {
      orderId: updated.id,
      userId: updated.userId,
      totalAmount: updated.totalAmount,
    };
    await this.events.publish<OrderCancelledEvent>('order.cancelled', event);

    return updated;
  }


  async onPaymentCompleted(orderId: number) {

    return this.redisLock.withLock(`order:status:${orderId}`, async () => {
      const order = await this.orderRepo.findById(orderId);
      if (!order) throw new BadRequestException('Order not found');
      if (order.status === OrderStatus.COMPLETED) return order; 

      const updated = await this.orderRepo.updateStatus(orderId, OrderStatus.COMPLETED);
      return updated;
    });
  }

  async onPaymentFailed(orderId: number) {
    return this.redisLock.withLock(`order:status:${orderId}`, async () => {
      const order = await this.orderRepo.findById(orderId);
      if (!order) throw new BadRequestException('Order not found');
      if (order.status === OrderStatus.FAILED) return order; 

      await this.applyStockMovements(order.orderItems, StockMovementReason.ORDER_CANCELLED);

      const updated = await this.orderRepo.updateStatus(orderId, OrderStatus.FAILED);
      return updated;
    });
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
          reason,
        ),
      ),
    );

    await Promise.all(
      items.map(item =>
        reason === StockMovementReason.ORDER_PLACED
          ? this.productRepo.decrementStock(item.productId, item.quantity)
          : this.productRepo.incrementStock(item.productId, item.quantity),
      ),
    );
  }

  private getFinalPrice(product: { price: number; discount?: number | null }): number {
    const discount = product.discount ?? 0;
    return product.price * (1 - discount);
  }
}
