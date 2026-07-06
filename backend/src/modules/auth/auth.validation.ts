import { z } from 'zod';

export const loginSchema = {
  body: z.object({
    email: z.string().email('Invalid email address format'),
    password: z.string().min(1, 'Password is required'),
  }),
};

export const registerStoreSchema = {
  body: z.object({
    storeName: z.string().min(2, 'Store name must be at least 2 characters long'),
    email: z.string().email('Invalid email address format'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
  }),
};
