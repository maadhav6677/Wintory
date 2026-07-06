import { Router, Request, Response } from 'express';
import { authenticate } from '../../common/middlewares/auth.js';

const purchaseOrderRouter = Router();

// Apply auth globally for purchase orders
purchaseOrderRouter.use(authenticate);

/**
 * @openapi
 * /purchase-orders:
 *   post:
 *     summary: Issue a new purchase order to a wholesaler
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Purchase order issued successfully
 */
purchaseOrderRouter.post('/', (_req: Request, res: Response) => {
  res.status(201).json({
    success: true,
    message: 'Create purchase order endpoint (scaffolded placeholder)',
  });
});

export { purchaseOrderRouter };
export default purchaseOrderRouter;
