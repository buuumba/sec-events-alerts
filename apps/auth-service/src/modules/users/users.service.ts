import { ConflictException, Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { UsersRepository } from './users.repository';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from './entities/user.entity';

const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(dto: RegisterUserDto): Promise<User> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await hash(dto.password, BCRYPT_SALT_ROUNDS);
    return this.usersRepository.save({
      email: dto.email,
      passwordHash,
      role: dto.role,
    });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  lockAccount(id: string): Promise<void> {
    return this.usersRepository.lockAccount(id);
  }
}
