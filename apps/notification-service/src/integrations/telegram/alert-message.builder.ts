import { Injectable } from '@nestjs/common';
import { EventSeverity, SecurityEventType, SecurityEvent } from '@app/shared';

const SEVERITY_LABEL: Record<EventSeverity, string> = {
  [EventSeverity.LOW]: 'LOW',
  [EventSeverity.MEDIUM]: 'MEDIUM',
  [EventSeverity.HIGH]: 'HIGH',
  [EventSeverity.CRITICAL]: 'CRITICAL',
} as const;

const SEVERITY_MARKER: Record<EventSeverity, string> = {
  [EventSeverity.LOW]: '\u{1F7E2}',
  [EventSeverity.MEDIUM]: '\u{1F7E1}',
  [EventSeverity.HIGH]: '\u{1F7E0}',
  [EventSeverity.CRITICAL]: '\u{1F534}',
} as const;

@Injectable()
export class AlertMessageBuilder {
  buildMessage(event: SecurityEvent): string {
    const header = this.buildHeader(event.severity, event.type);
    const body = this.buildBody(event);
    return `${header}\n\n${body}`;
  }

  private buildHeader(
    severity: EventSeverity,
    type: SecurityEventType,
  ): string {
    const marker = SEVERITY_MARKER[severity];
    const label = SEVERITY_LABEL[severity];
    const title = this.resolveTitle(type);
    return `${marker} *${label} \u2014 ${title}*`;
  }

  private buildBody(event: SecurityEvent): string {
    const lines = this.resolveBodyLines(event);
    return lines.join('\n');
  }

  private resolveBodyLines(event: SecurityEvent): string[] {
    switch (event.type) {
      case SecurityEventType.LOGIN_FAILED:
        return this.buildLoginFailed(
          event as SecurityEvent<SecurityEventType.LOGIN_FAILED>,
        );
      case SecurityEventType.BRUTE_FORCE_DETECTED:
        return this.buildBruteForce(
          event as SecurityEvent<SecurityEventType.BRUTE_FORCE_DETECTED>,
        );
      case SecurityEventType.SUSPICIOUS_IP:
        return this.buildSuspiciousIp(
          event as SecurityEvent<SecurityEventType.SUSPICIOUS_IP>,
        );
      case SecurityEventType.ACCOUNT_LOCKED:
        return this.buildAccountLocked(
          event as SecurityEvent<SecurityEventType.ACCOUNT_LOCKED>,
        );
      case SecurityEventType.PASSWORD_CHANGED:
        return this.buildPasswordChanged(
          event as SecurityEvent<SecurityEventType.PASSWORD_CHANGED>,
        );
      case SecurityEventType.ADMIN_LOGIN:
        return this.buildAdminLogin(
          event as SecurityEvent<SecurityEventType.ADMIN_LOGIN>,
        );
    }
  }

  private buildLoginFailed(
    event: SecurityEvent<SecurityEventType.LOGIN_FAILED>,
  ): string[] {
    return [
      `User ID: \`${event.userId}\``,
      `Email: \`${event.metadata.email}\``,
      event.ip ? `IP: \`${event.ip}\`` : null,
      `Time: \`${event.timestamp}\``,
      `Event ID: \`${event.eventId}\``,
    ].filter(Boolean) as string[];
  }

  private buildBruteForce(
    event: SecurityEvent<SecurityEventType.BRUTE_FORCE_DETECTED>,
  ): string[] {
    return [
      `User ID: \`${event.userId}\``,
      `Email: \`${event.metadata.email}\``,
      event.ip ? `IP: \`${event.ip}\`` : null,
      `Time: \`${event.timestamp}\``,
      `Event ID: \`${event.eventId}\``,
    ].filter(Boolean) as string[];
  }

  private buildSuspiciousIp(
    event: SecurityEvent<SecurityEventType.SUSPICIOUS_IP>,
  ): string[] {
    return [
      `User ID: \`${event.userId}\``,
      `Email: \`${event.metadata.email}\``,
      `Suspicious IP: \`${event.ip ?? 'unknown'}\``,
      `Time: \`${event.timestamp}\``,
      `Event ID: \`${event.eventId}\``,
    ];
  }

  private buildAccountLocked(
    event: SecurityEvent<SecurityEventType.ACCOUNT_LOCKED>,
  ): string[] {
    return [
      `User ID: \`${event.userId}\``,
      `Email: \`${event.metadata.email}\``,
      `Reason: \`${event.metadata.reason}\``,
      `Time: \`${event.timestamp}\``,
      `Event ID: \`${event.eventId}\``,
    ];
  }

  private buildPasswordChanged(
    event: SecurityEvent<SecurityEventType.PASSWORD_CHANGED>,
  ): string[] {
    return [
      `User ID: \`${event.userId}\``,
      `Email: \`${event.metadata.email}\``,
      event.ip ? `IP: \`${event.ip}\`` : null,
      `Time: \`${event.timestamp}\``,
      `Event ID: \`${event.eventId}\``,
    ].filter(Boolean) as string[];
  }

  private buildAdminLogin(
    event: SecurityEvent<SecurityEventType.ADMIN_LOGIN>,
  ): string[] {
    return [
      `User ID: \`${event.userId}\``,
      `Email: \`${event.metadata.email}\``,
      event.ip ? `IP: \`${event.ip}\`` : null,
      `Time: \`${event.timestamp}\``,
      `Event ID: \`${event.eventId}\``,
    ].filter(Boolean) as string[];
  }

  private resolveTitle(type: SecurityEventType): string {
    const titles: Record<SecurityEventType, string> = {
      [SecurityEventType.LOGIN_FAILED]: 'Login Failed',
      [SecurityEventType.BRUTE_FORCE_DETECTED]: 'Brute Force Detected',
      [SecurityEventType.SUSPICIOUS_IP]: 'Suspicious IP Detected',
      [SecurityEventType.ACCOUNT_LOCKED]: 'Account Locked',
      [SecurityEventType.PASSWORD_CHANGED]: 'Password Changed',
      [SecurityEventType.ADMIN_LOGIN]: 'Admin Login',
    } as const;
    return titles[type];
  }
}
