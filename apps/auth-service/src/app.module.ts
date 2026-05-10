import { Module } from '@nestjs/common';
import { ConfigsModule } from './configs/configs.module';
import { DatabaseModule } from './providers/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { EventsModule } from './integrations/events/events.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [ConfigsModule, DatabaseModule, AuthModule, EventsModule, HealthModule],
})
export class AppModule {}
