import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.NOTIFICATION_SERVICE_PORT ?? '3001', 10),
}));
