import { IsIP, IsOptional } from 'class-validator';

export class SimulateSuspiciousIpDto {
  @IsIP()
  @IsOptional()
  ip?: string;
}
