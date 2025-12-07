import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaService } from 'libs/prisma/src/prisma.service';
import { MessagingModule } from 'libs/messaging/messaging.module';

@Module({
  imports: [MessagingModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, PrismaService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
