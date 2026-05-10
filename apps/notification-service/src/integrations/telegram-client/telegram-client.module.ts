import { Module } from '@nestjs/common';
import { NOTIFICATION_SENDER } from '../../common/interfaces/notification-sender.interface';
import { TelegramClientService } from './telegram-client.service';

@Module({
  providers: [
    {
      provide: NOTIFICATION_SENDER,
      useClass: TelegramClientService,
    },
  ],
  exports: [NOTIFICATION_SENDER],
})
export class TelegramClientModule {}
