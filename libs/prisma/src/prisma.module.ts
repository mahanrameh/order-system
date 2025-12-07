import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaClient } from '@prisma/client';

// const PrismaClientProvider = {
//   provide: PrismaClient,
//   useFactory: () => {
//     return new PrismaClient();
//   },
// };

@Module({
  providers: [ PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
