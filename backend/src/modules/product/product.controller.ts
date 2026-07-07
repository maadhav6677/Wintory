import { Request, Response, NextFunction } from 'express';
import { ProductService } from './product.service.js';
import { ProductRepository } from './product.repository.js';

const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);

export class ProductController {
  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user!;
      const products = await productService.listByStore(currentUser.storeId);

      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = req.user!;
      const product = await productService.getById(id, currentUser.storeId);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user!;
      const { name, sku, barcode, description, categoryId } = req.body;

      const product = await productService.create({ name, sku, barcode, description, categoryId }, currentUser.storeId);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = req.user!;
      const updateData = req.body;

      const product = await productService.update(id, updateData, currentUser.storeId);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = req.user!;

      await productService.delete(id, currentUser.storeId);

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
