import { Request, Response, NextFunction } from 'express';
import { SaleService } from './sale.service.js';
import { SaleRepository } from './sale.repository.js';

const saleRepository = new SaleRepository();
const saleService = new SaleService(saleRepository);

export class SaleController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user!;
      const { items } = req.body;

      const sale = await saleService.recordSale(currentUser.storeId, currentUser.id, items);

      res.status(201).json({
        success: true,
        data: sale,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user!;
      const sales = await saleService.listByStore(currentUser.storeId);

      res.status(200).json({
        success: true,
        data: sales,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user!;
      const { id } = req.params;

      const sale = await saleService.getById(id, currentUser.storeId);

      res.status(200).json({
        success: true,
        data: sale,
      });
    } catch (error) {
      next(error);
    }
  }
}
