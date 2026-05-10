import { Injectable, Logger } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { randomUUID } from 'crypto';
import {
  EventSeverity,
  RABBITMQ,
  SecurityEvent,
  SecurityEventType,
  SecurityEventMetadataMap,
} from '@app/shared';

export interface CreateSecurityEventPayload<
  T extends SecurityEventType = SecurityEventType,
> {
  readonly type: T;
  readonly userId?: string;
  readonly ip?: string;
  readonly metadata: SecurityEventMetadataMap[T];
}

const SEVERITY_MAP: Record<SecurityEventType, EventSeverity> = {
  [SecurityEventType.LOGIN_FAILED]: EventSeverity.MEDIUM,
  [SecurityEventType.BRUTE_FORCE_DETECTED]: EventSeverity.HIGH,
  [SecurityEventType.SUSPICIOUS_IP]: EventSeverity.MEDIUM,
  [SecurityEventType.PASSWORD_CHANGED]: EventSeverity.LOW,
  [SecurityEventType.ADMIN_LOGIN]: EventSeverity.MEDIUM,
  [SecurityEventType.ACCOUNT_LOCKED]: EventSeverity.CRITICAL,
};

function createSecurityEvent<T extends SecurityEventType>(
  payload: CreateSecurityEventPayload<T>,
): SecurityEvent<T> {
  return {
    eventId: randomUUID(),
    type: payload.type,
    severity: SEVERITY_MAP[payload.type],
    userId: payload.userId ?? 'anonymous',
    ip: payload.ip,
    metadata: payload.metadata,
    timestamp: new Date().toISOString(),
  };
}

@Injectable()
export class SecurityEventsPublisher {
  private readonly logger = new Logger(SecurityEventsPublisher.name);

  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publish<T extends SecurityEventType>(
    payload: CreateSecurityEventPayload<T>,
  ): Promise<void> {
    const event = createSecurityEvent(payload);
    const routingKey = `${RABBITMQ.ROUTING_KEY_PREFIX}.${event.severity}`;

    await this.amqpConnection.publish(RABBITMQ.EXCHANGE, routingKey, event);

    this.logger.log(
      `Published [${event.type}] eventId=${event.eventId} routingKey=${routingKey}`,
    );
  }
}
