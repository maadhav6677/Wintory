import { Store, User, Prisma, Role } from '@prisma/client';
import { prisma } from '../../config/db.js';

export interface IAuthRepository {
  createStoreWithOwner(
    storeName: string,
    ownerData: Omit<Prisma.UserUncheckedCreateInput, 'storeId' | 'role'>,
  ): Promise<{ store: Store; owner: User }>;
}

export class AuthRepository implements IAuthRepository {
  async createStoreWithOwner(
    storeName: string,
    ownerData: Omit<Prisma.UserUncheckedCreateInput, 'storeId' | 'role'>,
  ): Promise<{ store: Store; owner: User }> {
    return prisma.$transaction(async (tx) => {
      // 1. Create the new Store organization
      const store = await tx.store.create({
        data: { name: storeName },
      });

      // 2. Create the Owner/Admin User
      const owner = await tx.user.create({
        data: {
          email: ownerData.email,
          passwordHash: ownerData.passwordHash,
          firstName: ownerData.firstName,
          lastName: ownerData.lastName,
          role: Role.ADMIN, // Default role for the person registering the store
          storeId: store.id,
        },
      });

      return { store, owner };
    });
  }
}
