import { Module } from '@nestjs/common';
import { ConfigsModule } from './configs/configs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [ConfigsModule, NotificationsModule],
})
export class AppModule {}
