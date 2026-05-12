import { Channel, ConsumeMessage } from 'amqplib';
import { RABBITMQ } from '@app/shared';
import { createRetryErrorHandler } from '../security-events.error-handler';

describe('createRetryErrorHandler', () => {
  let mockChannel: jest.Mocked<Channel>;
  let mockMessage: ConsumeMessage;

  beforeEach(() => {
    mockChannel = {
      publish: jest.fn(),
      ack: jest.fn(),
      nack: jest.fn(),
    } as unknown as jest.Mocked<Channel>;

    mockMessage = {
      content: Buffer.from('{}'),
      fields: { routingKey: 'security.high' },
      properties: {
        headers: {},
      },
    } as unknown as ConsumeMessage;
  });

  it('should retry and ack when under max retry count', () => {
    mockMessage.properties.headers = { 'x-retry-count': 1 };

    createRetryErrorHandler(mockChannel, mockMessage, new Error('fail'));

    expect(mockChannel.publish).toHaveBeenCalledWith(
      RABBITMQ.RETRY_EXCHANGE,
      'security.high',
      mockMessage.content,
      expect.objectContaining({
        headers: expect.objectContaining({ 'x-retry-count': 2 }),
      }),
    );
    expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
    expect(mockChannel.nack).not.toHaveBeenCalled();
  });

  it('should retry from 0 when no x-retry-count header', () => {
    mockMessage.properties.headers = {};

    createRetryErrorHandler(mockChannel, mockMessage, new Error('fail'));

    expect(mockChannel.publish).toHaveBeenCalledWith(
      RABBITMQ.RETRY_EXCHANGE,
      'security.high',
      mockMessage.content,
      expect.objectContaining({
        headers: expect.objectContaining({ 'x-retry-count': 1 }),
      }),
    );
    expect(mockChannel.ack).toHaveBeenCalled();
  });

  it('should nack without requeue when max retries exceeded', () => {
    mockMessage.properties.headers = {
      'x-retry-count': RABBITMQ.MAX_RETRY_COUNT,
    };

    createRetryErrorHandler(mockChannel, mockMessage, new Error('fail'));

    expect(mockChannel.nack).toHaveBeenCalledWith(mockMessage, false, false);
    expect(mockChannel.publish).not.toHaveBeenCalled();
    expect(mockChannel.ack).not.toHaveBeenCalled();
  });
});
