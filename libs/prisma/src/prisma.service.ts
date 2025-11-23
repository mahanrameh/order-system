import { Injectable, OnModuleDestroy, OnModuleInit, Inject } from '@nestjs/common';
import { PrismaClient } from '../generated/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // constructor(
  //   // @Inject(PrismaClient)
  //   // private readonly prisma: PrismaClient,
  // ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
    } catch (err) {
      throw err;
    }
  }

  get client() {
    return this;
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
