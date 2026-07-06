import { Queue } from 'bullmq';
import { redisConnection } from './redis.js';
import { logger } from './logger.js';

// Define background tasks queues
export const csvImportQueue = new Queue('csv-import', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export const notificationQueue = new Queue('notifications', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'fixed',
      delay: 10000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Graceful shutdown helper
export const closeQueues = async (): Promise<void> => {
  logger.info('Shutting down BullMQ queues...');
  await Promise.all([csvImportQueue.close(), notificationQueue.close()]);
  logger.info('BullMQ queues closed');
};
