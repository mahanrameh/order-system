import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { NotificationEvent } from './events/notification.events';

@Injectable()
export class RabbitMqService {
  private readonly logger = new Logger(RabbitMqService.name);

  constructor(@Inject('RMQ_CLIENT') private readonly client: ClientProxy) {}

  async publish<T>(event: string, payload: T) {
    try {
      await lastValueFrom(this.client.emit(event, payload));
      this.logger.debug(`Published event "${event}" with payload: ${JSON.stringify(payload)}`);
    } catch (err) {
      this.logger.error(`Failed to publish event "${event}"`, err?.stack ?? err);
      throw err;
    }
  }

  async notify(userId: number, type: string, message: string) {
    const notification: NotificationEvent = { userId, type, message };
    await this.publish<NotificationEvent>('notification.event', notification);
  }
}
