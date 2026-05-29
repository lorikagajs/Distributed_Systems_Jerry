import type { BullRootModuleOptions } from '@nestjs/bullmq';
import type { ConfigService } from '@nestjs/config';
import type { QueueOptions } from 'bullmq';
import {
  EMAIL_QUEUE,
  EMAIL_QUEUE_BACKOFF_DELAY_MS,
  EMAIL_QUEUE_DEFAULT_ATTEMPTS,
} from './email.constants';
import { parseRedisConnection } from './redis-connection.util';

export function buildBullRootOptions(
  config: ConfigService,
): BullRootModuleOptions {
  const redisUrl = config.get<string>('REDIS_URL', 'redis://localhost:6379');
  const { host, port } = parseRedisConnection(redisUrl);

  return {
    connection: {
      host,
      port,
      maxRetriesPerRequest: null,
    },
  };
}

export function isEmailQueueEnabled(config: ConfigService): boolean {
  return config.get<string>('EMAIL_USE_QUEUE', 'true').toLowerCase() !== 'false';
}

export function buildEmailQueueOptions(): Omit<QueueOptions, 'connection'> {
  return {
    defaultJobOptions: {
      attempts: EMAIL_QUEUE_DEFAULT_ATTEMPTS,
      backoff: {
        type: 'exponential',
        delay: EMAIL_QUEUE_BACKOFF_DELAY_MS,
      },
      removeOnComplete: 200,
      removeOnFail: 500,
    },
  };
}

export const EMAIL_QUEUE_REGISTRATION = {
  name: EMAIL_QUEUE,
  ...buildEmailQueueOptions(),
} as const;
