import { Injectable } from '@nestjs/common';
import { EventSeverity, SecurityEventType } from '@app/shared';
import { SendNotificationDto } from '@app/shared';

const SEVERITY_LABEL: Record<EventSeverity, string> = {
  [EventSeverity.LOW]: 'LOW',
  [EventSeverity.MEDIUM]: 'MEDIUM',
  [EventSeverity.HIGH]: 'HIGH',
  [EventSeverity.CRITICAL]: 'CRITICAL',
} as const;

const SEVERITY_MARKER: Record<EventSeverity, string> = {
  [EventSeverity.LOW]: '🟢',
  [EventSeverity.MEDIUM]: '🟡',
  [EventSeverity.HIGH]: '🟠',
  [EventSeverity.CRITICAL]: '🔴',
} as const;

@Injectable()
export class AlertMessageBuilder {
  buildMessage(dto: SendNotificationDto): string {
    const header = this.buildHeader(dto.severity, dto.type);
    const body = this.buildBody(dto);
    return `${header}\n\n${body}`;
  }

  private buildHeader(severity: EventSeverity, type: SecurityEventType): string {
    const marker = SEVERITY_MARKER[severity];
    const label = SEVERITY_LABEL[severity];
    const title = this.resolveTitle(type);
    return `${marker} *${label} — ${title}*`;
  }

  private buildBody(dto: SendNotificationDto): string {
    const lines = this.resolveBodyLines(dto);
    return lines.join('\n');
  }

  private resolveBodyLines(dto: SendNotificationDto): string[] {
    switch (dto.type) {
      case SecurityEventType.LOGIN_FAILED:
        return this.buildLoginFailed(dto);
      case SecurityEventType.BRUTE_FORCE_DETECTED:
        return this.buildBruteForce(dto);
      case SecurityEventType.SUSPICIOUS_IP:
        return this.buildSuspiciousIp(dto);
      case SecurityEventType.ACCOUNT_LOCKED:
        return this.buildAccountLocked(dto);
      case SecurityEventType.PASSWORD_CHANGED:
        return this.buildPasswordChanged(dto);
      case SecurityEventType.ADMIN_LOGIN:
        return this.buildAdminLogin(dto);
    }
  }

  private buildLoginFailed(dto: SendNotificationDto): string[] {
    return [
      `User ID: \`${dto.userId}\``,
      dto.ip ? `IP: \`${dto.ip}\`` : null,
      `Attempts: \`${dto.metadata['attempts'] ?? 1}\``,
      `Time: \`${dto.timestamp}\``,
      `Event ID: \`${dto.eventId}\``,
    ].filter(Boolean) as string[];
  }

  private buildBruteForce(dto: SendNotificationDto): string[] {
    return [
      `User ID: \`${dto.userId}\``,
      dto.ip ? `IP: \`${dto.ip}\`` : null,
      `Failed Attempts: \`${dto.metadata['failedAttempts'] ?? 'N/A'}\``,
      `Time: \`${dto.timestamp}\``,
      `Event ID: \`${dto.eventId}\``,
    ].filter(Boolean) as string[];
  }

  private buildSuspiciousIp(dto: SendNotificationDto): string[] {
    return [
      `User ID: \`${dto.userId}\``,
      `Suspicious IP: \`${dto.ip ?? 'unknown'}\``,
      dto.metadata['country'] ? `Country: \`${dto.metadata['country']}\`` : null,
      `Time: \`${dto.timestamp}\``,
      `Event ID: \`${dto.eventId}\``,
    ].filter(Boolean) as string[];
  }

  private buildAccountLocked(dto: SendNotificationDto): string[] {
    return [
      `User ID: \`${dto.userId}\``,
      dto.metadata['email'] ? `Email: \`${dto.metadata['email']}\`` : null,
      `Reason: \`${dto.metadata['reason'] ?? 'Too many failed login attempts'}\``,
      `Time: \`${dto.timestamp}\``,
      `Event ID: \`${dto.eventId}\``,
    ].filter(Boolean) as string[];
  }

  private buildPasswordChanged(dto: SendNotificationDto): string[] {
    return [
      `User ID: \`${dto.userId}\``,
      dto.metadata['email'] ? `Email: \`${dto.metadata['email']}\`` : null,
      dto.ip ? `IP: \`${dto.ip}\`` : null,
      `Time: \`${dto.timestamp}\``,
      `Event ID: \`${dto.eventId}\``,
    ].filter(Boolean) as string[];
  }

  private buildAdminLogin(dto: SendNotificationDto): string[] {
    return [
      `User ID: \`${dto.userId}\``,
      dto.metadata['email'] ? `Email: \`${dto.metadata['email']}\`` : null,
      dto.ip ? `IP: \`${dto.ip}\`` : null,
      `Time: \`${dto.timestamp}\``,
      `Event ID: \`${dto.eventId}\``,
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
