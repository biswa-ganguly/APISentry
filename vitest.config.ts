import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    alias: {
      '@apisentry/types': path.resolve(__dirname, './packages/types/src/index.ts'),
      '@apisentry/shared': path.resolve(__dirname, './packages/shared/src/index.ts'),
      '@apisentry/config': path.resolve(__dirname, './packages/config/src/index.ts'),
      '@apisentry/analyzer': path.resolve(__dirname, './packages/analyzer/src/index.ts'),
      '@apisentry/adapters': path.resolve(__dirname, './packages/adapters/src/index.ts'),
      '@apisentry/contract-engine': path.resolve(__dirname, './packages/contract-engine/src/index.ts')
    }
  }
});
