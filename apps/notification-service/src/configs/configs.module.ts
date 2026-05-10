import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig, rabbitmqConfig } from '@app/shared';
import { appConfig } from './app.config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, rabbitmqConfig],
      envFilePath: '.env',
    }),
  ],
})
export class ConfigsModule {}
