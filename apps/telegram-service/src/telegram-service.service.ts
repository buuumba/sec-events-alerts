import { Injectable } from '@nestjs/common';

@Injectable()
export class TelegramServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
