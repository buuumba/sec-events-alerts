import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { SecurityEvent, RABBITMQ } from '@app/shared';
import { SecurityEventsHandlerService } from './security-events-handler.service';
import { createRetryErrorHandler } from './security-events.error-handler';

@Injectable()
export class SecurityEventsConsumer {
  private readonly logger = new Logger(SecurityEventsConsumer.name);

  constructor(private readonly handler: SecurityEventsHandlerService) {}

  @RabbitSubscribe({
    exchange: RABBITMQ.EXCHANGE,
    routingKey: RABBITMQ.ROUTING_KEY_WILDCARD,
    queue: RABBITMQ.QUEUE,
    queueOptions: {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': RABBITMQ.DLX,
      },
    },
    errorHandler: createRetryErrorHandler,
  })
  async consume(event: SecurityEvent): Promise<void> {
    this.logger.log(
      `Event received — type=${event.type} severity=${event.severity} eventId=${event.eventId}`,
    );
    await this.handler.handle(event);
  }
}
