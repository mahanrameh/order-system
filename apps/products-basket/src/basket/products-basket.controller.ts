import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ProductsBasketService } from './products-basket.service';

@Controller('basket')
export class ProductsBasketController {
  constructor(private readonly basketService: ProductsBasketService) {}

  @Post('add')
  async addToBasket(@Body('userId') userId: number, @Body('productId') productId: number) {
    return this.basketService.addToBasket(userId, productId);
  }

  @Get(':userId')
  async getBasket(@Param('userId') userId: string) {
    return this.basketService.getBasket(Number(userId));
  }
}
