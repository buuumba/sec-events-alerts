import { NestFactory } from '@nestjs/core';
import { TelegramServiceModule } from './telegram-service.module';

async function bootstrap() {
  const app = await NestFactory.create(TelegramServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
