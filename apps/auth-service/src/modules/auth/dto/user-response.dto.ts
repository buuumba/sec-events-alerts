import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@app/shared';

export class UserResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role: string;

  @ApiProperty({ example: false })
  isLocked: boolean;

  @ApiProperty({ example: '2026-05-10T14:00:00.000Z' })
  createdAt: Date;
}
