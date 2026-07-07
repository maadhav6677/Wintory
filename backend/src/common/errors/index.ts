export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;
  public readonly details: unknown;

  constructor(message: string, statusCode: number, errorCode = 'INTERNAL_ERROR', details: unknown = null) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', errorCode = 'BAD_REQUEST', details: unknown = null) {
    super(message, 400, errorCode, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access', errorCode = 'UNAUTHORIZED') {
    super(message, 401, errorCode);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden', errorCode = 'FORBIDDEN') {
    super(message, 403, errorCode);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', errorCode = 'NOT_FOUND') {
    super(message, 404, errorCode);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', errorCode = 'CONFLICT') {
    super(message, 409, errorCode);
  }
}

export class ValidationError extends AppError {
  constructor(details: unknown, message = 'Validation failed') {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}
