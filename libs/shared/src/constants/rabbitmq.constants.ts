export const RABBITMQ = {
  EXCHANGE: 'security.events',
  EXCHANGE_TYPE: 'topic',
  QUEUE: 'security.notifications',
  DLX: 'security.events.dlx',
  DLQ: 'security.events.dlq',
  ROUTING_KEY_PREFIX: 'security',
  MAX_RETRY_COUNT: 3,
} as const;
