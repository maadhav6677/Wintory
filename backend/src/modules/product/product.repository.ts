import { Product, Prisma } from '@prisma/client';
import { prisma } from '../../config/db.js';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findByStoreId(storeId: string): Promise<Product[]>;
  findBySku(storeId: string, sku: string): Promise<Product | null>;
  create(data: Prisma.ProductUncheckedCreateInput): Promise<Product>;
  update(id: string, data: Prisma.ProductUpdateInput): Promise<Product>;
  delete(id: string): Promise<Product>;
}

export class ProductRepository implements IProductRepository {
  async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        inventory: true,
      },
    });
  }

  async findByStoreId(storeId: string): Promise<Product[]> {
    return prisma.product.findMany({
      where: { storeId },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySku(storeId: string, sku: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: {
        storeId_sku: { storeId, sku },
      },
    });
  }

  async create(data: Prisma.ProductUncheckedCreateInput): Promise<Product> {
    return prisma.product.create({
      data,
      include: {
        category: true,
        inventory: true,
      },
    });
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        inventory: true,
      },
    });
  }

  async delete(id: string): Promise<Product> {
    return prisma.product.delete({
      where: { id },
    });
  }
}
