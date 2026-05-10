import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './app.config';
import { databaseConfig } from './database.config';
import { rabbitmqConfig } from './rabbitmq.config';

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
