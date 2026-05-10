import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

type CheckResult = 'ok' | 'error';

interface HealthCheckResult {
  status: 'ok' | 'error';
  checks: {
    database: CheckResult;
    rabbitmq: CheckResult;
  };
}

@Controller('health')
export class HealthController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  @Get()
  async checkHealth(): Promise<HealthCheckResult> {
    const database = await this.checkDatabase();
    const rabbitmq = this.checkRabbitMq();
    const status = database === 'ok' && rabbitmq === 'ok' ? 'ok' : 'error';
    const result: HealthCheckResult = { status, checks: { database, rabbitmq } };

    if (status === 'error') {
      throw new ServiceUnavailableException(result);
    }

    return result;
  }

  private async checkDatabase(): Promise<CheckResult> {
    try {
      await this.dataSource.query('SELECT 1');
      return 'ok';
    } catch {
      return 'error';
    }
  }

  private checkRabbitMq(): CheckResult {
    try {
      return this.amqpConnection.channel ? 'ok' : 'error';
    } catch {
      return 'error';
    }
  }
}
