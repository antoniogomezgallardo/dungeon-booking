import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Unit tests: fast, no database. Integration tests live in test/integration (separate config).
export default defineConfig({
  resolve: {
    alias: {
      '@dungeon/shared': fileURLToPath(
        new URL('../../packages/shared/src/index.ts', import.meta.url),
      ),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
