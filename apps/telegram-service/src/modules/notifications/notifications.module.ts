import { Module } from '@nestjs/common';
import { AlertMessageBuilder } from './alert-message.builder';
import { TelegramApiClient } from './telegram-api.client';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';

@Module({
  providers: [AlertMessageBuilder, TelegramApiClient, NotificationsService],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
