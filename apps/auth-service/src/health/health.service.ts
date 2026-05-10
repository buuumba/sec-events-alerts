import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

type CheckResult = 'ok' | 'error';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  checks: {
    database: CheckResult;
    rabbitmq: CheckResult;
  };
}

@Injectable()
export class HealthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  async check(): Promise<HealthCheckResult> {
    const [database, rabbitmq] = await Promise.all([
      this.checkDatabase(),
      this.checkRabbitMq(),
    ]);

    return {
      status: database === 'ok' && rabbitmq === 'ok' ? 'ok' : 'error',
      checks: { database, rabbitmq },
    };
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
