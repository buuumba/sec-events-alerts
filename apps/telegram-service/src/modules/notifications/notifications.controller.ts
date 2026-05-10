import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SendNotificationDto } from '@app/shared';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  @HttpCode(HttpStatus.NO_CONTENT)
  async sendNotification(@Body() dto: SendNotificationDto): Promise<void> {
    await this.notificationsService.sendAlert(dto);
  }
}
