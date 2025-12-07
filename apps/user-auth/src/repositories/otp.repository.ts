import { Injectable } from '@nestjs/common';
import { PrismaService } from 'libs/prisma';
import { Otp, Prisma } from 'libs/prisma/generated';

@Injectable()
export class OtpRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userId: number): Promise<Otp | null> {
    return this.prisma.otp.findFirst({ where: { userId, deletedAt: null } });
  }

  async updateOtp(id: number, data: Prisma.OtpUpdateInput): Promise<Otp> {
    return this.prisma.otp.update({ where: { id }, data });
  }

  async createOtp(data: Prisma.OtpCreateInput): Promise<Otp> {
    return this.prisma.otp.create({ data });
  }

  async findByUserPhone(phoneNumber: string): Promise<Otp | null> {
    return this.prisma.otp.findFirst({
      where: { phoneNumber, deletedAt: null },
    });
  }

  async markVerified(id: number): Promise<Otp> {
    return this.prisma.otp.update({
      where: { id },
      data: { isVerified: true },
    });
  }
}
