import { Injectable } from '@nestjs/common';
import { PrismaService } from 'libs/prisma';
import { RefreshToken, Prisma } from 'libs/prisma/generated';

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createToken(data: Prisma.RefreshTokenCreateInput): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({ data });
  }

  async findByHash(hash: string): Promise<(RefreshToken & { user: any }) | null> {
    return this.prisma.refreshToken.findFirst({
      where: { tokenHash: hash, isRevoked: false, deletedAt: null },
      include: { user: true },
    });
  }

  async revokeToken(id: number): Promise<RefreshToken> {
    return this.prisma.refreshToken.update({
      where: { id },
      data: { isRevoked: true, deletedAt: new Date() },
    });
  }
}
