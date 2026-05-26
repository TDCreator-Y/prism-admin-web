import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/bridge/open-tab-core.ts',
        'src/router/guards.ts',
        'src/router/routes/menu-service.ts',
        'src/router/routes/route-transform.ts',
        'src/utils/remote-component-loaders.ts',
        'src/utils/remote-component-registrar.ts',
        'src/layouts/modules/global-menu/menu-domain.ts',
        'src/layouts/modules/global-menu/tabs-domain.ts',
      ],
      thresholds: {
        lines: 50,
        functions: 60,
        statements: 50,
        branches: 35,
      },
    },
  },
});
