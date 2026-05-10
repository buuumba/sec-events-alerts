import { Module } from '@nestjs/common';
import { BaseConfigsModule } from '@app/shared';
import { appConfig } from './app.config';

@Module({
  imports: [BaseConfigsModule.register([appConfig])],
})
export class ConfigsModule {}
