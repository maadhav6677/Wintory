import { PurchaseOrderStatus, Prisma } from '@prisma/client';
import { IPurchaseOrderRepository, CreatePurchaseOrderInput } from './purchase-order.repository.js';
import { NotFoundError, BadRequestError } from '../../common/errors/index.js';
import { prisma } from '../../config/db.js';

// Allowed status transitions
const ALLOWED_TRANSITIONS: Record<PurchaseOrderStatus, PurchaseOrderStatus[]> = {
  DRAFT: ['SENT', 'CANCELLED'],
  SENT: ['RECEIVED', 'CANCELLED'],
  RECEIVED: [],
  CANCELLED: [],
};

export class PurchaseOrderService {
  constructor(private readonly purchaseOrderRepository: IPurchaseOrderRepository) {}

  async createOrder(
    storeId: string,
    supplierId: string,
    items: { productId: string; quantity: number; unitPrice: number }[],
  ) {
    // Validate supplier exists and belongs to the store
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier || supplier.storeId !== storeId) {
      throw new BadRequestError('Supplier not found or does not belong to this store', 'INVALID_SUPPLIER');
    }

    // Validate all products exist and belong to the store
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        storeId,
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

    // Calculate totalAmount
    const poItems = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: new Prisma.Decimal(item.unitPrice),
    }));

    const totalAmount = poItems.reduce(
      (sum, item) => sum.add(item.unitPrice.mul(new Prisma.Decimal(item.quantity))),
      new Prisma.Decimal(0),
    );

    const createInput: CreatePurchaseOrderInput = {
      storeId,
      supplierId,
      totalAmount,
      items: poItems,
    };

    return this.purchaseOrderRepository.create(createInput);
  }

  async updateStatus(id: string, storeId: string, newStatus: PurchaseOrderStatus) {
    const purchaseOrder = await this.purchaseOrderRepository.findById(id);

    if (!purchaseOrder || purchaseOrder.storeId !== storeId) {
      throw new NotFoundError('Purchase order not found');
    }

    const currentStatus = purchaseOrder.status as PurchaseOrderStatus;
    const allowedNextStatuses = ALLOWED_TRANSITIONS[currentStatus];

    if (!allowedNextStatuses.includes(newStatus)) {
      throw new BadRequestError(
        `Invalid status transition: cannot move from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowedNextStatuses.length > 0 ? allowedNextStatuses.join(', ') : 'none (terminal state)'}`,
        'INVALID_STATUS_TRANSITION',
      );
    }

    // When receiving, use the special receiveOrder method that also increments inventory
    if (newStatus === 'RECEIVED') {
      return this.purchaseOrderRepository.receiveOrder(id);
    }

    return this.purchaseOrderRepository.updateStatus(id, newStatus);
  }

  async getById(id: string, storeId: string) {
    const purchaseOrder = await this.purchaseOrderRepository.findById(id);
    if (!purchaseOrder) {
      throw new NotFoundError('Purchase order not found');
    }
    if (purchaseOrder.storeId !== storeId) {
      throw new NotFoundError('Purchase order not found');
    }
    return purchaseOrder;
  }

  async listByStore(storeId: string) {
    return this.purchaseOrderRepository.findByStoreId(storeId);
  }
}
