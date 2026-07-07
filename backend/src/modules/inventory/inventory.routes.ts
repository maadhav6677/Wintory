import { Router } from 'express';
import { InventoryController } from './inventory.controller.js';
import { authenticate } from '../../common/middlewares/auth.js';
import { authorize } from '../../common/middlewares/rbac.js';
import { validate } from '../../common/middlewares/validate.js';
import { updateInventorySchema, inventoryProductIdParamsSchema } from './inventory.validation.js';
import { Role } from '@prisma/client';

const inventoryRouter = Router();

// Apply auth middleware globally to all inventory endpoints
inventoryRouter.use(authenticate);

/**
 * @openapi
 * /inventory:
 *   get:
 *     summary: List all inventory stock levels for the authenticated user's store
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory stock levels returned successfully
 *       401:
 *         description: Unauthorized — missing or invalid token
 */
inventoryRouter.get('/', InventoryController.list);

/**
 * @openapi
 * /inventory/low-stock:
 *   get:
 *     summary: List products with stock at or below their reorder point
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Low stock items returned successfully
 *       401:
 *         description: Unauthorized — missing or invalid token
 */
inventoryRouter.get('/low-stock', InventoryController.getLowStock);

/**
 * @openapi
 * /inventory/{productId}:
 *   get:
 *     summary: Get inventory record for a specific product
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Inventory record returned successfully
 *       404:
 *         description: Inventory record not found for this product
 */
inventoryRouter.get('/:productId', validate(inventoryProductIdParamsSchema), InventoryController.getByProductId);

/**
 * @openapi
 * /inventory/{productId}:
 *   patch:
 *     summary: Update stock levels and inventory settings for a product
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 0
 *                 example: 100
 *               reorderPoint:
 *                 type: integer
 *                 minimum: 0
 *                 example: 15
 *               reorderQuantity:
 *                 type: integer
 *                 minimum: 0
 *                 example: 50
 *               location:
 *                 type: string
 *                 nullable: true
 *                 example: "Aisle B, Shelf 3"
 *     responses:
 *       200:
 *         description: Inventory updated successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Inventory record not found for this product
 */
inventoryRouter.patch(
  '/:productId',
  authorize([Role.ADMIN, Role.MANAGER]),
  validate(updateInventorySchema),
  InventoryController.updateStock,
);

export { inventoryRouter };
export default inventoryRouter;
