import swaggerJSDoc from 'swagger-jsdoc';
import { env } from './env.js';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Wintory API Documentation',
      version: '1.0.0',
      description:
        'Production-grade REST API backend for Wintory: AI-powered inventory operations copilot for small and medium grocery stores.',
      contact: {
        name: 'Wintory Engineering Team',
        email: 'engineering@wintory.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}${env.API_PREFIX}`,
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token to access protected routes.',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Unauthorized access' },
                      code: { type: 'string', example: 'UNAUTHORIZED' },
                    },
                  },
                },
              },
            },
          },
        },
        ForbiddenError: {
          description: 'Insufficient privileges',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Forbidden resources' },
                      code: { type: 'string', example: 'FORBIDDEN' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Paths to files containing OpenAPI annotations
  apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.routes.js', './src/app.ts', './src/app.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
