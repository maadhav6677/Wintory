import { describe, test, expect, vi, beforeEach } from 'vitest';
import { authenticate } from './auth.js';
import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/index.js';
import { Role } from '@prisma/client';
import { verifyToken } from '../utils/jwt.js';

// Mock the jwt utils module
vi.mock('../utils/jwt.js', () => {
  return {
    verifyToken: vi.fn(),
  };
});

describe('auth middleware - authenticate', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    nextFunction = vi.fn();
    vi.clearAllMocks();
  });

  test('should authenticate request with valid authorization header', async () => {
    const mockUserPayload = {
      id: 'user-123',
      email: 'test@wintory.com',
      role: Role.ADMIN,
      storeId: 'store-123',
    };

    mockRequest.headers = {
      authorization: 'Bearer valid-token',
    };

    vi.mocked(verifyToken).mockReturnValue(mockUserPayload);

    authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(verifyToken).toHaveBeenCalledWith('valid-token');
    expect(mockRequest.user).toEqual({
      id: 'user-123',
      email: 'test@wintory.com',
      role: Role.ADMIN,
      storeId: 'store-123',
    });
    expect(nextFunction).toHaveBeenCalledWith(); // Called with no arguments (success)
  });

  test('should throw UnauthorizedError when Authorization header is missing', async () => {
    mockRequest.headers = {};

    authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    expect(nextFunction).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Missing or invalid Authorization header' })
    );
  });

  test('should throw UnauthorizedError when Authorization header does not start with Bearer', async () => {
    mockRequest.headers = {
      authorization: 'Token invalid-format-token',
    };

    authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    expect(nextFunction).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Missing or invalid Authorization header' })
    );
  });

  test('should throw UnauthorizedError when verifyToken throws (invalid/expired token)', async () => {
    mockRequest.headers = {
      authorization: 'Bearer expired-token',
    };

    vi.mocked(verifyToken).mockImplementation(() => {
      throw new Error('Token expired');
    });

    authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(verifyToken).toHaveBeenCalledWith('expired-token');
    expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    expect(nextFunction).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Token is invalid or expired' })
    );
  });
});
