import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service.js';
import { UserRepository } from './user.repository.js';
import { ForbiddenError } from '../../common/errors/index.js';

const userRepository = new UserRepository();
const userService = new UserService(userRepository);

export class UserController {
  public static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = req.user!;

      // Multitenancy: Check if target user belongs to same store
      const user = await userService.getUserById(id);
      
      if (user.storeId !== currentUser.storeId) {
        throw new ForbiddenError('Access denied: User belongs to a different store');
      }

      const { passwordHash, ...safeUser } = user;
      res.status(200).json({
        success: true,
        data: safeUser,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getStoreUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user!;
      const users = await userService.getUsersByStore(currentUser.storeId);
      
      const safeUsers = users.map(({ passwordHash, ...user }) => user);

      res.status(200).json({
        success: true,
        data: safeUsers,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user!;
      const userData = req.body;

      // Multitenancy: Check if the creator attempts to create user in another store
      if (userData.storeId !== currentUser.storeId) {
        throw new ForbiddenError('Access denied: Cannot create user in another store');
      }

      const newUser = await userService.createUser({
        email: userData.email,
        passwordHash: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        storeId: userData.storeId,
      });

      const { passwordHash, ...safeUser } = newUser;

      res.status(201).json({
        success: true,
        data: safeUser,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = req.user!;
      const updateData = req.body;

      const user = await userService.getUserById(id);
      if (user.storeId !== currentUser.storeId) {
        throw new ForbiddenError('Access denied: User belongs to a different store');
      }

      const updatedUser = await userService.updateUser(id, {
        email: updateData.email,
        passwordHash: updateData.password,
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        role: updateData.role,
      });

      const { passwordHash, ...safeUser } = updatedUser;

      res.status(200).json({
        success: true,
        data: safeUser,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = req.user!;

      const user = await userService.getUserById(id);
      if (user.storeId !== currentUser.storeId) {
        throw new ForbiddenError('Access denied: User belongs to a different store');
      }

      // Users cannot delete themselves
      if (id === currentUser.id) {
        throw new ForbiddenError('Access denied: Cannot delete your own account');
      }

      await userService.deleteUser(id);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
