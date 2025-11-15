import { NestFactory } from '@nestjs/core';
import { CatalogModule } from './catalog.module';
import { SwaggerConfigInit } from 'libs/configs/swagger.config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(CatalogModule);
  SwaggerConfigInit(app);
  app.use(cookieParser(process.env.COOKIE_SECRET));

  const port = Number(process.env.CATALOG_PORT) || 4002;
  await app.listen(port, () => {
    console.log(`http://localhost:${port}`);
    console.log(`swagger: http://localhost:${port}/swagger`);
  });
}
bootstrap();