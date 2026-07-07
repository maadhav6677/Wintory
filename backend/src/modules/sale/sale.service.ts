import { Prisma } from '@prisma/client';
import { ISaleRepository, CreateSaleInput } from './sale.repository.js';
import { NotFoundError, BadRequestError } from '../../common/errors/index.js';
import { prisma } from '../../config/db.js';

export class SaleService {
  constructor(private readonly saleRepository: ISaleRepository) {}

  async recordSale(
    storeId: string,
    userId: string,
    items: { productId: string; quantity: number; unitPrice: number }[],
  ) {
    // Collect all product IDs from the request
    const productIds = items.map((item) => item.productId);

    // Validate all products exist and belong to the store
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        storeId,
      },
      include: {
        inventory: true,
      },
    });

    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((p) => p.id));
      const missingIds = productIds.filter((id) => !foundIds.has(id));
      throw new BadRequestError(
        `Products not found or do not belong to this store: ${missingIds.join(', ')}`,
        'INVALID_PRODUCTS',
      );
    }

    // Validate sufficient inventory for each item
    const productMap = new Map(products.map((p) => [p.id, p]));
    for (const item of items) {
      const product = productMap.get(item.productId)!;
      if (!product.inventory) {
        throw new BadRequestError(
          `No inventory record found for product "${product.name}" (${product.sku})`,
          'NO_INVENTORY',
        );
      }
      if (product.inventory.quantity < item.quantity) {
        throw new BadRequestError(
          `Insufficient inventory for product "${product.name}" (${product.sku}). Available: ${product.inventory.quantity}, Requested: ${item.quantity}`,
          'INSUFFICIENT_INVENTORY',
        );
      }
    }

    // Calculate totalPrice per item and totalAmount
    const saleItems = items.map((item) => {
      const totalPrice = new Prisma.Decimal(item.quantity).mul(new Prisma.Decimal(item.unitPrice));
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: new Prisma.Decimal(item.unitPrice),
        totalPrice,
      };
    });

    const totalAmount = saleItems.reduce((sum, item) => sum.add(item.totalPrice), new Prisma.Decimal(0));

    const createInput: CreateSaleInput = {
      storeId,
      userId,
      totalAmount,
      items: saleItems,
    };

    return this.saleRepository.create(createInput);
  }

  async getById(id: string, storeId: string) {
    const sale = await this.saleRepository.findById(id);
    if (!sale) {
      throw new NotFoundError('Sale not found');
    }
    if (sale.storeId !== storeId) {
      throw new NotFoundError('Sale not found');
    }
    return sale;
  }

  async listByStore(storeId: string) {
    return this.saleRepository.findByStoreId(storeId);
  }
}
