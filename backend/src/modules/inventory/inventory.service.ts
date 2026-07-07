import { Inventory } from '@prisma/client';
import { IInventoryRepository, InventoryWithProduct } from './inventory.repository.js';
import { NotFoundError } from '../../common/errors/index.js';

export class InventoryService {
  constructor(private readonly inventoryRepository: IInventoryRepository) {}

  async getByProductId(productId: string, storeId: string): Promise<InventoryWithProduct> {
    const inventory = await this.inventoryRepository.findByProductId(productId);
    if (!inventory) {
      throw new NotFoundError('Inventory record not found for this product');
    }

    // Multi-tenancy: verify product belongs to the user's store
    const product = inventory.product;
    if (product && product.store && product.store.id !== storeId) {
      throw new NotFoundError('Inventory record not found for this product');
    }
    if (product && product.storeId && product.storeId !== storeId) {
      throw new NotFoundError('Inventory record not found for this product');
    }

    return inventory;
  }

  async listByStore(storeId: string): Promise<Inventory[]> {
    return this.inventoryRepository.findAllByStoreId(storeId);
  }

  async getLowStock(storeId: string): Promise<Inventory[]> {
    return this.inventoryRepository.findLowStock(storeId);
  }

  async updateStock(
    productId: string,
    data: { quantity?: number; reorderPoint?: number; reorderQuantity?: number; location?: string | null },
    storeId: string,
  ): Promise<Inventory> {
    // Verify ownership first
    await this.getByProductId(productId, storeId);

    return this.inventoryRepository.update(productId, data);
  }
}
