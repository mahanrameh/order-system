import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { NotificationEvent } from './events/notification.events';

@Injectable()
export class RabbitMqService {
  constructor(@Inject('RMQ_CLIENT') private readonly client: ClientProxy) {}

  async publish<T>(event: string, payload: T): Promise<void> {
    await lastValueFrom(this.client.emit(event, payload));
  }

  async notify(userId: number, type: string, message: string): Promise<void> {
    const notification: NotificationEvent = { userId, type, message };
    await this.publish<NotificationEvent>('notification.event', notification);
  }
}
