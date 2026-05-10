import { Module } from '@nestjs/common';
import { ConfigsModule } from './configs/configs.module';
import { DatabaseModule } from './providers/database/database.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [ConfigsModule, DatabaseModule, AuthModule],
})
export class AppModule {}
