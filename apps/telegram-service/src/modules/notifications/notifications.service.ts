import { Injectable, Logger } from '@nestjs/common';
import { SendNotificationDto } from '@app/shared';
import { AlertMessageBuilder } from './alert-message.builder';
import { TelegramApiClient } from './telegram-api.client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly alertMessageBuilder: AlertMessageBuilder,
    private readonly telegramApiClient: TelegramApiClient,
  ) {}

  async sendAlert(dto: SendNotificationDto): Promise<void> {
    const message = this.alertMessageBuilder.buildMessage(dto);

    await this.telegramApiClient.sendAlert(message);

    this.logger.log(
      `Alert sent: type=${dto.type} severity=${dto.severity} eventId=${dto.eventId}`,
    );
  }
}
