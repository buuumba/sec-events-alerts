import { Module } from '@nestjs/common';
import { RabbitmqModule } from '../providers/rabbitmq/rabbitmq.module';
import { HealthController } from './health.controller';

@Module({
  imports: [RabbitmqModule],
  controllers: [HealthController],
})
export class HealthModule {}
