import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { FailedLoginAttempt } from './entities/failed-login-attempt.entity';
import { BRUTE_FORCE_WINDOW_MS } from './auth.constants';

const BRUTE_FORCE_THRESHOLD = 3;
const LOCK_THRESHOLD = 5;

export interface BruteForceEvaluation {
  readonly shouldNotifyBruteForce: boolean;
  readonly shouldLock: boolean;
}

@Injectable()
export class BruteForceService {
  private readonly logger = new Logger(BruteForceService.name);

  constructor(
    @InjectRepository(FailedLoginAttempt)
    private readonly attemptsRepository: Repository<FailedLoginAttempt>,
  ) {}

  async recordFailedAttempt(userId: string, ip?: string): Promise<void> {
    await this.attemptsRepository.save({ userId, ip });
  }

  async evaluateAttempts(userId: string): Promise<BruteForceEvaluation> {
    const windowStart = new Date(Date.now() - BRUTE_FORCE_WINDOW_MS);
    const count = await this.attemptsRepository.count({
      where: { userId, attemptedAt: MoreThan(windowStart) },
    });

    if (count >= LOCK_THRESHOLD) {
      this.logger.warn(
        `Lock threshold reached — userId=${userId} count=${count}`,
      );
    } else if (count >= BRUTE_FORCE_THRESHOLD) {
      this.logger.warn(
        `Brute force threshold reached — userId=${userId} count=${count}`,
      );
    }

    return {
      shouldNotifyBruteForce: count >= BRUTE_FORCE_THRESHOLD,
      shouldLock: count >= LOCK_THRESHOLD,
    };
  }

  async resetAttempts(userId: string): Promise<void> {
    await this.attemptsRepository.delete({ userId });
  }
}
