import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../common/middlewares/validate.js';
import { loginSchema, registerStoreSchema, refreshTokenSchema } from './auth.validation.js';

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

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refresh the access token using a valid refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
authRouter.post('/refresh', validate(refreshTokenSchema), AuthController.refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Log out a user by revoking their refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
authRouter.post('/logout', validate(refreshTokenSchema), AuthController.logout);

export { authRouter };
export default authRouter;
