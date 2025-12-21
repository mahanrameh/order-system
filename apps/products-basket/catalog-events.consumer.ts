import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { BasketRepository } from './src/repositories/basket.repository';
import type { ProductStockChangedEvent } from 'libs/messaging/events/product.events';

@Controller()
export class CatalogEventsConsumer {
  private readonly logger = new Logger(CatalogEventsConsumer.name);

  constructor(private readonly basketRepo: BasketRepository) {}

  @EventPattern('product.stock.changed')
  async handleStockChanged(@Payload() event: ProductStockChangedEvent) {
    this.logger.log(
      `Stock change: product=${event.productId}, stock=${event.newStock}, status=${event.status}`,
    );

    if (event.status === 'OUT_OF_STOCK' || event.newStock <= 0) {
      await this.basketRepo.removeProductFromAllBaskets(event.productId);
      this.logger.warn(`Removed product #${event.productId} from all baskets (out of stock).`);
    }
  }
}