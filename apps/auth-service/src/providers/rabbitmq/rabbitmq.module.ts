import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RABBITMQ } from '@app/shared';

@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('rabbitmq.url'),
        exchanges: [
          {
            name: RABBITMQ.EXCHANGE,
            type: RABBITMQ.EXCHANGE_TYPE,
            options: { durable: true },
          },
          {
            name: RABBITMQ.DLX,
            type: 'fanout',
            options: { durable: true },
          },
        ],
        queues: [
          {
            name: RABBITMQ.DLQ,
            options: { durable: true },
            bindQueueArguments: { 'x-dead-letter-exchange': RABBITMQ.DLX },
          },
        ],
        connectionInitOptions: { wait: false },
      }),
    }),
  ],
  exports: [RabbitMQModule],
})
export class RabbitmqModule {}
