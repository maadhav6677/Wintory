import { z } from 'zod';

export const updateInventorySchema = {
  body: z.object({
    quantity: z.number().int().min(0, 'Quantity must be a non-negative integer').optional(),
    reorderPoint: z.number().int().min(0, 'Reorder point must be a non-negative integer').optional(),
    reorderQuantity: z.number().int().min(0, 'Reorder quantity must be a non-negative integer').optional(),
    location: z.string().nullable().optional(),
  }),
  params: z.object({
    productId: z.string().uuid('Product ID must be a valid UUID'),
  }),
};

export const inventoryProductIdParamsSchema = {
  params: z.object({
    productId: z.string().uuid('Product ID must be a valid UUID'),
  }),
};
