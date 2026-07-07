import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authenticate } from '../../common/middlewares/auth.js';
import { authorize } from '../../common/middlewares/rbac.js';
import { validate } from '../../common/middlewares/validate.js';
import { createUserSchema, updateUserSchema, userIdParamsSchema } from './user.validation.js';
import { Role } from '@prisma/client';

const userRouter = Router();

// Apply auth middleware globally to all user endpoints
userRouter.use(authenticate);

userRouter
  .route('/')
  .get(authorize([Role.ADMIN, Role.MANAGER]), UserController.getStoreUsers)
  .post(authorize([Role.ADMIN]), validate(createUserSchema), UserController.createUser);

userRouter
  .route('/:id')
  .get(validate(userIdParamsSchema), UserController.getProfile)
  .put(validate(updateUserSchema), UserController.updateUser)
  .delete(authorize([Role.ADMIN]), validate(userIdParamsSchema), UserController.deleteUser);

export { userRouter };
export default userRouter;
