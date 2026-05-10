import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { SecurityEvent, RABBITMQ } from '@app/shared';
import { SecurityEventsHandlerService } from './security-events-handler.service';
import { createRetryErrorHandler } from './security-events.error-handler';

@Injectable()
export class SecurityEventsConsumer {
  constructor(private readonly handler: SecurityEventsHandlerService) {}

  @RabbitSubscribe({
    exchange: RABBITMQ.EXCHANGE,
    routingKey: RABBITMQ.ROUTING_KEY_WILDCARD,
    queue: RABBITMQ.QUEUE,
    errorHandler: createRetryErrorHandler,
  })
  async consume(event: SecurityEvent): Promise<void> {
    await this.handler.handle(event);
  }
}
