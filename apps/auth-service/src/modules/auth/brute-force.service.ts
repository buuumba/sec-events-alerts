import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

const BRUTE_FORCE_THRESHOLD = 3;
const LOCK_THRESHOLD = 5;
const WINDOW_MS = 60_000;
const CLEANUP_INTERVAL_MS = 60_000;

interface AttemptRecord {
  count: number;
  firstAttemptAt: Date;
  bruteForceEventSent: boolean;
}

@Injectable()
export class BruteForceService implements OnModuleDestroy {
  private readonly logger = new Logger(BruteForceService.name);
  private readonly attempts = new Map<string, AttemptRecord>();
  private readonly cleanupTimer: ReturnType<typeof setInterval>;

  constructor() {
    this.cleanupTimer = setInterval(() => this.cleanup(), CLEANUP_INTERVAL_MS);
  }

  onModuleDestroy(): void {
    clearInterval(this.cleanupTimer);
  }

  recordFailedAttempt(userId: string): void {
    const now = new Date();
    const existing = this.attempts.get(userId);

    if (!existing || this.isWindowExpired(existing.firstAttemptAt, now)) {
      this.attempts.set(userId, {
        count: 1,
        firstAttemptAt: now,
        bruteForceEventSent: false,
      });
      return;
    }

    existing.count += 1;

    if (existing.count === BRUTE_FORCE_THRESHOLD) {
      this.logger.warn(
        `Brute force threshold reached — userId=${userId} count=${existing.count}`,
      );
    } else if (existing.count === LOCK_THRESHOLD) {
      this.logger.warn(
        `Lock threshold reached — userId=${userId} count=${existing.count}`,
      );
    }
  }

  shouldEmitBruteForce(userId: string): boolean {
    const record = this.attempts.get(userId);
    return (
      record !== undefined &&
      record.count >= BRUTE_FORCE_THRESHOLD &&
      !record.bruteForceEventSent
    );
  }

  markBruteForceSent(userId: string): void {
    const record = this.attempts.get(userId);
    if (record) {
      record.bruteForceEventSent = true;
    }
  }

  shouldLockAccount(userId: string): boolean {
    const record = this.attempts.get(userId);
    return record !== undefined && record.count >= LOCK_THRESHOLD;
  }

  resetAttempts(userId: string): void {
    this.attempts.delete(userId);
  }

  private isWindowExpired(firstAttemptAt: Date, now: Date): boolean {
    return now.getTime() - firstAttemptAt.getTime() > WINDOW_MS;
  }

  private cleanup(): void {
    const now = new Date();
    for (const [userId, record] of this.attempts) {
      if (this.isWindowExpired(record.firstAttemptAt, now)) {
        this.attempts.delete(userId);
      }
    }
  }
}
