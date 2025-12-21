import { NestFactory } from '@nestjs/core';
import { ProductsBasketModule } from './products-basket.module';
import { Transport } from '@nestjs/microservices';
import * as cookieParser from 'cookie-parser';
import { SwaggerConfigInit } from 'libs/configs/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(ProductsBasketModule);
  SwaggerConfigInit(app);
  app.use(cookieParser(process.env.COOKIE_SECRET));

  const port = Number(process.env.BASKET_PORT) || 4003;
  await app.listen(port, () => {
    console.log(`http://localhost:${port}`);
    console.log(`swagger: http://localhost:${port}/swagger`);
  });

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'events.queue',
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();
}
bootstrap();