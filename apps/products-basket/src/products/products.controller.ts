import { Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Get(':id')
  async getProduct(@Param('id') id: string) {
    return this.productService.getProduct(Number(id));
  }

  @Get()
  async listProducts() {
    return this.productService.listProducts();
  }
}
