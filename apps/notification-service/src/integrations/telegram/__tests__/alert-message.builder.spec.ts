import {
  SecurityEvent,
  SecurityEventType,
  EventSeverity,
} from '@app/shared';
import { AlertMessageBuilder } from '../alert-message.builder';

describe('AlertMessageBuilder', () => {
  const builder = new AlertMessageBuilder();

  const baseEvent = {
    eventId: 'evt-1',
    userId: 'user-1',
    ip: '1.2.3.4',
    timestamp: '2026-05-13T00:00:00.000Z',
  };

  it('should include severity marker and title for LOGIN_FAILED', () => {
    const event: SecurityEvent<SecurityEventType.LOGIN_FAILED> = {
      ...baseEvent,
      type: SecurityEventType.LOGIN_FAILED,
      severity: EventSeverity.MEDIUM,
      metadata: { email: 'test@test.com' },
    };

    const actual = builder.buildMessage(event);

    expect(actual).toContain('MEDIUM');
    expect(actual).toContain('Login Failed');
    expect(actual).toContain('test@test.com');
    expect(actual).toContain('1.2.3.4');
  });

  it('should include reason for ACCOUNT_LOCKED', () => {
    const event: SecurityEvent<SecurityEventType.ACCOUNT_LOCKED> = {
      ...baseEvent,
      type: SecurityEventType.ACCOUNT_LOCKED,
      severity: EventSeverity.CRITICAL,
      metadata: { email: 'test@test.com', reason: 'Too many attempts' },
    };

    const actual = builder.buildMessage(event);

    expect(actual).toContain('CRITICAL');
    expect(actual).toContain('Account Locked');
    expect(actual).toContain('Too many attempts');
  });

  it('should handle event without IP', () => {
    const event: SecurityEvent<SecurityEventType.PASSWORD_CHANGED> = {
      ...baseEvent,
      ip: undefined,
      type: SecurityEventType.PASSWORD_CHANGED,
      severity: EventSeverity.LOW,
      metadata: { email: 'test@test.com' },
    };

    const actual = builder.buildMessage(event);

    expect(actual).toContain('LOW');
    expect(actual).toContain('Password Changed');
    expect(actual).not.toContain('IP:');
  });

  it('should build message for BRUTE_FORCE_DETECTED', () => {
    const event: SecurityEvent<SecurityEventType.BRUTE_FORCE_DETECTED> = {
      ...baseEvent,
      type: SecurityEventType.BRUTE_FORCE_DETECTED,
      severity: EventSeverity.HIGH,
      metadata: { email: 'victim@test.com' },
    };

    const actual = builder.buildMessage(event);

    expect(actual).toContain('HIGH');
    expect(actual).toContain('Brute Force Detected');
    expect(actual).toContain('victim@test.com');
  });

  it('should build message for SUSPICIOUS_IP', () => {
    const event: SecurityEvent<SecurityEventType.SUSPICIOUS_IP> = {
      ...baseEvent,
      type: SecurityEventType.SUSPICIOUS_IP,
      severity: EventSeverity.MEDIUM,
      metadata: { email: 'test@test.com' },
    };

    const actual = builder.buildMessage(event);

    expect(actual).toContain('Suspicious IP Detected');
    expect(actual).toContain('Suspicious IP:');
  });

  it('should build message for ADMIN_LOGIN', () => {
    const event: SecurityEvent<SecurityEventType.ADMIN_LOGIN> = {
      ...baseEvent,
      type: SecurityEventType.ADMIN_LOGIN,
      severity: EventSeverity.MEDIUM,
      metadata: { email: 'admin@test.com' },
    };

    const actual = builder.buildMessage(event);

    expect(actual).toContain('Admin Login');
    expect(actual).toContain('admin@test.com');
  });
});
