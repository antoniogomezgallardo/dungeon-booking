import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Integration tests: real Fastify app + real PostgreSQL (DATABASE_URL must point to a migrated DB).
export default defineConfig({
  resolve: {
    alias: {
      '@dungeon/shared': fileURLToPath(
        new URL('../../packages/shared/src/index.ts', import.meta.url),
      ),
    },
  },
  test: {
    include: ['test/integration/**/*.test.ts'],
    fileParallelism: false,
    testTimeout: 20_000,
  },
});
