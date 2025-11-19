import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { PrismaModule } from 'libs/prisma';
import { RedisModule } from 'libs/redis/redis.module';
import { AuthModule } from '@app/auth'; // 👈 shared auth module

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    AuthModule, 
  ],
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}
