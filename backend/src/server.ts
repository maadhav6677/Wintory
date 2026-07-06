import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDb, prisma } from './config/db.js';
import { closeQueues } from './config/queue.js';

const PORT = env.PORT;

const startServer = async () => {
  // Connect database
  await connectDb();

  // Start Express listener
  const server = app.listen(PORT, () => {
    logger.info(`🚀 Wintory Server running in [${env.NODE_ENV}] mode on http://localhost:${PORT}`);
    logger.info(`📄 API Docs available at http://localhost:${PORT}/api-docs`);
  });

  // Graceful shutdown handler
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down server gracefully...`);

    server.close(async () => {
      logger.info('HTTP server closed.');
      
      try {
        // Disconnect queues
        await closeQueues();

        // Disconnect database
        await prisma.$disconnect();
        logger.info('🐘 Database disconnected.');

        logger.info('Graceful shutdown completed. Exiting.');
        process.exit(0);
      } catch (err) {
        logger.error('Error occurred during graceful shutdown:', err);
        process.exit(1);
      }
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch((error) => {
  logger.error('Fatal error starting server:', error);
  process.exit(1);
});
