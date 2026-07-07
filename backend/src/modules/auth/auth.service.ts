import { Store, User, Prisma } from '@prisma/client';
import { IAuthRepository } from './auth.repository.js';
import { IUserRepository } from '../user/user.repository.js';
import { ConflictError, UnauthorizedError } from '../../common/errors/index.js';
import { comparePassword, hashPassword } from '../../common/utils/hash.js';
import { generateToken } from '../../common/utils/jwt.js';

export interface LoginResult {
  token: string;
  user: Omit<User, 'passwordHash'>;
}

export interface RegisterResult {
  token: string;
  store: Store;
  owner: Omit<User, 'passwordHash'>;
}

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

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      storeId: user.storeId,
    });

    const { passwordHash, ...safeUser } = user;

    return { token, user: safeUser };
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

    const token = generateToken({
      id: owner.id,
      email: owner.email,
      role: owner.role,
      storeId: owner.storeId,
    });

    const { passwordHash, ...safeOwner } = owner;

    return { token, store, owner: safeOwner };
  }
}
