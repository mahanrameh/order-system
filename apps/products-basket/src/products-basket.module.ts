import { Module } from '@nestjs/common';
import { ProductsBasketController } from './basket/products-basket.controller';
import { ProductsBasketService } from './basket/products-basket.service';
import { ProductsService } from './products/products.service';
import { ProductsController } from './products/products.controller';

@Module({
  imports: [],
  controllers: [ProductsBasketController, ProductsController],
  providers: [ProductsBasketService, ProductsService],
})
export class ProductsBasketModule {}
