import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { EventSeverity } from '../enums/event-severity.enum.js';
import { SecurityEventType } from '../enums/event-type.enum.js';

export class SendNotificationDto {
  @IsUUID()
  eventId: string;

  @IsEnum(SecurityEventType)
  type: SecurityEventType;

  @IsEnum(EventSeverity)
  severity: EventSeverity;

  @IsString()
  userId: string;

  @IsString()
  @IsOptional()
  ip?: string;

  @IsString()
  timestamp: string;
}
