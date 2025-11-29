import { Module } from '@nestjs/common';
import { ProductsBasketController } from './basket/products-basket.controller';
import { ProductsBasketService } from './basket/products-basket.service';
import { ProductsService } from './products/products.service';
import { ProductsController } from './products/products.controller';
import { PrismaModule } from 'libs/prisma';
import { RedisModule } from 'libs/redis/redis.module';
import { AuthModule } from '@app/auth';
import { ProductRepository } from './repositories/product.repository';
import { BasketRepository } from './repositories/basket.repository';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    AuthModule,
  ],
  controllers: [ProductsBasketController, ProductsController],
  providers: [
    ProductsBasketService,
    ProductsService,
    ProductRepository,
    BasketRepository
  ],
  exports: [ProductRepository, BasketRepository]
})
export class ProductsBasketModule {}