// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - vitest/config types may not be available during linting
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    globals: true,
    coverage: {
      reporter: ['text', 'html']
    }
  }
});