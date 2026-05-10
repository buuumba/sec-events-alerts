import { Module } from '@nestjs/common';
import { AlertMessageBuilder } from './alert-message.builder';
import { TelegramApiClient } from './telegram-api.client';

@Module({
  providers: [AlertMessageBuilder, TelegramApiClient],
  exports: [AlertMessageBuilder, TelegramApiClient],
})
export class TelegramModule {}
