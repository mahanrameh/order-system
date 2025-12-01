import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentRepository } from './repositories/payment.repository';
import { FakeIranBankAdapter } from './fake-iran-bank.adapter';
import { MessagingModule } from 'libs/messaging/messaging.module';
import { RedisModule } from 'libs/redis/redis.module';
import { PrismaModule } from 'libs/prisma';

@Module({
  imports: [
    MessagingModule,
    RedisModule,
    PrismaModule
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentRepository, FakeIranBankAdapter],
  exports: [PaymentsService],
})
export class PaymentsModule {}
