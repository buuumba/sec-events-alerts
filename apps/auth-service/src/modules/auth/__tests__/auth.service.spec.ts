import {
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { SecurityEventType, UserRole } from '@app/shared';
import { AuthService } from '../auth.service';
import { BruteForceService } from '../brute-force.service';
import { SecurityEventsPublisher } from '../../../integrations/events/security-events.publisher';
import { UsersRepository } from '../../users/users.repository';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';

jest.mock('bcrypt');

const mockUser: User = {
  id: 'user-uuid-1',
  email: 'test@test.com',
  passwordHash: 'hashed-password',
  role: UserRole.USER,
  isLocked: false,
  bruteForceNotifiedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAdminUser: User = {
  ...mockUser,
  id: 'admin-uuid-1',
  role: UserRole.ADMIN,
};

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersRepository: jest.Mocked<UsersRepository>;
  let mockUsersService: jest.Mocked<UsersService>;
  let mockJwtService: jest.Mocked<JwtService>;
  let mockBruteForceService: jest.Mocked<BruteForceService>;
  let mockPublisher: jest.Mocked<SecurityEventsPublisher>;

  beforeEach(async () => {
    mockUsersRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      lockAccount: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;

    mockUsersService = {
      createUser: jest.fn(),
      findById: jest.fn(),
      lockAccount: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    } as unknown as jest.Mocked<JwtService>;

    mockBruteForceService = {
      recordFailedAttempt: jest.fn(),
      evaluateAttempts: jest.fn(),
      resetAttempts: jest.fn(),
    } as unknown as jest.Mocked<BruteForceService>;

    mockPublisher = {
      publish: jest.fn(),
    } as unknown as jest.Mocked<SecurityEventsPublisher>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersRepository, useValue: mockUsersRepository },
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: BruteForceService, useValue: mockBruteForceService },
        { provide: SecurityEventsPublisher, useValue: mockPublisher },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should create user and return access token', async () => {
      const inputDto = { email: 'new@test.com', password: 'Password123!' };
      mockUsersService.createUser.mockResolvedValue(mockUser);

      const actual = await service.register(inputDto);

      expect(mockUsersService.createUser).toHaveBeenCalledWith(inputDto);
      expect(actual).toEqual({ accessToken: 'mock-jwt-token' });
    });
  });

  describe('login', () => {
    it('should throw ForbiddenException when account is locked', async () => {
      const lockedUser = { ...mockUser, isLocked: true };
      mockUsersRepository.findByEmail.mockResolvedValue(lockedUser);

      await expect(
        service.login({ email: 'test@test.com', password: 'any' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      mockBruteForceService.evaluateAttempts.mockResolvedValue({
        shouldNotifyBruteForce: false,
        shouldLock: false,
      });

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }, '1.2.3.4'),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockPublisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({ type: SecurityEventType.LOGIN_FAILED }),
      );
    });

    it('should return token on successful login', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const actual = await service.login(
        { email: 'test@test.com', password: 'correct' },
        '1.2.3.4',
      );

      expect(mockBruteForceService.resetAttempts).toHaveBeenCalledWith(mockUser.id);
      expect(actual).toEqual({ accessToken: 'mock-jwt-token' });
    });

    it('should publish ADMIN_LOGIN event for admin users', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(mockAdminUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login({ email: 'test@test.com', password: 'correct' }, '1.2.3.4');

      expect(mockPublisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({ type: SecurityEventType.ADMIN_LOGIN }),
      );
    });

    it('should lock account when lock threshold is reached', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      mockBruteForceService.evaluateAttempts.mockResolvedValue({
        shouldNotifyBruteForce: true,
        shouldLock: true,
      });

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }, '1.2.3.4'),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockUsersService.lockAccount).toHaveBeenCalledWith(mockUser.id);
      expect(mockPublisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({ type: SecurityEventType.ACCOUNT_LOCKED }),
      );
    });
  });

  describe('changePassword', () => {
    it('should throw UnauthorizedException if current password is wrong', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword(
          mockUser,
          { currentPassword: 'wrong', newPassword: 'NewPass123!' },
          '1.2.3.4',
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should update password and publish event on success', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
      mockUsersRepository.save.mockResolvedValue(mockUser);

      await service.changePassword(
        mockUser,
        { currentPassword: 'old', newPassword: 'NewPass123!' },
        '1.2.3.4',
      );

      expect(mockUsersRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ passwordHash: 'new-hashed-password' }),
      );
      expect(mockPublisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({ type: SecurityEventType.PASSWORD_CHANGED }),
      );
    });
  });

  describe('simulateSuspiciousIp', () => {
    it('should publish SUSPICIOUS_IP event', async () => {
      await service.simulateSuspiciousIp(mockUser, '185.220.101.42');

      expect(mockPublisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: SecurityEventType.SUSPICIOUS_IP,
          ip: '185.220.101.42',
        }),
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile DTO', () => {
      const actual = service.getProfile(mockUser);

      expect(actual).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        isLocked: mockUser.isLocked,
        createdAt: mockUser.createdAt,
      });
    });
  });
});
