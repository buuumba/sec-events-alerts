export const RABBITMQ = {
  // Main exchange
  EXCHANGE: 'security.events',
  EXCHANGE_TYPE: 'topic',

  // Retry exchange (topic to preserve routing key by severity)
  RETRY_EXCHANGE: 'security.events.retry',
  RETRY_EXCHANGE_TYPE: 'topic',
  RETRY_DELAY_MS: 10_000,

  // Dead letter exchange
  DLX: 'security.events.dlx',

  // Queues
  QUEUE: 'security.notifications',
  RETRY_QUEUE: 'security.notifications.retry',
  DLQ: 'security.notifications.dlq',

  ROUTING_KEY_PREFIX: 'security',
  ROUTING_KEY_WILDCARD: 'security.*',
  MAX_RETRY_COUNT: 3,
} as const;
