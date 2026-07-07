import { describe, test, expect } from 'vitest';
import { loginSchema, registerStoreSchema } from './auth.validation.js';

describe('auth validation schemas', () => {
  describe('loginSchema', () => {
    test('should validate correct login data successfully', () => {
      const validData = {
        body: {
          email: 'test@example.com',
          password: 'securePassword123',
        },
      };

      const result = loginSchema.body.safeParse(validData.body);
      expect(result.success).toBe(true);
    });

    test('should fail validation with invalid email format', () => {
      const invalidData = {
        body: {
          email: 'invalid-email',
          password: 'securePassword123',
        },
      };

      const result = loginSchema.body.safeParse(invalidData.body);
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailErrors = result.error.format().email?._errors;
        expect(emailErrors).toContain('Invalid email address format');
      }
    });

    test('should fail validation with empty password', () => {
      const invalidData = {
        body: {
          email: 'test@example.com',
          password: '',
        },
      };

      const result = loginSchema.body.safeParse(invalidData.body);
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordErrors = result.error.format().password?._errors;
        expect(passwordErrors).toContain('Password is required');
      }
    });
  });

  describe('registerStoreSchema', () => {
    test('should validate correct register data successfully', () => {
      const validData = {
        body: {
          storeName: 'My Awesome Store',
          email: 'admin@store.com',
          password: 'strongpassword',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      const result = registerStoreSchema.body.safeParse(validData.body);
      expect(result.success).toBe(true);
    });

    test('should fail validation when store name is too short', () => {
      const invalidData = {
        body: {
          storeName: 'A',
          email: 'admin@store.com',
          password: 'strongpassword',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      const result = registerStoreSchema.body.safeParse(invalidData.body);
      expect(result.success).toBe(false);
      if (!result.success) {
        const storeNameErrors = result.error.format().storeName?._errors;
        expect(storeNameErrors).toContain('Store name must be at least 2 characters long');
      }
    });

    test('should fail validation when password is too short', () => {
      const invalidData = {
        body: {
          storeName: 'My Awesome Store',
          email: 'admin@store.com',
          password: 'short',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      const result = registerStoreSchema.body.safeParse(invalidData.body);
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordErrors = result.error.format().password?._errors;
        expect(passwordErrors).toContain('Password must be at least 6 characters long');
      }
    });
  });
});
