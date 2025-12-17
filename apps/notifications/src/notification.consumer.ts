import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import type { NotificationEvent } from 'libs/messaging/events/notification.events';
import { NotificationType } from 'libs/prisma/generated';

@Controller()
export class NotificationConsumer {
  constructor(private readonly notifications: NotificationsService) {}

  @EventPattern('notification.event')
  async handleNotification(@Payload() event: NotificationEvent) {
    await this.notifications.create(event.userId, event.type as NotificationType, event.message);
    console.log(`Notification persisted for user ${event.userId}: ${event.message}`);
  }
}
