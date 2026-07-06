import { Router, Request, Response } from 'express';
import { authenticate } from '../../common/middlewares/auth.js';

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
 *     responses:
 *       201:
 *         description: Sale transaction recorded successfully
 */
saleRouter.post('/', (_req: Request, res: Response) => {
  res.status(201).json({
    success: true,
    message: 'Record sale transaction endpoint (scaffolded placeholder)',
  });
});

export { saleRouter };
export default saleRouter;
