import { Controller, Get } from '@nestjs/common';
import { TelegramServiceService } from './telegram-service.service';

@Controller()
export class TelegramServiceController {
  constructor(private readonly telegramServiceService: TelegramServiceService) {}

  @Get()
  getHello(): string {
    return this.telegramServiceService.getHello();
  }
}
