import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { PrismaModule } from 'libs/prisma';
import { RedisModule } from 'libs/redis/redis.module';
import { ProductsBasketModule } from 'apps/products-basket/src/products-basket.module';
import { CatalogModule } from 'apps/catalog/src/catalog.module';
import { UserAuthModule } from 'apps/user-auth/src/user-auth.module';
import { AuthModule } from '@app/auth';
import { OrdersModule } from 'apps/orders/src/orders.module';
import { PaymentsModule } from 'apps/payments/src/payments.module';
import { MessagingModule } from 'libs/messaging';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
    }),
    PrismaModule,
    RedisModule,
    MessagingModule,
    AuthModule,            
    UserAuthModule,
    ProductsBasketModule,
    CatalogModule,
    OrdersModule,
    PaymentsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}