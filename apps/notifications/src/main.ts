import { NestFactory } from '@nestjs/core';
import { NotificationsModule } from './notifications.module';
import { SwaggerConfigInit } from 'libs/configs/swagger.config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(NotificationsModule);
  SwaggerConfigInit(app);
  app.use(cookieParser(process.env.COOKIE_SECRET));

  const port = Number(process.env.NOTIFICATION_PORT) || 4001;
  await app.listen(port, () => {
    console.log(`http://localhost:${port}`);
    console.log(`swagger: http://localhost:${port}/swagger`);
  });
}
bootstrap();