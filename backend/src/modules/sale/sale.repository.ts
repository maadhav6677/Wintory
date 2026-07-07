import { Sale, Prisma } from '@prisma/client';
import { prisma } from '../../config/db.js';

export interface CreateSaleInput {
  storeId: string;
  userId: string;
  totalAmount: Prisma.Decimal;
  items: {
    productId: string;
    quantity: number;
    unitPrice: Prisma.Decimal;
    totalPrice: Prisma.Decimal;
  }[];
}

export interface ISaleRepository {
  findById(id: string): Promise<Sale | null>;
  findByStoreId(storeId: string): Promise<Sale[]>;
  create(data: CreateSaleInput): Promise<Sale>;
}

export class SaleRepository implements ISaleRepository {
  async findById(id: string): Promise<Sale | null> {
    return prisma.sale.findUnique({
      where: { id },
      include: {
        saleItems: {
          include: {
            product: {
              select: { name: true, sku: true },
            },
          },
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async findByStoreId(storeId: string): Promise<Sale[]> {
    return prisma.sale.findMany({
      where: { storeId },
      include: {
        saleItems: {
          include: {
            product: {
              select: { name: true, sku: true },
            },
          },
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: CreateSaleInput): Promise<Sale> {
    return prisma.$transaction(async (tx) => {
      // Create the sale with its items
      const sale = await tx.sale.create({
        data: {
          storeId: data.storeId,
          userId: data.userId,
          totalAmount: data.totalAmount,
          saleItems: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            })),
          },
        },
        include: {
          saleItems: {
            include: {
              product: {
                select: { name: true, sku: true },
              },
            },
          },
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });

      // Decrement inventory quantity for each item
      for (const item of data.items) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            quantity: { decrement: item.quantity },
          },
        });
      }

      return sale;
    });
  }
}
