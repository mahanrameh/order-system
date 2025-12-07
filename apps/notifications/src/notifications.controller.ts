import { Controller, Get, Param } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { NotificationType } from '../../../libs/prisma/generated';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationsService) {}

  @EventPattern('notification.event')
  async handleNotification(@Payload() data: { userId: number; type: string; message: string }) {
    await this.notificationService.create(
      data.userId,
      data.type as NotificationType,
      data.message,
    );
    console.log(`Notification stored for user ${data.userId}: ${data.message}`);
  }

  @Get(':userId')
  async getUserNotifications(@Param('userId') userId: number) {
    return this.notificationService.findByUser(Number(userId));
  }
}
