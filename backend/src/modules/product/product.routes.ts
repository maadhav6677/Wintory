import { Router, Request, Response } from 'express';
import { authenticate } from '../../common/middlewares/auth.js';

const productRouter = Router();

// Apply auth globally for products
productRouter.use(authenticate);

/**
 * @openapi
 * /products:
 *   get:
 *     summary: Retrieve list of products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products returned successfully
 */
productRouter.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Products list endpoint (scaffolded placeholder)',
    data: [],
  });
});

/**
 * @openapi
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Product created successfully
 */
productRouter.post('/', (_req: Request, res: Response) => {
  res.status(201).json({
    success: true,
    message: 'Product creation endpoint (scaffolded placeholder)',
  });
});

export { productRouter };
export default productRouter;
