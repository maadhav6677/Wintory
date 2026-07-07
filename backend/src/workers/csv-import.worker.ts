import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { logger } from '../config/logger.js';

export const csvImportWorker = new Worker(
  'csv-import',
  async (job: Job) => {
    logger.info(`[csv-import] Processing job ${job.id}`, { data: job.data });
    // TODO: Implement CSV parsing and inventory import logic in Sprint 2
    logger.info(`[csv-import] Job ${job.id} completed (placeholder)`);
  },
  {
    connection: redisConnection,
    concurrency: 2,
  },
);

csvImportWorker.on('completed', (job) => {
  logger.info(`[csv-import] Job ${job.id} finished successfully`);
});

csvImportWorker.on('failed', (job, err) => {
  logger.error(`[csv-import] Job ${job?.id} failed: ${err.message}`);
});
