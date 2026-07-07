import { z } from 'zod';

export const createPurchaseOrderSchema = {
  body: z.object({
    supplierId: z.string().uuid('supplierId must be a valid UUID'),
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

export const updateStatusSchema = {
  body: z.object({
    status: z.enum(['DRAFT', 'SENT', 'RECEIVED', 'CANCELLED'], {
      errorMap: () => ({ message: 'status must be one of: DRAFT, SENT, RECEIVED, CANCELLED' }),
    }),
  }),
  params: z.object({
    id: z.string().uuid('Purchase Order ID must be a valid UUID'),
  }),
};

export const purchaseOrderIdParamsSchema = {
  params: z.object({
    id: z.string().uuid('Purchase Order ID must be a valid UUID'),
  }),
};
