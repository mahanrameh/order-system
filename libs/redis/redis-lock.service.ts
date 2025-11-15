import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import Redlock from 'redlock';

@Injectable()
export class RedisLockService {
  private redlock: Redlock;

  constructor(@Inject('REDIS_CLIENT') private client: Redis) {
    this.redlock = new Redlock([this.client], {
      retryCount: 3,
      retryDelay: 200,
    });
  }

  async withLock(resource: string, fn: () => Promise<any>) {
    const lock = await this.redlock.acquire([`locks:${resource}`], 1000);
    try {
      return await fn();
    } finally {
      await lock.release();
    }
  }
}
