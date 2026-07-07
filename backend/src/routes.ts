import { Router } from 'express';
import { authRouter } from './modules/auth/auth.routes.js';
import { userRouter } from './modules/user/user.routes.js';
import { productRouter } from './modules/product/product.routes.js';
import { inventoryRouter } from './modules/inventory/inventory.routes.js';
import { saleRouter } from './modules/sale/sale.routes.js';
import { purchaseOrderRouter } from './modules/purchase-order/purchase-order.routes.js';
import { categoryRouter } from './modules/category/category.routes.js';
import { supplierRouter } from './modules/supplier/supplier.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/inventory', inventoryRouter);
apiRouter.use('/sales', saleRouter);
apiRouter.use('/purchase-orders', purchaseOrderRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/suppliers', supplierRouter);

export { apiRouter };
