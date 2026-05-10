import { Inject, Injectable, Logger } from '@nestjs/common';
import { SecurityEvent } from '@app/shared';
import {
  NOTIFICATION_SENDER,
  NotificationSender,
} from '../../common/interfaces/notification-sender.interface';
import { DeduplicationService } from './deduplication.service';

@Injectable()
export class SecurityEventsHandlerService {
  private readonly logger = new Logger(SecurityEventsHandlerService.name);

  constructor(
    private readonly deduplicationService: DeduplicationService,
    @Inject(NOTIFICATION_SENDER)
    private readonly notificationSender: NotificationSender,
  ) {}

  async handle(event: SecurityEvent): Promise<void> {
    if (await this.deduplicationService.isDuplicate(event.eventId)) {
      this.logger.warn(`Duplicate event skipped: ${event.eventId}`);
      return;
    }

    await this.notificationSender.send(event);
    await this.deduplicationService.markProcessed(event.eventId);

    this.logger.log(
      `Processed [${event.type}] severity=${event.severity} eventId=${event.eventId}`,
    );
  }
}
