import { Logger } from '@nestjs/common';
import { Channel, ConsumeMessage } from 'amqplib';
import { RABBITMQ } from '@app/shared';

const logger = new Logger('SecurityEventsErrorHandler');

export function createRetryErrorHandler(
  channel: Channel,
  message: ConsumeMessage,
  error: unknown,
): void {
  const retryCount = Number(message.properties.headers?.['x-retry-count'] ?? 0);

  logger.error(
    `Failed to process message. retryCount=${retryCount}. Error: ${String(error)}`,
  );

  if (retryCount < RABBITMQ.MAX_RETRY_COUNT) {
    channel.publish(
      RABBITMQ.RETRY_EXCHANGE,
      message.fields.routingKey,
      message.content,
      {
        ...message.properties,
        headers: {
          ...message.properties.headers,
          'x-retry-count': retryCount + 1,
        },
      },
    );
    channel.ack(message);

    logger.warn(
      `Scheduled retry ${retryCount + 1}/${RABBITMQ.MAX_RETRY_COUNT} in ${RABBITMQ.RETRY_DELAY_MS}ms`,
    );
  } else {
    channel.nack(message, false, false);

    logger.error(
      `Max retries exceeded. Message sent to DLQ. routingKey=${message.fields.routingKey}`,
    );
  }
}
