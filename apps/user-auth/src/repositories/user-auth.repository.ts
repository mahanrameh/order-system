import { Injectable } from '@nestjs/common';
import { PrismaService } from 'libs/prisma';
import { User, Basket } from 'libs/prisma/generated';

@Injectable()
export class UserAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: any): Promise<User & { basket: Basket | null }> {
    return this.prisma.user.create({
      data,
      include: { basket: true },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email, deletedAt: null },
      include: { basket: true }, 
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { phone, deletedAt: null } });
  }
}