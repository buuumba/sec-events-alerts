import { SecurityEventType } from '@app/shared';

export interface CreateSecurityEventPayload {
  readonly type: SecurityEventType;
  readonly userId?: string;
  readonly ip?: string;
  readonly metadata?: Record<string, unknown>;
}
