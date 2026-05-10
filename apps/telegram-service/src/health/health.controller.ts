import { Controller, Get } from '@nestjs/common';

interface PingResult {
  status: 'ok';
}

@Controller('health')
export class HealthController {
  @Get()
  checkHealth(): PingResult {
    return { status: 'ok' };
  }
}
