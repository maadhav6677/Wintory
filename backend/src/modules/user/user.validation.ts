import { z } from 'zod';

export const createUserSchema = {
  body: z.object({
    email: z.string().email('Invalid email address format'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    role: z.enum(['ADMIN', 'MANAGER', 'STAFF']).default('STAFF'),
    storeId: z.string().uuid('storeId must be a valid UUID'),
  }),
};

export const updateUserSchema = {
  body: z.object({
    email: z.string().email('Invalid email address format').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
    firstName: z.string().min(1, 'First name cannot be empty').optional(),
    lastName: z.string().min(1, 'Last name cannot be empty').optional(),
    role: z.enum(['ADMIN', 'MANAGER', 'STAFF']).optional(),
  }),
  params: z.object({
    id: z.string().uuid('User ID must be a valid UUID'),
  }),
};

export const userIdParamsSchema = {
  params: z.object({
    id: z.string().uuid('User ID must be a valid UUID'),
  }),
};
