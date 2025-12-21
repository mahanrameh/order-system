import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentRepository } from './repositories/payment.repository';
import { FakeIranBankAdapter } from './adapters/fake-iran-bank.adapter';
import { BankAdapter } from './adapters/bank.adapter';
import { MessagingModule } from 'libs/messaging/messaging.module';
import { RedisModule } from 'libs/redis/redis.module';
import { PrismaModule } from 'libs/prisma';
import { OrderRepository } from 'apps/orders/src/repositories/order.repository';

@Module({
  imports: [MessagingModule, RedisModule, PrismaModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentRepository,
    OrderRepository,
    { provide: BankAdapter, useClass: FakeIranBankAdapter },
    FakeIranBankAdapter,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
