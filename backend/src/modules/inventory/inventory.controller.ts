import { Request, Response, NextFunction } from 'express';
import { InventoryService } from './inventory.service.js';
import { InventoryRepository } from './inventory.repository.js';

const inventoryRepository = new InventoryRepository();
const inventoryService = new InventoryService(inventoryRepository);

export class InventoryController {
  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user!;
      const inventory = await inventoryService.listByStore(currentUser.storeId);

      res.status(200).json({
        success: true,
        data: inventory,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getLowStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user!;
      const lowStockItems = await inventoryService.getLowStock(currentUser.storeId);

      res.status(200).json({
        success: true,
        data: lowStockItems,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getByProductId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId } = req.params;
      const currentUser = req.user!;
      const inventory = await inventoryService.getByProductId(productId, currentUser.storeId);

      res.status(200).json({
        success: true,
        data: inventory,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId } = req.params;
      const currentUser = req.user!;
      const updateData = req.body;

      const inventory = await inventoryService.updateStock(productId, updateData, currentUser.storeId);

      res.status(200).json({
        success: true,
        data: inventory,
      });
    } catch (error) {
      next(error);
    }
  }
}
