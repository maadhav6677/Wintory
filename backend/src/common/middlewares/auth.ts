import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/index.js';
import { verifyToken } from '../utils/jwt.js';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid Authorization header'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      storeId: decoded.storeId,
    };
    next();
  } catch {
    next(new UnauthorizedError('Token is invalid or expired'));
  }
};
