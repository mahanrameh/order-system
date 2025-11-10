import { NestFactory } from '@nestjs/core';
import { UserAuthModule } from './user-auth.module';

async function bootstrap() {
  const app = await NestFactory.create(UserAuthModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
