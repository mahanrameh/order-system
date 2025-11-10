import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsBasketService {
  getHello(): string {
    return 'Hello World!';
  }
}
