import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TelegramApiClient } from '../telegram-api.client';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('TelegramApiClient', () => {
  let client: TelegramApiClient;

  beforeEach(async () => {
    const mockConfigService = {
      getOrThrow: jest.fn((key: string) => {
        const config: Record<string, string> = {
          'app.telegramBotToken': 'test-bot-token',
          'app.telegramChatId': '@test_chat',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelegramApiClient,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    client = module.get<TelegramApiClient>(TelegramApiClient);
    mockFetch.mockReset();
  });

  it('should call Telegram API with correct parameters', async () => {
    mockFetch.mockResolvedValue({ ok: true });

    await client.sendMessage('Hello');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.telegram.org/bottest-bot-token/sendMessage',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          chat_id: '@test_chat',
          text: 'Hello',
          parse_mode: 'Markdown',
        }),
      }),
    );
  });

  it('should throw on non-ok response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 403,
      text: jest.fn().mockResolvedValue('Forbidden'),
    });

    await expect(client.sendMessage('Hello')).rejects.toThrow(
      'Telegram API error 403: Forbidden',
    );
  });
});
