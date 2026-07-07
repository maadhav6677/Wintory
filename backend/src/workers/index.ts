import { csvImportWorker } from './csv-import.worker.js';
import { notificationWorker } from './notification.worker.js';
import { logger } from '../config/logger.js';

/**
 * Initializes all BullMQ workers. Call this at server startup
 * so workers begin consuming jobs from their respective queues.
 */
export const initWorkers = (): void => {
  logger.info('⚙️  BullMQ workers initialized: csv-import, notifications');
};

/**
 * Gracefully closes all BullMQ workers.
 * Should be called during server shutdown alongside closeQueues().
 */
export const closeWorkers = async (): Promise<void> => {
  logger.info('Shutting down BullMQ workers...');
  await Promise.all([csvImportWorker.close(), notificationWorker.close()]);
  logger.info('BullMQ workers closed');
};
