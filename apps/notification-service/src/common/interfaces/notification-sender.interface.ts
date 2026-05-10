import { SecurityEvent } from '@app/shared';

export interface NotificationSender {
  send(event: SecurityEvent): Promise<void>;
}

export const NOTIFICATION_SENDER = Symbol('NOTIFICATION_SENDER');
