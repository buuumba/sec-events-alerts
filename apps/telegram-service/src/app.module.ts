import { Module } from '@nestjs/common';
import { ConfigsModule } from './configs/configs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [ConfigsModule, NotificationsModule, HealthModule],
})
export class AppModule {}
