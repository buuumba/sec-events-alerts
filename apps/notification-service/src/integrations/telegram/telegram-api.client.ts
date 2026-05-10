import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface TelegramSendMessageBody {
  readonly chat_id: string;
  readonly text: string;
  readonly parse_mode: 'Markdown';
}

@Injectable()
export class TelegramApiClient {
  private readonly logger = new Logger(TelegramApiClient.name);
  private readonly botToken: string;
  private readonly chatId: string;

  constructor(private readonly configService: ConfigService) {
    this.botToken = this.configService.getOrThrow<string>(
      'app.telegramBotToken',
    );
    this.chatId = this.configService.getOrThrow<string>('app.telegramChatId');
  }

  async sendMessage(text: string): Promise<void> {
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

    const body: TelegramSendMessageBody = {
      chat_id: this.chatId,
      text,
      parse_mode: 'Markdown',
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Telegram API error ${response.status}: ${errorText}`);
    }

    this.logger.log(`Message sent to chat ${this.chatId}`);
  }
}
