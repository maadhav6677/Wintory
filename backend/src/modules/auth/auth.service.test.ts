import { describe, test, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service.js';
import { IAuthRepository } from './auth.repository.js';
import { IUserRepository } from '../user/user.repository.js';
import { ConflictError, UnauthorizedError } from '../../common/errors/index.js';
import { Role } from '@prisma/client';

describe('AuthService', () => {
  let authService: AuthService;
  let mockAuthRepository: IAuthRepository;
  let mockUserRepository: IUserRepository;

  const mockDate = new Date();

  beforeEach(() => {
    mockAuthRepository = {
      createStoreWithOwner: vi.fn(),
      saveRefreshToken: vi.fn(),
      findRefreshToken: vi.fn(),
      revokeRefreshToken: vi.fn(),
      revokeAllUserRefreshTokens: vi.fn(),
    };
    mockUserRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      listByStore: vi.fn(),
    };
    authService = new AuthService(mockAuthRepository, mockUserRepository);
  });

  describe('registerStore', () => {
    test('should register store and owner admin user successfully and issue tokens', async () => {
      const storeName = 'Organic Mart';
      const ownerData = {
        email: 'owner@organic.com',
        passwordHash: 'rawPassword',
        firstName: 'Alice',
        lastName: 'Smith',
      };

      mockUserRepository.findByEmail = vi.fn().mockResolvedValue(null);
      mockAuthRepository.createStoreWithOwner = vi.fn().mockResolvedValue({
        store: { id: 'store-123', name: storeName, code: null, isActive: true, createdAt: mockDate, updatedAt: mockDate },
        owner: {
          id: 'user-123',
          email: ownerData.email,
          passwordHash: 'hashedPassword',
          firstName: ownerData.firstName,
          lastName: ownerData.lastName,
          phone: null,
          role: Role.ADMIN,
          isActive: true,
          lastLoginAt: null,
          storeId: 'store-123',
          createdAt: mockDate,
          updatedAt: mockDate,
        },
      });

      const result = await authService.registerStore(storeName, ownerData);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(ownerData.email);
      expect(mockAuthRepository.createStoreWithOwner).toHaveBeenCalledWith(storeName, {
        ...ownerData,
        passwordHash: expect.any(String),
      });
      expect(mockAuthRepository.saveRefreshToken).toHaveBeenCalledWith('user-123', expect.any(String), expect.any(Date));
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.store.name).toBe(storeName);
      expect(result.owner.email).toBe(ownerData.email);
      expect(result.owner.role).toBe(Role.ADMIN);
      expect('passwordHash' in result.owner).toBe(false);
    });

    test('should throw ConflictError if user email is already registered', async () => {
      const storeName = 'Organic Mart';
      const ownerData = {
        email: 'owner@organic.com',
        passwordHash: 'rawPassword',
        firstName: 'Alice',
        lastName: 'Smith',
      };

      mockUserRepository.findByEmail = vi.fn().mockResolvedValue({
        id: 'existing-id',
        email: ownerData.email,
      });

      await expect(authService.registerStore(storeName, ownerData)).rejects.toThrow(ConflictError);
      expect(mockAuthRepository.createStoreWithOwner).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    test('should authenticate and issue access and refresh tokens on valid credentials', async () => {
      const loginEmail = 'owner@organic.com';
      const rawPassword = 'rawPassword';
      
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.genSalt(10).then(salt => bcrypt.hash(rawPassword, salt));

      mockUserRepository.findByEmail = vi.fn().mockResolvedValue({
        id: 'user-123',
        email: loginEmail,
        passwordHash: hashedPassword,
        firstName: 'Alice',
        lastName: 'Smith',
        phone: null,
        role: Role.ADMIN,
        isActive: true,
        lastLoginAt: null,
        storeId: 'store-123',
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      const result = await authService.login(loginEmail, rawPassword);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginEmail);
      expect(mockAuthRepository.saveRefreshToken).toHaveBeenCalledWith('user-123', expect.any(String), expect.any(Date));
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe(loginEmail);
      expect('passwordHash' in result.user).toBe(false);
    });

    test('should throw UnauthorizedError on invalid password', async () => {
      const loginEmail = 'owner@organic.com';
      
      mockUserRepository.findByEmail = vi.fn().mockResolvedValue({
        id: 'user-123',
        email: loginEmail,
        passwordHash: 'someHashedPassword',
      });

      await expect(authService.login(loginEmail, 'wrongPassword')).rejects.toThrow(UnauthorizedError);
      expect(mockAuthRepository.saveRefreshToken).not.toHaveBeenCalled();
    });

    test('should throw UnauthorizedError if user is not found', async () => {
      mockUserRepository.findByEmail = vi.fn().mockResolvedValue(null);
      await expect(authService.login('unknown@email.com', 'pwd')).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('refresh', () => {
    test('should rotate refresh token and issue new access token on valid token', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'owner@organic.com',
        role: Role.ADMIN,
        storeId: 'store-123',
      };

      const jwt = await import('../../common/utils/jwt.js');
      const signedOldToken = jwt.generateRefreshToken(mockUser);

      mockAuthRepository.findRefreshToken = vi.fn().mockResolvedValue({
        id: 'token-uuid',
        token: signedOldToken,
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // Expiry in 1 hour
        isRevoked: false,
        user: mockUser,
      });

      const result = await authService.refresh(signedOldToken);

      expect(mockAuthRepository.findRefreshToken).toHaveBeenCalledWith(signedOldToken);
      expect(mockAuthRepository.revokeRefreshToken).toHaveBeenCalledWith(signedOldToken);
      expect(mockAuthRepository.saveRefreshToken).toHaveBeenCalledWith('user-123', expect.any(String), expect.any(Date));
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.refreshToken).not.toBe(signedOldToken);
    });

    test('should throw UnauthorizedError if token is revoked', async () => {
      const jwt = await import('../../common/utils/jwt.js');
      const signedToken = jwt.generateRefreshToken({
        id: 'user-123',
        email: 'owner@organic.com',
        role: Role.ADMIN,
        storeId: 'store-123',
      });

      mockAuthRepository.findRefreshToken = vi.fn().mockResolvedValue({
        id: 'token-uuid',
        token: signedToken,
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        isRevoked: true,
      });

      await expect(authService.refresh(signedToken)).rejects.toThrow(UnauthorizedError);
    });

    test('should throw UnauthorizedError if token in database belongs to another user', async () => {
      const jwt = await import('../../common/utils/jwt.js');
      const signedToken = jwt.generateRefreshToken({
        id: 'user-123',
        email: 'owner@organic.com',
        role: Role.ADMIN,
        storeId: 'store-123',
      });

      mockAuthRepository.findRefreshToken = vi.fn().mockResolvedValue({
        id: 'token-uuid',
        token: signedToken,
        userId: 'different-user-id',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        isRevoked: false,
      });

      await expect(authService.refresh(signedToken)).rejects.toThrow(UnauthorizedError);
    });

    test('should throw UnauthorizedError if token has expired', async () => {
      const jwt = await import('../../common/utils/jwt.js');
      const signedToken = jwt.generateRefreshToken({
        id: 'user-123',
        email: 'owner@organic.com',
        role: Role.ADMIN,
        storeId: 'store-123',
      });

      mockAuthRepository.findRefreshToken = vi.fn().mockResolvedValue({
        id: 'token-uuid',
        token: signedToken,
        userId: 'user-123',
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
        isRevoked: false,
      });

      await expect(authService.refresh(signedToken)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('logout', () => {
    test('should revoke the refresh token and return', async () => {
      const tokenToRevoke = 'some-token';
      await authService.logout(tokenToRevoke);
      expect(mockAuthRepository.revokeRefreshToken).toHaveBeenCalledWith(tokenToRevoke);
    });
  });
});
