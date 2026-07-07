import { Router } from 'express';
import { SaleController } from './sale.controller.js';
import { authenticate } from '../../common/middlewares/auth.js';
import { validate } from '../../common/middlewares/validate.js';
import { createSaleSchema, saleIdParamsSchema } from './sale.validation.js';

const saleRouter = Router();

// Apply auth globally for sales
saleRouter.use(authenticate);

/**
 * @openapi
 * /sales:
 *   post:
 *     summary: Record a new billing transaction
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
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
 *                       example: 2
 *                     unitPrice:
 *                       type: number
 *                       minimum: 0.01
 *                       example: 12.50
 *     responses:
 *       201:
 *         description: Sale transaction recorded successfully
 *       400:
 *         description: Validation failed or insufficient inventory
 */
saleRouter.post('/', validate(createSaleSchema), SaleController.create);

/**
 * @openapi
 * /sales:
 *   get:
 *     summary: Retrieve list of sales for the store
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sales returned successfully
 *       401:
 *         description: Unauthorized
 */
saleRouter.get('/', SaleController.list);

/**
 * @openapi
 * /sales/{id}:
 *   get:
 *     summary: Get a specific sale transaction by ID
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale transaction returned successfully
 *       404:
 *         description: Sale not found
 */
saleRouter.get('/:id', validate(saleIdParamsSchema), SaleController.getById);

export { saleRouter };
export default saleRouter;
