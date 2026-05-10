import { Module } from '@nestjs/common';
import { RabbitmqModule } from '../../providers/rabbitmq/rabbitmq.module';
import { SecurityEventsPublisher } from './security-events.publisher';

@Module({
  imports: [RabbitmqModule],
  providers: [SecurityEventsPublisher],
  exports: [SecurityEventsPublisher],
})
export class EventsModule {}
