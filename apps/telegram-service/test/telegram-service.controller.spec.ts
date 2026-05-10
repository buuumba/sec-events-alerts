import { Test, TestingModule } from '@nestjs/testing';
import { TelegramServiceController } from './telegram-service.controller';
import { TelegramServiceService } from './telegram-service.service';

describe('TelegramServiceController', () => {
  let telegramServiceController: TelegramServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TelegramServiceController],
      providers: [TelegramServiceService],
    }).compile();

    telegramServiceController = app.get<TelegramServiceController>(TelegramServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(telegramServiceController.getHello()).toBe('Hello World!');
    });
  });
});
