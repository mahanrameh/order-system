import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from 'libs/prisma';
import { AuthModule } from '@app/auth';
import { RedisModule } from 'libs/redis/redis.module';
import { RedisLockService } from 'libs/redis/redis-lock.service';
import { ProductsBasketModule } from 'apps/products-basket/src/products-basket.module';
import { OrderRepository } from './repositories/order.repository';
import { StockMovementRepository } from './repositories/stock-movement.repository';
import { MessagingModule } from 'libs/messaging';
import { PaymentEventsConsumer } from './payment.events.consumer';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    RedisModule,
    ProductsBasketModule,
    MessagingModule,
  ],
  controllers: [OrdersController, PaymentEventsConsumer],
  providers: [
    OrdersService,
    RedisLockService,
    OrderRepository,
    StockMovementRepository,
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
