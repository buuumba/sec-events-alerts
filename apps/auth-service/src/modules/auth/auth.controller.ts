import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { AuthService, TokenResponse, UserResponse } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SimulateSuspiciousIpDto } from './dto/simulate-suspicious-ip.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestIp } from '../../common/decorators/request-ip.decorator';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterUserDto): Promise<TokenResponse> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body() dto: LoginDto,
    @RequestIp() ip: string,
  ): Promise<TokenResponse> {
    return this.authService.login(dto, ip);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: User): UserResponse {
    return this.authService.getProfile(user);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  changePassword(
    @CurrentUser() user: User,
    @Body() dto: ChangePasswordDto,
    @RequestIp() ip: string,
  ): Promise<void> {
    return this.authService.changePassword(user, dto, ip);
  }

  @Post('simulate/suspicious-ip')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  simulateSuspiciousIp(
    @CurrentUser() user: User,
    @Body() dto: SimulateSuspiciousIpDto,
    @RequestIp() requestIp: string,
  ): Promise<void> {
    return this.authService.simulateSuspiciousIp(user, dto.ip ?? requestIp);
  }
}
