import { registerAs } from '@nestjs/config';
import type { StringValue } from 'ms';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.AUTH_SERVICE_PORT ?? '3000', 10),
  jwtSecret: process.env.JWT_SECRET ?? 'secret',
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN ?? '1h') as StringValue,
}));
