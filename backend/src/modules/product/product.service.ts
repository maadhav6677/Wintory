import { Product } from '@prisma/client';
import { IProductRepository } from './product.repository.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors/index.js';
import { prisma } from '../../config/db.js';

export class ProductService {
  constructor(private readonly productRepository: IProductRepository) {}

  async getById(id: string, storeId: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    if (product.storeId !== storeId) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }

  async listByStore(storeId: string): Promise<Product[]> {
    return this.productRepository.findByStoreId(storeId);
  }

  async create(
    data: { name: string; sku: string; barcode?: string; description?: string; categoryId: string },
    storeId: string,
  ): Promise<Product> {
    // Validate SKU uniqueness within the store
    const existingProduct = await this.productRepository.findBySku(storeId, data.sku);
    if (existingProduct) {
      throw new ConflictError('A product with this SKU already exists in your store');
    }

    // Verify category exists and belongs to the same store
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new BadRequestError('Category not found');
    }
    if (category.storeId !== storeId) {
      throw new BadRequestError('Category does not belong to your store');
    }

    // Create product and its default inventory record in a transaction
    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          name: data.name,
          sku: data.sku,
          barcode: data.barcode,
          description: data.description,
          categoryId: data.categoryId,
          storeId,
        },
        include: {
          category: true,
        },
      });

      await tx.inventory.create({
        data: {
          productId: newProduct.id,
          quantity: 0,
          reorderPoint: 10,
          reorderQuantity: 50,
        },
      });

      // Re-fetch to include the inventory relation
      return tx.product.findUniqueOrThrow({
        where: { id: newProduct.id },
        include: {
          category: true,
          inventory: true,
        },
      });
    });

    return product;
  }

  async update(
    id: string,
    data: { name?: string; sku?: string; barcode?: string | null; description?: string | null; categoryId?: string },
    storeId: string,
  ): Promise<Product> {
    const product = await this.getById(id, storeId);

    // If SKU is being changed, validate uniqueness
    if (data.sku && data.sku !== product.sku) {
      const existingProduct = await this.productRepository.findBySku(storeId, data.sku);
      if (existingProduct) {
        throw new ConflictError('A product with this SKU already exists in your store');
      }
    }

    // If category is being changed, verify it exists and belongs to same store
    if (data.categoryId && data.categoryId !== product.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        throw new BadRequestError('Category not found');
      }
      if (category.storeId !== storeId) {
        throw new BadRequestError('Category does not belong to your store');
      }
    }

    return this.productRepository.update(id, data);
  }

  async delete(id: string, storeId: string): Promise<Product> {
    await this.getById(id, storeId);
    return this.productRepository.delete(id);
  }
}
