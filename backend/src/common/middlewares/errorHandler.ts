import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/index.js';
import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details: any = null;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
    details = err.details;

    // Log operational errors as warnings or info
    logger.warn(
      `Operational Error: [${req.method}] ${req.path} - Status: ${statusCode} - Code: ${errorCode} - Message: ${message}`,
    );
  } else {
    // Unhandled application crash / native errors (e.g. database disconnect, reference errors)
    logger.error(`System Error: [${req.method}] ${req.path}`, err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message: env.NODE_ENV === 'production' && statusCode === 500 ? 'An unexpected error occurred' : message,
      code: errorCode,
      details: details,
      stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
};
