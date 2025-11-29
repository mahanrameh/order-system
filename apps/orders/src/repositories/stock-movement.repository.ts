import { Injectable } from '@nestjs/common';
import { PrismaService } from 'libs/prisma';
import { StockMovementReason } from 'libs/prisma/generated'; 

@Injectable()
export class StockMovementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async recordMovement(
    productId: number,
    change: number,
    reason: StockMovementReason, 
  ) {
    return this.prisma.stockMovement.create({
      data: { productId, change, reason },
    });
  }
}
