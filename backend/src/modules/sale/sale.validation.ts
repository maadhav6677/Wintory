import { z } from 'zod';

export const createSaleSchema = {
  body: z.object({
    items: z
      .array(
        z.object({
          productId: z.string().uuid('productId must be a valid UUID'),
          quantity: z.number().int('quantity must be an integer').min(1, 'quantity must be at least 1'),
          unitPrice: z.number().positive('unitPrice must be a positive number'),
        }),
      )
      .min(1, 'At least one item is required'),
  }),
};

export const saleIdParamsSchema = {
  params: z.object({
    id: z.string().uuid('Sale ID must be a valid UUID'),
  }),
};
