import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BruteForceService } from '../brute-force.service';
import { FailedLoginAttempt } from '../entities/failed-login-attempt.entity';

describe('BruteForceService', () => {
  let service: BruteForceService;
  let mockRepository: jest.Mocked<Repository<FailedLoginAttempt>>;

  beforeEach(async () => {
    mockRepository = {
      save: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<FailedLoginAttempt>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BruteForceService,
        {
          provide: getRepositoryToken(FailedLoginAttempt),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BruteForceService>(BruteForceService);
  });

  describe('recordFailedAttempt', () => {
    it('should save a failed login attempt', async () => {
      await service.recordFailedAttempt('user-1', '1.2.3.4');

      expect(mockRepository.save).toHaveBeenCalledWith({
        userId: 'user-1',
        ip: '1.2.3.4',
      });
    });
  });

  describe('evaluateAttempts', () => {
    it('should return no flags when count is below threshold', async () => {
      mockRepository.count.mockResolvedValue(2);

      const actual = await service.evaluateAttempts('user-1');

      expect(actual).toEqual({
        shouldNotifyBruteForce: false,
        shouldLock: false,
      });
    });

    it('should notify brute force at threshold 3', async () => {
      mockRepository.count.mockResolvedValue(3);

      const actual = await service.evaluateAttempts('user-1');

      expect(actual).toEqual({
        shouldNotifyBruteForce: true,
        shouldLock: false,
      });
    });

    it('should lock at threshold 5', async () => {
      mockRepository.count.mockResolvedValue(5);

      const actual = await service.evaluateAttempts('user-1');

      expect(actual).toEqual({
        shouldNotifyBruteForce: true,
        shouldLock: true,
      });
    });
  });

  describe('resetAttempts', () => {
    it('should delete all attempts for user', async () => {
      await service.resetAttempts('user-1');

      expect(mockRepository.delete).toHaveBeenCalledWith({ userId: 'user-1' });
    });
  });
});
