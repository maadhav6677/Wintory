import { Category, Prisma } from '@prisma/client';
import { prisma } from '../../config/db.js';

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findByStoreId(storeId: string): Promise<Category[]>;
  findByStoreIdAndName(storeId: string, name: string): Promise<Category | null>;
  create(data: Prisma.CategoryUncheckedCreateInput): Promise<Category>;
  update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category>;
  delete(id: string): Promise<Category>;
}

export class CategoryRepository implements ICategoryRepository {
  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id },
    });
  }

  async findByStoreId(storeId: string): Promise<Category[]> {
    return prisma.category.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStoreIdAndName(storeId: string, name: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { storeId_name: { storeId, name } },
    });
  }

  async create(data: Prisma.CategoryUncheckedCreateInput): Promise<Category> {
    return prisma.category.create({
      data,
    });
  }

  async update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Category> {
    return prisma.category.delete({
      where: { id },
    });
  }
}
