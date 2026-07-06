import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { swaggerSpec } from './config/swagger.js';
import { errorHandler } from './common/middlewares/errorHandler.js';
import { NotFoundError } from './common/errors/index.js';
import { apiRouter } from './routes.js';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logger middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.http(`${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Swagger Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use(env.API_PREFIX, apiRouter);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', environment: env.NODE_ENV });
});

// 404 handler for unmatched routes
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError(`Cannot ${req.method} ${req.path}`));
});

// Global Error Handler Middleware
app.use(errorHandler);

export { app };
export default app;
