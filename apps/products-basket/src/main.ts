import { NestFactory } from '@nestjs/core';
import { ProductsBasketModule } from './products-basket.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(ProductsBasketModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
