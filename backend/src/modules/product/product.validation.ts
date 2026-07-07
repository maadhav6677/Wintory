import { z } from 'zod';

export const createProductSchema = {
  body: z.object({
    name: z.string().min(1, 'Product name is required'),
    sku: z.string().min(1, 'SKU is required'),
    barcode: z.string().optional(),
    description: z.string().optional(),
    categoryId: z.string().uuid('Category ID must be a valid UUID'),
  }),
};

export const updateProductSchema = {
  body: z.object({
    name: z.string().min(1, 'Product name cannot be empty').optional(),
    sku: z.string().min(1, 'SKU cannot be empty').optional(),
    barcode: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    categoryId: z.string().uuid('Category ID must be a valid UUID').optional(),
  }),
  params: z.object({
    id: z.string().uuid('Product ID must be a valid UUID'),
  }),
};

export const productIdParamsSchema = {
  params: z.object({
    id: z.string().uuid('Product ID must be a valid UUID'),
  }),
};
