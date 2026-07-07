import { Supplier, Prisma } from '@prisma/client';
import { ISupplierRepository } from './supplier.repository.js';
import { NotFoundError, ConflictError } from '../../common/errors/index.js';

export class SupplierService {
  constructor(private readonly supplierRepository: ISupplierRepository) {}

  async getSupplierById(id: string, storeId: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) {
      throw new NotFoundError('Supplier not found');
    }
    if (supplier.storeId !== storeId) {
      throw new NotFoundError('Supplier not found');
    }
    return supplier;
  }

  async getSuppliersByStore(storeId: string): Promise<Supplier[]> {
    return this.supplierRepository.findByStoreId(storeId);
  }

  async createSupplier(data: Prisma.SupplierUncheckedCreateInput): Promise<Supplier> {
    const existing = await this.supplierRepository.findByStoreIdAndName(data.storeId, data.name);
    if (existing) {
      throw new ConflictError('A supplier with this name already exists in this store');
    }
    return this.supplierRepository.create(data);
  }

  async updateSupplier(id: string, storeId: string, data: Prisma.SupplierUpdateInput): Promise<Supplier> {
    await this.getSupplierById(id, storeId);

    if (data.name && typeof data.name === 'string') {
      const existing = await this.supplierRepository.findByStoreIdAndName(storeId, data.name);
      if (existing && existing.id !== id) {
        throw new ConflictError('A supplier with this name already exists in this store');
      }
    }

    return this.supplierRepository.update(id, data);
  }

  async deleteSupplier(id: string, storeId: string): Promise<Supplier> {
    await this.getSupplierById(id, storeId);
    return this.supplierRepository.delete(id);
  }
}
