import { Router } from 'express';
import { ProductController } from './product.controller.js';
import { authenticate } from '../../common/middlewares/auth.js';
import { authorize } from '../../common/middlewares/rbac.js';
import { validate } from '../../common/middlewares/validate.js';
import { createProductSchema, updateProductSchema, productIdParamsSchema } from './product.validation.js';
import { Role } from '@prisma/client';

const productRouter = Router();

// Apply auth middleware globally to all product endpoints
productRouter.use(authenticate);

/**
 * @openapi
 * /products:
 *   get:
 *     summary: List all products for the authenticated user's store
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products returned successfully
 *       401:
 *         description: Unauthorized — missing or invalid token
 */
productRouter.get('/', ProductController.list);

/**
 * @openapi
 * /products:
 *   post:
 *     summary: Create a new product in the authenticated user's store
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, sku, categoryId]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Château Margaux 2015
 *               sku:
 *                 type: string
 *                 example: CM-2015-750
 *               barcode:
 *                 type: string
 *                 example: "3760001631002"
 *               description:
 *                 type: string
 *                 example: Premier Grand Cru Classé, Bordeaux
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation failed or category invalid
 *       409:
 *         description: SKU already exists in this store
 */
productRouter.post('/', authorize([Role.ADMIN, Role.MANAGER]), validate(createProductSchema), ProductController.create);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     summary: Get a specific product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product returned successfully
 *       404:
 *         description: Product not found
 */
productRouter.get('/:id', validate(productIdParamsSchema), ProductController.getById);

/**
 * @openapi
 * /products/{id}:
 *   put:
 *     summary: Update an existing product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *               barcode:
 *                 type: string
 *                 nullable: true
 *               description:
 *                 type: string
 *                 nullable: true
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Validation failed or category invalid
 *       404:
 *         description: Product not found
 *       409:
 *         description: SKU already exists in this store
 */
productRouter.put(
  '/:id',
  authorize([Role.ADMIN, Role.MANAGER]),
  validate(updateProductSchema),
  ProductController.update,
);

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
productRouter.delete('/:id', authorize([Role.ADMIN]), validate(productIdParamsSchema), ProductController.delete);

export { productRouter };
export default productRouter;
