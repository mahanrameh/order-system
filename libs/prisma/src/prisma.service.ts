import { Injectable, OnModuleDestroy, OnModuleInit, Inject } from '@nestjs/common';
import { PrismaClient } from '../generated';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject(PrismaClient)
    private readonly prisma: PrismaClient,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.prisma.$connect();
    } catch (err) {
      throw err;
    }
  }

  get client() {
    return this.prisma;
  }

  async onModuleDestroy(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
