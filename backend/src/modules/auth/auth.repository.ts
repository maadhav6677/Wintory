import { Store, User, Prisma, Role, RefreshToken } from '@prisma/client';
import { prisma } from '../../config/db.js';

export interface IAuthRepository {
  createStoreWithOwner(
    storeName: string,
    ownerData: Omit<Prisma.UserUncheckedCreateInput, 'storeId' | 'role'>,
  ): Promise<{ store: Store; owner: User }>;

  saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<RefreshToken>;
  findRefreshToken(token: string): Promise<(RefreshToken & { user: User }) | null>;
  revokeRefreshToken(token: string): Promise<void>;
  revokeAllUserRefreshTokens(userId: string): Promise<void>;
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

  async saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  async findRefreshToken(token: string): Promise<(RefreshToken & { user: User }) | null> {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true },
    });
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }
}
