import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { AuthRepository } from './auth.repository.js';
import { UserRepository } from '../user/user.repository.js';

const authRepository = new AuthRepository();
const userRepository = new UserRepository();
const authService = new AuthService(authRepository, userRepository);

export class AuthController {
  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { storeName, email, password, firstName, lastName } = req.body;
      
      const result = await authService.registerStore(storeName, {
        email,
        passwordHash: password,
        firstName,
        lastName,
      });

      res.status(201).json({
        success: true,
        message: 'Store and administrator registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
