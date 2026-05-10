import { Injectable, Logger } from '@nestjs/common';
import { SecurityEvent } from '@app/shared';
import { DeduplicationService } from './deduplication.service';

@Injectable()
export class SecurityEventsHandlerService {
  private readonly logger = new Logger(SecurityEventsHandlerService.name);

  constructor(private readonly deduplicationService: DeduplicationService) {}

  async handle(event: SecurityEvent): Promise<void> {
    if (await this.deduplicationService.isDuplicate(event.eventId)) {
      this.logger.warn(`Duplicate event skipped: ${event.eventId}`);
      return;
    }

    await this.deduplicationService.markProcessed(event.eventId);

    this.logger.log(
      `Processed [${event.type}] severity=${event.severity} eventId=${event.eventId}`,
    );
  }
}
