import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import type { PaymentCompletedEvent, PaymentFailedEvent } from 'libs/messaging/events/payment.events';
import { OrderStatus } from 'libs/prisma/generated';

@Controller()
export class PaymentEventsConsumer {
  constructor(private readonly orders: OrdersService) {}

  @EventPattern('payment.completed')
  async handlePaymentCompleted(@Payload() event: PaymentCompletedEvent) {
    await this.orders.onPaymentCompleted(event.orderId);
  }

  @EventPattern('payment.failed')
  async handlePaymentFailed(@Payload() event: PaymentFailedEvent) {
    await this.orders.onPaymentFailed(event.orderId);
  }
}
