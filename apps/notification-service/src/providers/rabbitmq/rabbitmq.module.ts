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
            name: RABBITMQ.RETRY_EXCHANGE,
            type: RABBITMQ.RETRY_EXCHANGE_TYPE,
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
            name: RABBITMQ.QUEUE,
            options: {
              durable: true,
              arguments: {
                'x-dead-letter-exchange': RABBITMQ.DLX,
              },
            },
            exchange: RABBITMQ.EXCHANGE,
            routingKey: RABBITMQ.ROUTING_KEY_WILDCARD,
          },
          {
            name: RABBITMQ.RETRY_QUEUE,
            options: {
              durable: true,
              arguments: {
                'x-message-ttl': RABBITMQ.RETRY_DELAY_MS,
                'x-dead-letter-exchange': RABBITMQ.EXCHANGE,
              },
            },
            exchange: RABBITMQ.RETRY_EXCHANGE,
            routingKey: RABBITMQ.ROUTING_KEY_WILDCARD,
          },
          {
            name: RABBITMQ.DLQ,
            options: { durable: true },
            exchange: RABBITMQ.DLX,
            routingKey: '',
          },
        ],
        prefetchCount: 1,
        connectionInitOptions: { wait: false },
      }),
    }),
  ],
  exports: [RabbitMQModule],
})
export class RabbitmqModule {}
