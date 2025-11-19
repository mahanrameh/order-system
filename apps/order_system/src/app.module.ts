import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { PrismaModule } from 'libs/prisma';
import { RedisModule } from 'libs/redis/redis.module';
import { ProductsBasketModule } from 'apps/products-basket/src/products-basket.module';
import { CatalogModule } from 'apps/catalog/src/catalog.module';
import { UserAuthModule } from 'apps/user-auth/src/user-auth.module';
import { AuthModule } from '@app/auth';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
    }),
    PrismaModule,
    RedisModule,
    AuthModule,            
    UserAuthModule,
    ProductsBasketModule,
    CatalogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}