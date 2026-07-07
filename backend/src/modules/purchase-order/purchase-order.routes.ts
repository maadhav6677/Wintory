import { Router } from 'express';
import { PurchaseOrderController } from './purchase-order.controller.js';
import { authenticate } from '../../common/middlewares/auth.js';
import { authorize } from '../../common/middlewares/rbac.js';
import { validate } from '../../common/middlewares/validate.js';
import {
  createPurchaseOrderSchema,
  updateStatusSchema,
  purchaseOrderIdParamsSchema,
} from './purchase-order.validation.js';
import { Role } from '@prisma/client';

const purchaseOrderRouter = Router();

// Apply auth globally for purchase orders
purchaseOrderRouter.use(authenticate);

/**
 * @openapi
 * /purchase-orders:
 *   post:
 *     summary: Issue a new purchase order to a supplier
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [supplierId, items]
 *             properties:
 *               supplierId:
 *                 type: string
 *                 format: uuid
 *                 example: 5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [productId, quantity, unitPrice]
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                       example: 4a2b97c0-d3e4-4f5a-8b6c-9d8e7f6a5b4c
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       example: 50
 *                     unitPrice:
 *                       type: number
 *                       minimum: 0.01
 *                       example: 4.50
 *     responses:
 *       201:
 *         description: Purchase order created successfully
 *       400:
 *         description: Validation failed or supplier/product mismatch
 */
purchaseOrderRouter.post(
  '/',
  authorize([Role.ADMIN, Role.MANAGER]),
  validate(createPurchaseOrderSchema),
  PurchaseOrderController.create,
);

/**
 * @openapi
 * /purchase-orders:
 *   get:
 *     summary: Retrieve list of purchase orders for the store
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of purchase orders returned successfully
 *       401:
 *         description: Unauthorized
 */
purchaseOrderRouter.get('/', PurchaseOrderController.list);

/**
 * @openapi
 * /purchase-orders/{id}:
 *   get:
 *     summary: Get a specific purchase order by ID
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Purchase Order ID
 *     responses:
 *       200:
 *         description: Purchase order returned successfully
 *       404:
 *         description: Purchase order not found
 */
purchaseOrderRouter.get('/:id', validate(purchaseOrderIdParamsSchema), PurchaseOrderController.getById);

/**
 * @openapi
 * /purchase-orders/{id}/status:
 *   patch:
 *     summary: Update the status of a purchase order
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Purchase Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [DRAFT, SENT, RECEIVED, CANCELLED]
 *                 example: SENT
 *     responses:
 *       200:
 *         description: Purchase order status updated successfully
 *       400:
 *         description: Invalid status transition or validation failure
 *       404:
 *         description: Purchase order not found
 */
purchaseOrderRouter.patch(
  '/:id/status',
  authorize([Role.ADMIN, Role.MANAGER]),
  validate(updateStatusSchema),
  PurchaseOrderController.updateStatus,
);

export { purchaseOrderRouter };
export default purchaseOrderRouter;
