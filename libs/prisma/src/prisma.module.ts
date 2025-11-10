import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaClient } from '@prisma/client';
import { prismaConfig } from './prisma.config';

const PrismaClientProvider = {
  provide: PrismaClient,
  useFactory: () => {
    return new PrismaClient(prismaConfig);
  },
};

@Module({
  providers: [PrismaClientProvider, PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
