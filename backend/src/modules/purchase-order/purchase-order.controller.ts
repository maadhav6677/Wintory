import { Request, Response, NextFunction } from 'express';
import { PurchaseOrderService } from './purchase-order.service.js';
import { PurchaseOrderRepository } from './purchase-order.repository.js';

const purchaseOrderRepository = new PurchaseOrderRepository();
const purchaseOrderService = new PurchaseOrderService(purchaseOrderRepository);

export class PurchaseOrderController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user!;
      const { supplierId, items } = req.body;

      const purchaseOrder = await purchaseOrderService.createOrder(currentUser.storeId, supplierId, items);

      res.status(201).json({
        success: true,
        data: purchaseOrder,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user!;
      const purchaseOrders = await purchaseOrderService.listByStore(currentUser.storeId);

      res.status(200).json({
        success: true,
        data: purchaseOrders,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user!;
      const { id } = req.params;

      const purchaseOrder = await purchaseOrderService.getById(id, currentUser.storeId);

      res.status(200).json({
        success: true,
        data: purchaseOrder,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user!;
      const { id } = req.params;
      const { status } = req.body;

      const purchaseOrder = await purchaseOrderService.updateStatus(id, currentUser.storeId, status);

      res.status(200).json({
        success: true,
        data: purchaseOrder,
      });
    } catch (error) {
      next(error);
    }
  }
}
