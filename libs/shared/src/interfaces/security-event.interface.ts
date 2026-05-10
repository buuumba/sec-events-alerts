import { EventSeverity } from '../enums/event-severity.enum.js';
import { SecurityEventType } from '../enums/event-type.enum.js';

export interface SecurityEvent {
  readonly eventId: string;
  readonly type: SecurityEventType;
  readonly severity: EventSeverity;
  readonly userId: string;
  readonly ip?: string;
  readonly metadata: Record<string, unknown>;
  readonly timestamp: string;
}
