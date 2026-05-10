import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = process.env.AUTH_SERVICE_PORT ?? 3000;
  await app.listen(port);
}

bootstrap();
