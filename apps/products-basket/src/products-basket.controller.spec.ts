import { Test, TestingModule } from '@nestjs/testing';
import { ProductsBasketController } from './products-basket.controller';
import { ProductsBasketService } from './products-basket.service';

describe('ProductsBasketController', () => {
  let productsBasketController: ProductsBasketController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProductsBasketController],
      providers: [ProductsBasketService],
    }).compile();

    productsBasketController = app.get<ProductsBasketController>(ProductsBasketController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(productsBasketController.getHello()).toBe('Hello World!');
    });
  });
});
