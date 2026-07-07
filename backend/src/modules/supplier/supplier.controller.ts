import { Request, Response, NextFunction } from 'express';
import { SupplierService } from './supplier.service.js';
import { SupplierRepository } from './supplier.repository.js';

const supplierRepository = new SupplierRepository();
const supplierService = new SupplierService(supplierRepository);

export class SupplierController {
  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user!;
      const suppliers = await supplierService.getSuppliersByStore(currentUser.storeId);

      res.status(200).json({
        success: true,
        data: suppliers,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = req.user!;

      const supplier = await supplierService.getSupplierById(id, currentUser.storeId);

      res.status(200).json({
        success: true,
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user!;
      const { name, contactName, email, phone } = req.body;

      const supplier = await supplierService.createSupplier({
        name,
        contactName,
        email,
        phone,
        storeId: currentUser.storeId,
      });

      res.status(201).json({
        success: true,
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = req.user!;
      const { name, contactName, email, phone } = req.body;

      const supplier = await supplierService.updateSupplier(id, currentUser.storeId, {
        name,
        contactName,
        email,
        phone,
      });

      res.status(200).json({
        success: true,
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = req.user!;

      await supplierService.deleteSupplier(id, currentUser.storeId);

      res.status(200).json({
        success: true,
        message: 'Supplier deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
