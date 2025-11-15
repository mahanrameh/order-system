import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import Redis from 'ioredis';
import { RedisCacheService } from './redis-cache.service';
import { RedisRateLimiterService } from './redis-rate-limiter.service';
import { RedisLockService } from './redis-lock.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: () => ({
        store: redisStore,
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
        ttl: Number(process.env.REDIS_TTL ?? 60),
      }),
    }),
  ],
  providers: [
    RedisCacheService,
    RedisRateLimiterService,
    RedisLockService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => new Redis({
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
      }),
    },
  ],
  exports: [RedisCacheService, RedisRateLimiterService, RedisLockService, 'REDIS_CLIENT'],
})
export class RedisModule {}
