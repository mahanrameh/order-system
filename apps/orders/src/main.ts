import { NestFactory } from '@nestjs/core';
import { OrdersModule } from './orders.module';
import { SwaggerConfigInit } from 'libs/configs/swagger.config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(OrdersModule);
  SwaggerConfigInit(app);
  app.use(cookieParser(process.env.COOKIE_SECRET));

  const port = Number(process.env. ORDER_PORT) || 4005;
  await app.listen(port, () => {
    console.log(`http://localhost:${port}`);
    console.log(`swagger: http://localhost:${port}/swagger`);
  });
}
bootstrap();