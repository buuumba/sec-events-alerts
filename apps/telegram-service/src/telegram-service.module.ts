import { Module } from '@nestjs/common';
import { TelegramServiceController } from './telegram-service.controller';
import { TelegramServiceService } from './telegram-service.service';

@Module({
  imports: [],
  controllers: [TelegramServiceController],
  providers: [TelegramServiceService],
})
export class TelegramServiceModule {}
