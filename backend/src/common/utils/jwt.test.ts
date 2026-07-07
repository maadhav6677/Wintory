import { describe, test, expect } from 'vitest';
import { generateToken, verifyToken, type JwtPayload } from './jwt.js';
import { Role } from '@prisma/client';

describe('jwt utils', () => {
  const mockPayload: JwtPayload = {
    id: 'user-123',
    email: 'test@example.com',
    role: Role.ADMIN,
    storeId: 'store-456',
  };

  test('should generate a valid JWT token', () => {
    const token = generateToken(mockPayload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // Standard JWT has 3 parts
  });

  test('should verify a valid token and return payload', () => {
    const token = generateToken(mockPayload);
    const decoded = verifyToken(token);

    expect(decoded).toBeDefined();
    expect(decoded.id).toBe(mockPayload.id);
    expect(decoded.email).toBe(mockPayload.email);
    expect(decoded.role).toBe(mockPayload.role);
    expect(decoded.storeId).toBe(mockPayload.storeId);
  });

  test('should throw error when verifying invalid token', () => {
    expect(() => verifyToken('invalid-token')).toThrow();
  });
});
