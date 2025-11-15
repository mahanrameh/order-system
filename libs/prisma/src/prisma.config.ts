import { Prisma } from '@prisma/client';

export const prismaConfig: Prisma.PrismaClientOptions = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'info', 'warn', 'error'], 
  errorFormat: 'pretty', 
};