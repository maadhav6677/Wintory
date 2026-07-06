import { User, Prisma } from '@prisma/client';
import { IUserRepository } from './user.repository.js';
import { ConflictError, NotFoundError } from '../../common/errors/index.js';
import { hashPassword } from '../../common/utils/hash.js';

export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError('User with this email not found');
    }
    return user;
  }

  async createUser(data: Prisma.UserUncheckedCreateInput): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    const hashedPassword = await hashPassword(data.passwordHash);
    
    return this.userRepository.create({
      ...data,
      passwordHash: hashedPassword,
    });
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    // Verify user exists first
    await this.getUserById(id);

    if (data.email && typeof data.email === 'string') {
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictError('A user with this email address already exists');
      }
    }

    if (data.passwordHash && typeof data.passwordHash === 'string') {
      data.passwordHash = await hashPassword(data.passwordHash);
    }

    return this.userRepository.update(id, data);
  }

  async deleteUser(id: string): Promise<User> {
    await this.getUserById(id);
    return this.userRepository.delete(id);
  }

  async getUsersByStore(storeId: string): Promise<User[]> {
    return this.userRepository.listByStore(storeId);
  }
}
