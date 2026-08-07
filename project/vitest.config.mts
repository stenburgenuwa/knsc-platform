import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    testTimeout: 15000,
    // Integration tests share one physical Postgres test database and each
    // resets it in beforeEach — running test files in parallel races on that
    // reset. Keep it simple and correct rather than fast.
    fileParallelism: false,
  },
});
