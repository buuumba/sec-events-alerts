import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigFactory } from '@nestjs/config';
import { databaseConfig } from './database.config';
import { rabbitmqConfig } from './rabbitmq.config';

@Module({})
export class BaseConfigsModule {
  static register(configs: ConfigFactory[] = []): DynamicModule {
    return {
      module: BaseConfigsModule,
      global: true,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [databaseConfig, rabbitmqConfig, ...configs],
          envFilePath: '.env',
        }),
      ],
    };
  }
}
