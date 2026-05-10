import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  schema: process.env.DATABASE_SCHEMA ?? 'public',
  logging: process.env.NODE_ENV === 'development',
}));
