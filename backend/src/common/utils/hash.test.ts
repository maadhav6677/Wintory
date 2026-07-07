import { describe, test, expect } from 'vitest';
import { hashPassword, comparePassword } from './hash.js';

describe('hash utils', () => {
  test('should hash password and verify it successfully', async () => {
    const password = 'my-secure-password';
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(0);

    const isMatch = await comparePassword(password, hash);
    expect(isMatch).toBe(true);
  });

  test('should fail verification for incorrect password', async () => {
    const password = 'my-secure-password';
    const wrongPassword = 'wrong-password';
    const hash = await hashPassword(password);

    const isMatch = await comparePassword(wrongPassword, hash);
    expect(isMatch).toBe(false);
  });
});
