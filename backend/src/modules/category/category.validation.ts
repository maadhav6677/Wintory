import { z } from 'zod';

export const createCategorySchema = {
  body: z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters'),
  }),
};

export const updateCategorySchema = {
  body: z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters').optional(),
  }),
  params: z.object({
    id: z.string().uuid('Category ID must be a valid UUID'),
  }),
};

export const categoryIdParamsSchema = {
  params: z.object({
    id: z.string().uuid('Category ID must be a valid UUID'),
  }),
};
