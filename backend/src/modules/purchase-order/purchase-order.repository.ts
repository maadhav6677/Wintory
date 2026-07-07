import { PurchaseOrder, PurchaseOrderStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/db.js';

export interface CreatePurchaseOrderInput {
  storeId: string;
  supplierId: string;
  totalAmount: Prisma.Decimal;
  items: {
    productId: string;
    quantity: number;
    unitPrice: Prisma.Decimal;
  }[];
}

export interface IPurchaseOrderRepository {
  findById(id: string): Promise<PurchaseOrder | null>;
  findByStoreId(storeId: string): Promise<PurchaseOrder[]>;
  create(data: CreatePurchaseOrderInput): Promise<PurchaseOrder>;
  updateStatus(id: string, status: PurchaseOrderStatus): Promise<PurchaseOrder>;
  receiveOrder(id: string): Promise<PurchaseOrder>;
}

export class PurchaseOrderRepository implements IPurchaseOrderRepository {
  async findById(id: string): Promise<PurchaseOrder | null> {
    return prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        purchaseOrderItems: {
          include: {
            product: {
              select: { id: true, name: true, sku: true },
            },
          },
        },
        supplier: true,
      },
    });
  }

  async findByStoreId(storeId: string): Promise<PurchaseOrder[]> {
    return prisma.purchaseOrder.findMany({
      where: { storeId },
      include: {
        purchaseOrderItems: {
          include: {
            product: {
              select: { id: true, name: true, sku: true },
            },
          },
        },
        supplier: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: CreatePurchaseOrderInput): Promise<PurchaseOrder> {
    return prisma.$transaction(async (tx) => {
      const purchaseOrder = await tx.purchaseOrder.create({
        data: {
          storeId: data.storeId,
          supplierId: data.supplierId,
          totalAmount: data.totalAmount,
          purchaseOrderItems: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: {
          purchaseOrderItems: {
            include: {
              product: {
                select: { id: true, name: true, sku: true },
              },
            },
          },
          supplier: true,
        },
      });

      return purchaseOrder;
    });
  }

  async updateStatus(id: string, status: PurchaseOrderStatus): Promise<PurchaseOrder> {
    return prisma.purchaseOrder.update({
      where: { id },
      data: { status },
      include: {
        purchaseOrderItems: {
          include: {
            product: {
              select: { id: true, name: true, sku: true },
            },
          },
        },
        supplier: true,
      },
    });
  }

  async receiveOrder(id: string): Promise<PurchaseOrder> {
    return prisma.$transaction(async (tx) => {
      // Set status to RECEIVED
      const purchaseOrder = await tx.purchaseOrder.update({
        where: { id },
        data: { status: 'RECEIVED' },
        include: {
          purchaseOrderItems: {
            include: {
              product: {
                select: { id: true, name: true, sku: true },
              },
            },
          },
          supplier: true,
        },
      });

      // Increment inventory for each PO item
      for (const item of purchaseOrder.purchaseOrderItems) {
        await tx.inventory.upsert({
          where: { productId: item.productId },
          update: {
            quantity: { increment: item.quantity },
          },
          create: {
            productId: item.productId,
            quantity: item.quantity,
          },
        });
      }

      return purchaseOrder;
    });
  }
}
