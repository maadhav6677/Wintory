import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    env: {
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/test_db',
      JWT_SECRET: 'testsecretjwtkeyforwintorydevelopment12345!',
      REDIS_HOST: 'localhost',
      REDIS_PORT: '6379',
    },
  },
});
