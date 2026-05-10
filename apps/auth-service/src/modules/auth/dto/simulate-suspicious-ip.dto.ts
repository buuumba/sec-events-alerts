import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIP, IsOptional } from 'class-validator';

export class SimulateSuspiciousIpDto {
  @ApiPropertyOptional({
    example: '192.168.1.100',
    description: 'IP to simulate. Falls back to request IP if not provided',
  })
  @IsIP()
  @IsOptional()
  ip?: string;
}
