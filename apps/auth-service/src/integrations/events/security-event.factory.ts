import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  EventSeverity,
  SecurityEvent,
  SecurityEventType,
} from '@app/shared';
import { CreateSecurityEventPayload } from './interfaces/create-security-event-payload.interface';

const SEVERITY_MAP: Record<SecurityEventType, EventSeverity> = {
  [SecurityEventType.LOGIN_FAILED]: EventSeverity.MEDIUM,
  [SecurityEventType.BRUTE_FORCE_DETECTED]: EventSeverity.HIGH,
  [SecurityEventType.SUSPICIOUS_IP]: EventSeverity.MEDIUM,
  [SecurityEventType.PASSWORD_CHANGED]: EventSeverity.LOW,
  [SecurityEventType.ADMIN_LOGIN]: EventSeverity.MEDIUM,
  [SecurityEventType.ACCOUNT_LOCKED]: EventSeverity.CRITICAL,
};

@Injectable()
export class SecurityEventFactory {
  create(payload: CreateSecurityEventPayload): SecurityEvent {
    return {
      eventId: randomUUID(),
      type: payload.type,
      severity: SEVERITY_MAP[payload.type],
      userId: payload.userId ?? 'anonymous',
      ip: payload.ip,
      metadata: payload.metadata ?? {},
      timestamp: new Date().toISOString(),
    };
  }
}
