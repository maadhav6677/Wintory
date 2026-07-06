import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../common/middlewares/validate.js';
import { loginSchema, registerStoreSchema } from './auth.validation.js';

const authRouter = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate user and get JWT session token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: owner@mystore.com
 *               password:
 *                 type: string
 *                 example: securepwd123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
authRouter.post('/login', validate(loginSchema), AuthController.login);

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new Store organization and its primary administrator account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [storeName, email, password, firstName, lastName]
 *             properties:
 *               storeName:
 *                 type: string
 *                 example: My Corner Store
 *               email:
 *                 type: string
 *                 format: email
 *                 example: owner@mystore.com
 *               password:
 *                 type: string
 *                 example: securepwd123
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *     responses:
 *       201:
 *         description: Store and administrator registered successfully
 *       400:
 *         description: Validation or parameter check failed
 *       409:
 *         description: Email address already exists
 */
authRouter.post('/register', validate(registerStoreSchema), AuthController.register);

export { authRouter };
export default authRouter;
