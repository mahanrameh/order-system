import { Injectable } from '@nestjs/common';
import { PrismaService } from 'libs/prisma/src/prisma.service';
import { NotificationType } from '../../../libs/prisma/generated';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, type: NotificationType, message: string) {
    return this.prisma.notification.create({
      data: {
        userId,
        type,
        message,
      },
    });
  }

  async findByUser(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId, deletedAt: null },
      orderBy: { sentAt: 'desc' },
    });
  }
}
