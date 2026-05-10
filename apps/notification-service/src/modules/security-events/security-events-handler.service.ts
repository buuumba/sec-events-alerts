import { Injectable, Logger } from '@nestjs/common';
import { SecurityEvent } from '@app/shared';
import { AlertMessageBuilder } from '../../integrations/telegram/alert-message.builder';
import { TelegramApiClient } from '../../integrations/telegram/telegram-api.client';
import { DeduplicationService } from './deduplication.service';

@Injectable()
export class SecurityEventsHandlerService {
  private readonly logger = new Logger(SecurityEventsHandlerService.name);

  constructor(
    private readonly deduplicationService: DeduplicationService,
    private readonly alertMessageBuilder: AlertMessageBuilder,
    private readonly telegramApiClient: TelegramApiClient,
  ) {}

  async handle(event: SecurityEvent): Promise<void> {
    if (await this.deduplicationService.isDuplicate(event.eventId)) {
      this.logger.warn(`Duplicate event skipped: ${event.eventId}`);
      return;
    }

    const message = this.alertMessageBuilder.buildMessage(event);
    await this.telegramApiClient.sendMessage(message);
    await this.deduplicationService.markProcessed(event.eventId);

    this.logger.log(
      `Processed [${event.type}] severity=${event.severity} eventId=${event.eventId}`,
    );
  }
}
