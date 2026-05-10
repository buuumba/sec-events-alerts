import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from '../users/entities/user.entity';

const BCRYPT_SALT_ROUNDS = 12;

export interface TokenResponse {
  accessToken: string;
}

export interface UserResponse {
  id: string;
  email: string;
  role: string;
  isLocked: boolean;
  createdAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterUserDto): Promise<TokenResponse> {
    const user = await this.usersService.createUser(dto);
    return this.generateToken(user);
  }

  async login(dto: LoginDto): Promise<TokenResponse> {
    const user = await this.usersRepository.findByEmail(dto.email);

    if (user?.isLocked) {
      throw new ForbiddenException('Account is locked');
    }

    const isPasswordValid =
      user !== null && (await compare(dto.password, user.passwordHash));

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  async changePassword(user: User, dto: ChangePasswordDto): Promise<void> {
    const isCurrentPasswordValid = await compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const newPasswordHash = await hash(dto.newPassword, BCRYPT_SALT_ROUNDS);
    await this.usersRepository.save({ ...user, passwordHash: newPasswordHash });
  }

  getProfile(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isLocked: user.isLocked,
      createdAt: user.createdAt,
    };
  }

  private generateToken(user: User): TokenResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
