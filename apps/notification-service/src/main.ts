import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

const logger = new Logger('Bootstrap');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled rejection', err);
    process.exit(1);
  });

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('app.port');

  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);

  const shutdown = async (signal: string): Promise<void> => {
    logger.log(`${signal} received: closing application`);
    try {
      await app.close();
      logger.log('Application closed gracefully');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });
}

bootstrap().catch((err) => {
  logger.error('Bootstrap error', err);
  process.exit(1);
});
