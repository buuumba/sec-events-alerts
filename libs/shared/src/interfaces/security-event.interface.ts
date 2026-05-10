import { EventSeverity } from '../enums/event-severity.enum';
import { SecurityEventType } from '../enums/event-type.enum';

export interface LoginFailedMetadata {
  readonly email: string;
}

export interface BruteForceMetadata {
  readonly email: string;
}

export interface SuspiciousIpMetadata {
  readonly email: string;
}

export interface PasswordChangedMetadata {
  readonly email: string;
}

export interface AdminLoginMetadata {
  readonly email: string;
}

export interface AccountLockedMetadata {
  readonly email: string;
  readonly reason: string;
}

export type SecurityEventMetadataMap = {
  [SecurityEventType.LOGIN_FAILED]: LoginFailedMetadata;
  [SecurityEventType.BRUTE_FORCE_DETECTED]: BruteForceMetadata;
  [SecurityEventType.SUSPICIOUS_IP]: SuspiciousIpMetadata;
  [SecurityEventType.PASSWORD_CHANGED]: PasswordChangedMetadata;
  [SecurityEventType.ADMIN_LOGIN]: AdminLoginMetadata;
  [SecurityEventType.ACCOUNT_LOCKED]: AccountLockedMetadata;
};

export interface SecurityEvent<
  T extends SecurityEventType = SecurityEventType,
> {
  readonly eventId: string;
  readonly type: T;
  readonly severity: EventSeverity;
  readonly userId: string;
  readonly ip?: string;
  readonly metadata: SecurityEventMetadataMap[T];
  readonly timestamp: string;
}
