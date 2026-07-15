import { Store, User, Prisma } from '@prisma/client';
import { IAuthRepository } from './auth.repository.js';
import { IUserRepository } from '../user/user.repository.js';
import { ConflictError, UnauthorizedError } from '../../common/errors/index.js';
import { comparePassword, hashPassword } from '../../common/utils/hash.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../common/utils/jwt.js';
import { env } from '../../config/env.js';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'passwordHash'>;
}

export interface RegisterResult {
  accessToken: string;
  refreshToken: string;
  store: Store;
  owner: Omit<User, 'passwordHash'>;
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

const parseExpiryToDate = (expiry: string): Date => {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) {
    // Default to 7 days
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];
  let ms = 0;
  switch (unit) {
    case 's':
      ms = value * 1000;
      break;
    case 'm':
      ms = value * 60 * 1000;
      break;
    case 'h':
      ms = value * 60 * 60 * 1000;
      break;
    case 'd':
      ms = value * 24 * 60 * 60 * 1000;
      break;
  }
  return new Date(Date.now() + ms);
};

export class AuthService {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      storeId: user.storeId,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    const expiresAt = parseExpiryToDate(env.JWT_REFRESH_EXPIRES_IN);

    await this.authRepository.saveRefreshToken(user.id, refreshToken, expiresAt);

    const { passwordHash: _, ...safeUser } = user;

    return { accessToken, refreshToken, user: safeUser };
  }

  async registerStore(
    storeName: string,
    ownerData: Omit<Prisma.UserUncheckedCreateInput, 'storeId' | 'role'>,
  ): Promise<RegisterResult> {
    const existingUser = await this.userRepository.findByEmail(ownerData.email);
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    const hashedPassword = await hashPassword(ownerData.passwordHash);

    const { store, owner } = await this.authRepository.createStoreWithOwner(storeName, {
      ...ownerData,
      passwordHash: hashedPassword,
    });

    const payload = {
      id: owner.id,
      email: owner.email,
      role: owner.role,
      storeId: owner.storeId,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    const expiresAt = parseExpiryToDate(env.JWT_REFRESH_EXPIRES_IN);

    await this.authRepository.saveRefreshToken(owner.id, refreshToken, expiresAt);

    const { passwordHash: _, ...safeOwner } = owner;

    return { accessToken, refreshToken, store, owner: safeOwner };
  }

  async refresh(token: string): Promise<RefreshResult> {
    try {
      // 1. Verify refresh token signature and expiry from JWT claims
      const decoded = verifyRefreshToken(token);

      // 2. Fetch the refresh token from the database
      const storedToken = await this.authRepository.findRefreshToken(token);

      // 3. Ensure token exists, belongs to decoded user, has not been revoked, and database-tracked expiry has not passed
      if (
        !storedToken ||
        storedToken.userId !== decoded.id ||
        storedToken.isRevoked ||
        storedToken.expiresAt < new Date()
      ) {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }

      // 4. Generate new tokens (token rotation)
      const payload = {
        id: storedToken.user.id,
        email: storedToken.user.email,
        role: storedToken.user.role,
        storeId: storedToken.user.storeId,
      };

      const newAccessToken = generateAccessToken(payload);
      const newRefreshToken = generateRefreshToken(payload);
      const newExpiresAt = parseExpiryToDate(env.JWT_REFRESH_EXPIRES_IN);

      // 5. Revoke old token and save new token
      await this.authRepository.revokeRefreshToken(token);
      await this.authRepository.saveRefreshToken(storedToken.userId, newRefreshToken, newExpiresAt);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async logout(token: string): Promise<void> {
    try {
      await this.authRepository.revokeRefreshToken(token);
    } catch {
      // Fail silently on database logout errors (noop)
    }
  }
}
