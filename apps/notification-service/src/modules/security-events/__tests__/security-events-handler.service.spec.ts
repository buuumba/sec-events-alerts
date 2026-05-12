import { Test, TestingModule } from '@nestjs/testing';
import {
  SecurityEvent,
  SecurityEventType,
  EventSeverity,
} from '@app/shared';
import { SecurityEventsHandlerService } from '../security-events-handler.service';
import { DeduplicationService } from '../deduplication.service';
import { AlertMessageBuilder } from '../../../integrations/telegram/alert-message.builder';
import { TelegramApiClient } from '../../../integrations/telegram/telegram-api.client';

const mockEvent: SecurityEvent = {
  eventId: 'evt-uuid-1',
  type: SecurityEventType.LOGIN_FAILED,
  severity: EventSeverity.MEDIUM,
  userId: 'user-1',
  ip: '1.2.3.4',
  metadata: { email: 'test@test.com' },
  timestamp: '2026-05-13T00:00:00.000Z',
};

describe('SecurityEventsHandlerService', () => {
  let service: SecurityEventsHandlerService;
  let mockDedup: jest.Mocked<DeduplicationService>;
  let mockBuilder: jest.Mocked<AlertMessageBuilder>;
  let mockTelegram: jest.Mocked<TelegramApiClient>;

  beforeEach(async () => {
    mockDedup = {
      isDuplicate: jest.fn(),
      markProcessed: jest.fn(),
    } as unknown as jest.Mocked<DeduplicationService>;

    mockBuilder = {
      buildMessage: jest.fn().mockReturnValue('formatted alert'),
    } as unknown as jest.Mocked<AlertMessageBuilder>;

    mockTelegram = {
      sendMessage: jest.fn(),
    } as unknown as jest.Mocked<TelegramApiClient>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityEventsHandlerService,
        { provide: DeduplicationService, useValue: mockDedup },
        { provide: AlertMessageBuilder, useValue: mockBuilder },
        { provide: TelegramApiClient, useValue: mockTelegram },
      ],
    }).compile();

    service = module.get<SecurityEventsHandlerService>(
      SecurityEventsHandlerService,
    );
  });

  it('should skip duplicate events', async () => {
    mockDedup.isDuplicate.mockResolvedValue(true);

    await service.handle(mockEvent);

    expect(mockBuilder.buildMessage).not.toHaveBeenCalled();
    expect(mockTelegram.sendMessage).not.toHaveBeenCalled();
  });

  it('should build message, send to telegram, and mark as processed', async () => {
    mockDedup.isDuplicate.mockResolvedValue(false);

    await service.handle(mockEvent);

    expect(mockBuilder.buildMessage).toHaveBeenCalledWith(mockEvent);
    expect(mockTelegram.sendMessage).toHaveBeenCalledWith('formatted alert');
    expect(mockDedup.markProcessed).toHaveBeenCalledWith(mockEvent.eventId);
  });

  it('should not mark as processed if telegram fails', async () => {
    mockDedup.isDuplicate.mockResolvedValue(false);
    mockTelegram.sendMessage.mockRejectedValue(new Error('Telegram error'));

    await expect(service.handle(mockEvent)).rejects.toThrow('Telegram error');
    expect(mockDedup.markProcessed).not.toHaveBeenCalled();
  });
});
