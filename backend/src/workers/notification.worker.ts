import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { logger } from '../config/logger.js';

export const notificationWorker = new Worker(
  'notifications',
  async (job: Job) => {
    logger.info(`[notifications] Processing job ${job.id}`, { data: job.data });
    // TODO: Implement notification dispatch (email, push, in-app) in Sprint 2
    logger.info(`[notifications] Job ${job.id} completed (placeholder)`);
  },
  {
    connection: redisConnection,
    concurrency: 5,
  },
);

notificationWorker.on('completed', (job) => {
  logger.info(`[notifications] Job ${job.id} finished successfully`);
});

notificationWorker.on('failed', (job, err) => {
  logger.error(`[notifications] Job ${job?.id} failed: ${err.message}`);
});
