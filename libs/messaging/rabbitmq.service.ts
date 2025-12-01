import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class RabbitMqService {
  constructor(@Inject('RMQ_CLIENT') private readonly client: ClientProxy) {}

  async publish<T>(event: string, payload: T): Promise<void> {
    await lastValueFrom(this.client.emit(event, payload));
  }
}
