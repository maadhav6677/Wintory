import { Router } from 'express';
import { CategoryController } from './category.controller.js';
import { authenticate } from '../../common/middlewares/auth.js';
import { authorize } from '../../common/middlewares/rbac.js';
import { validate } from '../../common/middlewares/validate.js';
import { createCategorySchema, updateCategorySchema, categoryIdParamsSchema } from './category.validation.js';
import { Role } from '@prisma/client';

const categoryRouter = Router();

// Apply auth middleware globally to all category endpoints
categoryRouter.use(authenticate);

/**
 * @openapi
 * /categories:
 *   get:
 *     summary: Retrieve list of categories for the current store
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories returned successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *     responses:
 *       201:
 *         description: Category created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient role
 *       409:
 *         description: Conflict - category name already exists in this store
 */
categoryRouter
  .route('/')
  .get(CategoryController.list)
  .post(authorize([Role.ADMIN, Role.MANAGER]), validate(createCategorySchema), CategoryController.create);

/**
 * @openapi
 * /categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient role
 *       404:
 *         description: Category not found
 *       409:
 *         description: Conflict - category name already exists in this store
 */

/**
 * @openapi
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient role
 *       404:
 *         description: Category not found
 */
categoryRouter
  .route('/:id')
  .put(authorize([Role.ADMIN, Role.MANAGER]), validate(updateCategorySchema), CategoryController.update)
  .delete(authorize([Role.ADMIN]), validate(categoryIdParamsSchema), CategoryController.delete);

export { categoryRouter };
export default categoryRouter;
