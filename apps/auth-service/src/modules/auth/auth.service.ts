import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { UserRole } from '@app/shared';
import { SecurityEventType } from '@app/shared';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import { SecurityEventsPublisher } from '../../integrations/events/security-events.publisher';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { BruteForceService } from './brute-force.service';
import { User } from '../users/entities/user.entity';

const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly bruteForceService: BruteForceService,
    private readonly securityEventsPublisher: SecurityEventsPublisher,
  ) {}

  async register(dto: RegisterUserDto): Promise<TokenResponseDto> {
    const user = await this.usersService.createUser(dto);
    this.logger.log(`User registered — email=${dto.email} userId=${user.id}`);
    return this.generateToken(user);
  }

  async login(dto: LoginDto, ip?: string): Promise<TokenResponseDto> {
    const user = await this.usersRepository.findByEmail(dto.email);

    if (user?.isLocked) {
      this.logger.warn(
        `Login blocked — email=${dto.email} reason=account_locked`,
      );
      throw new ForbiddenException('Account is locked');
    }

    const isPasswordValid =
      user !== null && (await compare(dto.password, user.passwordHash));

    if (!isPasswordValid) {
      this.logger.warn(
        `Login failed — email=${dto.email} ip=${ip ?? 'unknown'}`,
      );
      await this.handleFailedLogin(user, ip, dto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.bruteForceService.resetAttempts(user.id);
    this.logger.log(
      `Login success — userId=${user.id} role=${user.role} ip=${ip ?? 'unknown'}`,
    );

    if (user.role === UserRole.ADMIN) {
      await this.securityEventsPublisher.publish({
        type: SecurityEventType.ADMIN_LOGIN,
        userId: user.id,
        ip,
        metadata: { email: user.email },
      });
    }

    return this.generateToken(user);
  }

  async changePassword(
    user: User,
    dto: ChangePasswordDto,
    ip?: string,
  ): Promise<void> {
    const isCurrentPasswordValid = await compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const newPasswordHash = await hash(dto.newPassword, BCRYPT_SALT_ROUNDS);
    await this.usersRepository.save({ ...user, passwordHash: newPasswordHash });

    this.logger.log(
      `Password changed — userId=${user.id} ip=${ip ?? 'unknown'}`,
    );

    await this.securityEventsPublisher.publish({
      type: SecurityEventType.PASSWORD_CHANGED,
      userId: user.id,
      ip,
      metadata: { email: user.email },
    });
  }

  async simulateSuspiciousIp(user: User, ip: string): Promise<void> {
    this.logger.log(`Suspicious IP simulated — userId=${user.id} ip=${ip}`);
    await this.securityEventsPublisher.publish({
      type: SecurityEventType.SUSPICIOUS_IP,
      userId: user.id,
      ip,
      metadata: { email: user.email },
    });
  }

  getProfile(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isLocked: user.isLocked,
      createdAt: user.createdAt,
    };
  }

  private async handleFailedLogin(
    user: User | null,
    ip: string | undefined,
    email: string,
  ): Promise<void> {
    await this.securityEventsPublisher.publish({
      type: SecurityEventType.LOGIN_FAILED,
      userId: user?.id,
      ip,
      metadata: { email },
    });

    if (!user) {
      return;
    }

    this.bruteForceService.recordFailedAttempt(user.id);

    if (this.bruteForceService.shouldEmitBruteForce(user.id)) {
      await this.securityEventsPublisher.publish({
        type: SecurityEventType.BRUTE_FORCE_DETECTED,
        userId: user.id,
        ip,
        metadata: { email: user.email },
      });
      this.bruteForceService.markBruteForceSent(user.id);
    }

    if (this.bruteForceService.shouldLockAccount(user.id) && !user.isLocked) {
      await this.usersService.lockAccount(user.id);
      await this.securityEventsPublisher.publish({
        type: SecurityEventType.ACCOUNT_LOCKED,
        userId: user.id,
        metadata: {
          email: user.email,
          reason: 'Too many failed login attempts',
        },
      });
    }
  }

  private generateToken(user: User): TokenResponseDto {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
