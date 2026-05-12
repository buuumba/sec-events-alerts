import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeduplicationService } from '../deduplication.service';
import { ProcessedEvent } from '../entities/processed-event.entity';

describe('DeduplicationService', () => {
  let service: DeduplicationService;
  let mockRepository: jest.Mocked<Repository<ProcessedEvent>>;

  beforeEach(async () => {
    mockRepository = {
      countBy: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<ProcessedEvent>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeduplicationService,
        {
          provide: getRepositoryToken(ProcessedEvent),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DeduplicationService>(DeduplicationService);
  });

  describe('isDuplicate', () => {
    it('should return true when event already exists', async () => {
      mockRepository.countBy.mockResolvedValue(1);

      const actual = await service.isDuplicate('evt-1');

      expect(actual).toBe(true);
      expect(mockRepository.countBy).toHaveBeenCalledWith({ eventId: 'evt-1' });
    });

    it('should return false when event does not exist', async () => {
      mockRepository.countBy.mockResolvedValue(0);

      const actual = await service.isDuplicate('evt-2');

      expect(actual).toBe(false);
    });
  });

  describe('markProcessed', () => {
    it('should save the event id', async () => {
      await service.markProcessed('evt-1');

      expect(mockRepository.save).toHaveBeenCalledWith({ eventId: 'evt-1' });
    });
  });
});
