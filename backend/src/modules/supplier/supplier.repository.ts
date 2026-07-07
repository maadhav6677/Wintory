import { Supplier, Prisma } from '@prisma/client';
import { prisma } from '../../config/db.js';

export interface ISupplierRepository {
  findById(id: string): Promise<Supplier | null>;
  findByStoreId(storeId: string): Promise<Supplier[]>;
  findByStoreIdAndName(storeId: string, name: string): Promise<Supplier | null>;
  create(data: Prisma.SupplierUncheckedCreateInput): Promise<Supplier>;
  update(id: string, data: Prisma.SupplierUpdateInput): Promise<Supplier>;
  delete(id: string): Promise<Supplier>;
}

export class SupplierRepository implements ISupplierRepository {
  async findById(id: string): Promise<Supplier | null> {
    return prisma.supplier.findUnique({
      where: { id },
    });
  }

  async findByStoreId(storeId: string): Promise<Supplier[]> {
    return prisma.supplier.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStoreIdAndName(storeId: string, name: string): Promise<Supplier | null> {
    return prisma.supplier.findUnique({
      where: { storeId_name: { storeId, name } },
    });
  }

  async create(data: Prisma.SupplierUncheckedCreateInput): Promise<Supplier> {
    return prisma.supplier.create({
      data,
    });
  }

  async update(id: string, data: Prisma.SupplierUpdateInput): Promise<Supplier> {
    return prisma.supplier.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Supplier> {
    return prisma.supplier.delete({
      where: { id },
    });
  }
}
