import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitmqModule } from '../../providers/rabbitmq/rabbitmq.module';
import { ProcessedEvent } from './entities/processed-event.entity';
import { DeduplicationService } from './deduplication.service';
import { SecurityEventsHandlerService } from './security-events-handler.service';
import { SecurityEventsConsumer } from './security-events.consumer';

@Module({
  imports: [RabbitmqModule, TypeOrmModule.forFeature([ProcessedEvent])],
  providers: [DeduplicationService, SecurityEventsHandlerService, SecurityEventsConsumer],
  exports: [SecurityEventsHandlerService],
})
export class SecurityEventsModule {}
