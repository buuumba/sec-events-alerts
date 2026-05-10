import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { SendNotificationDto } from '@app/shared';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  @HttpCode(HttpStatus.NO_CONTENT)
  async sendNotification(@Body() dto: SendNotificationDto): Promise<void> {
    this.logger.log(
      `Incoming alert — type=${dto.type} severity=${dto.severity} eventId=${dto.eventId}`,
    );
    await this.notificationsService.sendAlert(dto);
  }
}
