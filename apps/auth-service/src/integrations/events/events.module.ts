import { Module } from '@nestjs/common';
import { RabbitmqModule } from '../../providers/rabbitmq/rabbitmq.module';
import { SecurityEventFactory } from './security-event.factory';
import { SecurityEventsPublisher } from './security-events.publisher';

@Module({
  imports: [RabbitmqModule],
  providers: [SecurityEventFactory, SecurityEventsPublisher],
  exports: [SecurityEventsPublisher],
})
export class EventsModule {}
