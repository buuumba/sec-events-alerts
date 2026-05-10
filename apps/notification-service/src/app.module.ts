import { Module } from '@nestjs/common';
import { ConfigsModule } from './configs/configs.module';
import { DatabaseModule } from './providers/database/database.module';
import { SecurityEventsModule } from './modules/security-events/security-events.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [ConfigsModule, DatabaseModule, SecurityEventsModule, HealthModule],
})
export class AppModule {}
