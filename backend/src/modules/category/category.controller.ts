import { Request, Response, NextFunction } from 'express';
import { CategoryService } from './category.service.js';
import { CategoryRepository } from './category.repository.js';

const categoryRepository = new CategoryRepository();
const categoryService = new CategoryService(categoryRepository);

export class CategoryController {
  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user!;
      const categories = await categoryService.getCategoriesByStore(currentUser.storeId);

      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user!;
      const { name } = req.body;

      const category = await categoryService.createCategory({
        name,
        storeId: currentUser.storeId,
      });

      res.status(201).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = req.user!;
      const { name } = req.body;

      const category = await categoryService.updateCategory(id, currentUser.storeId, { name });

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = req.user!;

      await categoryService.deleteCategory(id, currentUser.storeId);

      res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
