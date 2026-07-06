import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';
import { env } from './env.js';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'stdout', level: 'error' },
            { emit: 'stdout', level: 'info' },
            { emit: 'stdout', level: 'warn' },
          ]
        : ['error'],
  });

if (env.NODE_ENV === 'development') {
  globalThis.prisma = prisma;
}

// Log queries in development
if (env.NODE_ENV === 'development' && 'on' in prisma) {
  (prisma as any).$on('query', (e: any) => {
    logger.debug(`Query: ${e.query} - Params: ${e.params} - Duration: ${e.duration}ms`);
  });
}

export const connectDb = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('🐘 Database connected successfully via Prisma Client');
  } catch (error) {
    logger.error('❌ Failed to connect to the database:', error);
    process.exit(1);
  }
};
