import { Category, Prisma } from '@prisma/client';
import { ICategoryRepository } from './category.repository.js';
import { NotFoundError, ConflictError } from '../../common/errors/index.js';

export class CategoryService {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async getCategoryById(id: string, storeId: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    if (category.storeId !== storeId) {
      throw new NotFoundError('Category not found');
    }
    return category;
  }

  async getCategoriesByStore(storeId: string): Promise<Category[]> {
    return this.categoryRepository.findByStoreId(storeId);
  }

  async createCategory(data: Prisma.CategoryUncheckedCreateInput): Promise<Category> {
    const existing = await this.categoryRepository.findByStoreIdAndName(data.storeId, data.name);
    if (existing) {
      throw new ConflictError('A category with this name already exists in this store');
    }
    return this.categoryRepository.create(data);
  }

  async updateCategory(id: string, storeId: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
    await this.getCategoryById(id, storeId);

    if (data.name && typeof data.name === 'string') {
      const existing = await this.categoryRepository.findByStoreIdAndName(storeId, data.name);
      if (existing && existing.id !== id) {
        throw new ConflictError('A category with this name already exists in this store');
      }
    }

    return this.categoryRepository.update(id, data);
  }

  async deleteCategory(id: string, storeId: string): Promise<Category> {
    await this.getCategoryById(id, storeId);
    return this.categoryRepository.delete(id);
  }
}
