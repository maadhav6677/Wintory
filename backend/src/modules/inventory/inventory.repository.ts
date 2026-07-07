import { Inventory, Prisma } from '@prisma/client';
import { prisma } from '../../config/db.js';

export type InventoryWithProduct = Prisma.InventoryGetPayload<{
  include: {
    product: {
      include: {
        store: true;
      };
    };
  };
}>;

export interface IInventoryRepository {
  findByProductId(productId: string): Promise<InventoryWithProduct | null>;
  findAllByStoreId(storeId: string): Promise<Inventory[]>;
  findLowStock(storeId: string): Promise<Inventory[]>;
  update(productId: string, data: Prisma.InventoryUpdateInput): Promise<Inventory>;
}

export class InventoryRepository implements IInventoryRepository {
  async findByProductId(productId: string): Promise<InventoryWithProduct | null> {
    return prisma.inventory.findUnique({
      where: { productId },
      include: {
        product: {
          include: {
            store: true,
          },
        },
      },
    });
  }

  async findAllByStoreId(storeId: string): Promise<Inventory[]> {
    return prisma.inventory.findMany({
      where: {
        product: {
          storeId,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findLowStock(storeId: string): Promise<Inventory[]> {
    // Prisma does not support column-to-column comparisons in where clauses,
    // so we fetch all store inventory and filter in application code.
    const allInventory = await prisma.inventory.findMany({
      where: {
        product: {
          storeId,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
      orderBy: { quantity: 'asc' },
    });

    return allInventory.filter((inv) => inv.quantity <= inv.reorderPoint);
  }

  async update(productId: string, data: Prisma.InventoryUpdateInput): Promise<Inventory> {
    return prisma.inventory.update({
      where: { productId },
      data,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    });
  }
}
