import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SecurityEvent, SendNotificationDto } from '@app/shared';
import { NotificationSender } from '../../common/interfaces/notification-sender.interface';

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1_000;

@Injectable()
export class TelegramClientService implements NotificationSender {
  private readonly logger = new Logger(TelegramClientService.name);
  private readonly telegramServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.telegramServiceUrl = this.configService.getOrThrow<string>(
      'app.telegramServiceUrl',
    );
  }

  async send(event: SecurityEvent): Promise<void> {
    const dto = this.mapToDto(event);
    await this.sendWithRetry(dto);
  }

  private async sendWithRetry(dto: SendNotificationDto): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        await this.postNotification(dto);
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(
          `Telegram service unavailable, attempt ${attempt}/${MAX_ATTEMPTS}: ${lastError.message}`,
        );

        if (attempt < MAX_ATTEMPTS) {
          await this.delay(RETRY_DELAY_MS * attempt);
        }
      }
    }

    throw lastError ?? new Error('Failed to send notification after retries');
  }

  private async postNotification(dto: SendNotificationDto): Promise<void> {
    const url = `${this.telegramServiceUrl}/notifications/send`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Telegram service responded ${response.status}: ${errorText}`);
    }
  }

  private mapToDto(event: SecurityEvent): SendNotificationDto {
    const dto = new SendNotificationDto();
    dto.eventId = event.eventId;
    dto.type = event.type;
    dto.severity = event.severity;
    dto.userId = event.userId;
    dto.ip = event.ip;
    dto.metadata = event.metadata;
    dto.timestamp = event.timestamp;
    return dto;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
