import { Router } from 'express';
import { SupplierController } from './supplier.controller.js';
import { authenticate } from '../../common/middlewares/auth.js';
import { authorize } from '../../common/middlewares/rbac.js';
import { validate } from '../../common/middlewares/validate.js';
import { createSupplierSchema, updateSupplierSchema, supplierIdParamsSchema } from './supplier.validation.js';
import { Role } from '@prisma/client';

const supplierRouter = Router();

// Apply auth middleware globally to all supplier endpoints
supplierRouter.use(authenticate);

/**
 * @openapi
 * /suppliers:
 *   get:
 *     summary: Retrieve list of suppliers for the current store
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of suppliers returned successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /suppliers:
 *   post:
 *     summary: Create a new supplier
 *     tags: [Suppliers]
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
 *               contactName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Supplier created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient role
 *       409:
 *         description: Conflict - supplier name already exists in this store
 */
supplierRouter
  .route('/')
  .get(SupplierController.list)
  .post(authorize([Role.ADMIN, Role.MANAGER]), validate(createSupplierSchema), SupplierController.create);

/**
 * @openapi
 * /suppliers/{id}:
 *   get:
 *     summary: Retrieve a specific supplier by ID
 *     tags: [Suppliers]
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
 *         description: Supplier returned successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Supplier not found
 */

/**
 * @openapi
 * /suppliers/{id}:
 *   put:
 *     summary: Update a supplier
 *     tags: [Suppliers]
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
 *               contactName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Supplier updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient role
 *       404:
 *         description: Supplier not found
 *       409:
 *         description: Conflict - supplier name already exists in this store
 */

/**
 * @openapi
 * /suppliers/{id}:
 *   delete:
 *     summary: Delete a supplier
 *     tags: [Suppliers]
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
 *         description: Supplier deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient role
 *       404:
 *         description: Supplier not found
 */
supplierRouter
  .route('/:id')
  .get(validate(supplierIdParamsSchema), SupplierController.getById)
  .put(authorize([Role.ADMIN, Role.MANAGER]), validate(updateSupplierSchema), SupplierController.update)
  .delete(authorize([Role.ADMIN]), validate(supplierIdParamsSchema), SupplierController.delete);

export { supplierRouter };
export default supplierRouter;
