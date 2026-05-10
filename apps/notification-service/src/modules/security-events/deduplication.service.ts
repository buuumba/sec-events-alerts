import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessedEvent } from './entities/processed-event.entity';

@Injectable()
export class DeduplicationService {
  private readonly logger = new Logger(DeduplicationService.name);

  constructor(
    @InjectRepository(ProcessedEvent)
    private readonly repository: Repository<ProcessedEvent>,
  ) {}

  async isDuplicate(eventId: string): Promise<boolean> {
    const count = await this.repository.countBy({ eventId });
    return count > 0;
  }

  async markProcessed(eventId: string): Promise<void> {
    await this.repository.save({ eventId });
    this.logger.log(`Event marked as processed — eventId=${eventId}`);
  }
}
