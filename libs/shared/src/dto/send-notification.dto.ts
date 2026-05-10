import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { EventSeverity } from '../enums/event-severity.enum';
import { SecurityEventType } from '../enums/event-type.enum';

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

  @IsObject()
  metadata: Record<string, unknown>;

  @IsString()
  timestamp: string;
}
