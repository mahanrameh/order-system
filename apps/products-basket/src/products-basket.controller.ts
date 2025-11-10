import { Controller, Get } from '@nestjs/common';
import { ProductsBasketService } from './products-basket.service';

@Controller()
export class ProductsBasketController {
  constructor(private readonly productsBasketService: ProductsBasketService) {}

  @Get()
  getHello(): string {
    return this.productsBasketService.getHello();
  }
}
