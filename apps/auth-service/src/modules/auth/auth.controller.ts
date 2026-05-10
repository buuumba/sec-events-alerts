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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SimulateSuspiciousIpDto } from './dto/simulate-suspicious-ip.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestIp } from '../../common/decorators/request-ip.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({
    type: TokenResponseDto,
    description: 'User registered, JWT returned',
  })
  register(@Body() dto: RegisterUserDto): Promise<TokenResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiOkResponse({
    type: TokenResponseDto,
    description: 'Login successful, JWT returned',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiForbiddenResponse({ description: 'Account is locked' })
  login(
    @Body() dto: LoginDto,
    @RequestIp() ip: string,
  ): Promise<TokenResponseDto> {
    return this.authService.login(dto, ip);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ type: UserResponseDto, description: 'Current user profile' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  getProfile(@CurrentUser() user: User): UserResponseDto {
    return this.authService.getProfile(user);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change current user password' })
  @ApiNoContentResponse({ description: 'Password changed successfully' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT, or wrong current password',
  })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Simulate suspicious IP event (demo only)' })
  @ApiNoContentResponse({ description: 'Event published successfully' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  simulateSuspiciousIp(
    @CurrentUser() user: User,
    @Body() dto: SimulateSuspiciousIpDto,
    @RequestIp() requestIp: string,
  ): Promise<void> {
    return this.authService.simulateSuspiciousIp(user, dto.ip ?? requestIp);
  }
}
