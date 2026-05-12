import { Test, TestingModule } from '@nestjs/testing';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  SecurityEventType,
  EventSeverity,
  RABBITMQ,
} from '@app/shared';
import {
  SecurityEventsPublisher,
  CreateSecurityEventPayload,
} from '../security-events.publisher';

describe('SecurityEventsPublisher', () => {
  let publisher: SecurityEventsPublisher;
  let mockAmqpConnection: jest.Mocked<AmqpConnection>;

  beforeEach(async () => {
    mockAmqpConnection = {
      publish: jest.fn(),
    } as unknown as jest.Mocked<AmqpConnection>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityEventsPublisher,
        { provide: AmqpConnection, useValue: mockAmqpConnection },
      ],
    }).compile();

    publisher = module.get<SecurityEventsPublisher>(SecurityEventsPublisher);
  });

  it('should publish event to correct exchange with severity-based routing key', async () => {
    await publisher.publish({
      type: SecurityEventType.BRUTE_FORCE_DETECTED,
      userId: 'user-1',
      ip: '1.2.3.4',
      metadata: { email: 'test@test.com' },
    });

    expect(mockAmqpConnection.publish).toHaveBeenCalledWith(
      RABBITMQ.EXCHANGE,
      `${RABBITMQ.ROUTING_KEY_PREFIX}.${EventSeverity.HIGH}`,
      expect.objectContaining({
        type: SecurityEventType.BRUTE_FORCE_DETECTED,
        severity: EventSeverity.HIGH,
        userId: 'user-1',
        ip: '1.2.3.4',
        metadata: { email: 'test@test.com' },
      }),
    );
  });

  it('should generate unique eventId and timestamp', async () => {
    await publisher.publish({
      type: SecurityEventType.LOGIN_FAILED,
      userId: 'user-1',
      metadata: { email: 'test@test.com' },
    });

    const publishedEvent = mockAmqpConnection.publish.mock.calls[0][2];
    expect(publishedEvent.eventId).toBeDefined();
    expect(publishedEvent.timestamp).toBeDefined();
  });

  it('should set userId to anonymous when not provided', async () => {
    await publisher.publish({
      type: SecurityEventType.LOGIN_FAILED,
      metadata: { email: 'unknown@test.com' },
    });

    const publishedEvent = mockAmqpConnection.publish.mock.calls[0][2];
    expect(publishedEvent.userId).toBe('anonymous');
  });

  it.each([
    [SecurityEventType.LOGIN_FAILED, EventSeverity.MEDIUM],
    [SecurityEventType.BRUTE_FORCE_DETECTED, EventSeverity.HIGH],
    [SecurityEventType.SUSPICIOUS_IP, EventSeverity.MEDIUM],
    [SecurityEventType.PASSWORD_CHANGED, EventSeverity.LOW],
    [SecurityEventType.ADMIN_LOGIN, EventSeverity.MEDIUM],
    [SecurityEventType.ACCOUNT_LOCKED, EventSeverity.CRITICAL],
  ])('should map %s to severity %s', async (eventType, expectedSeverity) => {
    const metadata =
      eventType === SecurityEventType.ACCOUNT_LOCKED
        ? { email: 'test@test.com', reason: 'test' }
        : { email: 'test@test.com' };

    await publisher.publish({
      type: eventType,
      userId: 'user-1',
      metadata,
    } as CreateSecurityEventPayload);

    const routingKey = mockAmqpConnection.publish.mock.calls[0][1];
    expect(routingKey).toBe(`security.${expectedSeverity}`);

    mockAmqpConnection.publish.mockClear();
  });
});
