import { Router, Request, Response } from 'express';
import { authenticate } from '../../common/middlewares/auth.js';

const inventoryRouter = Router();

// Apply auth globally for inventory
inventoryRouter.use(authenticate);

/**
 * @openapi
 * /inventory:
 *   get:
 *     summary: Retrieve store inventory stock levels
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock levels returned successfully
 */
inventoryRouter.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Inventory stock list endpoint (scaffolded placeholder)',
    data: [],
  });
});

export { inventoryRouter };
export default inventoryRouter;
