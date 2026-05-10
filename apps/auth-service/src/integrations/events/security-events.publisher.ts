import { Injectable, Logger } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { RABBITMQ } from '@app/shared';
import { SecurityEventFactory } from './security-event.factory';
import { CreateSecurityEventPayload } from './interfaces/create-security-event-payload.interface';

@Injectable()
export class SecurityEventsPublisher {
  private readonly logger = new Logger(SecurityEventsPublisher.name);

  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly eventFactory: SecurityEventFactory,
  ) {}

  async publish(payload: CreateSecurityEventPayload): Promise<void> {
    const event = this.eventFactory.create(payload);
    const routingKey = `${RABBITMQ.ROUTING_KEY_PREFIX}.${event.severity}`;

    await this.amqpConnection.publish(RABBITMQ.EXCHANGE, routingKey, event);

    this.logger.log(
      `Published [${event.type}] eventId=${event.eventId} routingKey=${routingKey}`,
    );
  }
}
