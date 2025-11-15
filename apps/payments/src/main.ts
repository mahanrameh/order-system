import { NestFactory } from '@nestjs/core';
import { PaymentsModule } from './payments.module';
import { SwaggerConfigInit } from 'libs/configs/swagger.config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(PaymentsModule);
  SwaggerConfigInit(app);
  app.use(cookieParser(process.env. COOKIE_SECRET));

  const port = Number(process.env.PAYMENT_PORT) || 4006;
  await app.listen(port, () => {
    console.log(`http://localhost:${port}`);
    console.log(`swagger: http://localhost:${port}/swagger`);
  });
}
bootstrap();