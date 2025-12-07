import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisRateLimiterService {
  constructor(@Inject('REDIS_CLIENT') private redis: Redis) {}

  async isAllowed(key: string, limit: number, ttl: number): Promise<boolean> {
    const current = await this.redis.incr(key);
    if (current === 1) {
      await this.redis.expire(key, ttl); 
    }
    return current <= limit;
  }
}
