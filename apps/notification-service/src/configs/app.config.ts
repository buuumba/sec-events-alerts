import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.NOTIFICATION_SERVICE_PORT ?? '4001', 10),
  telegramServiceUrl: process.env.TELEGRAM_SERVICE_URL ?? 'http://localhost:3002',
}));
