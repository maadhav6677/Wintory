import { z } from 'zod';

export const createSupplierSchema = {
  body: z.object({
    name: z.string().min(2, 'Supplier name must be at least 2 characters'),
    contactName: z.string().min(1, 'Contact name cannot be empty').optional(),
    email: z.string().email('Invalid email address format').optional(),
    phone: z.string().min(1, 'Phone number cannot be empty').optional(),
  }),
};

export const updateSupplierSchema = {
  body: z.object({
    name: z.string().min(2, 'Supplier name must be at least 2 characters').optional(),
    contactName: z.string().min(1, 'Contact name cannot be empty').optional(),
    email: z.string().email('Invalid email address format').optional(),
    phone: z.string().min(1, 'Phone number cannot be empty').optional(),
  }),
  params: z.object({
    id: z.string().uuid('Supplier ID must be a valid UUID'),
  }),
};

export const supplierIdParamsSchema = {
  params: z.object({
    id: z.string().uuid('Supplier ID must be a valid UUID'),
  }),
};
