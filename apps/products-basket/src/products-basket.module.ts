import { Module } from '@nestjs/common';
import { ProductsBasketController } from './products-basket.controller';
import { ProductsBasketService } from './products-basket.service';

@Module({
  imports: [],
  controllers: [ProductsBasketController],
  providers: [ProductsBasketService],
})
export class ProductsBasketModule {}
