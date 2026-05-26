import { fileURLToPath, URL } from 'node:url';
import { readFileSync } from 'node:fs';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

interface ViteMiddlewareRes {
  statusCode?: number;
  setHeader: (name: string, value: string) => void;
  end: (body: string) => void;
}
interface ViteDevServerLike {
  middlewares: {
    use: (handler: (req: { url?: string }, res: ViteMiddlewareRes, next: () => void) => void) => void;
  };
}

export default defineConfig(({ mode }) => {
  const isProductionBuild = mode === 'production';
  const vueSfcLoaderRuntimeFile = fileURLToPath(
    new URL('./src/vendors/vue3-sfc-loader.esm.js', import.meta.url)
  );
  const vueSfcLoaderLicenseFile = fileURLToPath(
    new URL('./src/vendors/vue3-sfc-loader.LICENSE', import.meta.url)
  );

  const serveVendoredVueSfcLoaderRuntime = () => ({
    name: 'serve-vendored-vue-sfc-loader-runtime',
    configureServer(server: ViteDevServerLike) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/vendors/vue3-sfc-loader.esm.js') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          res.end(readFileSync(vueSfcLoaderRuntimeFile, 'utf8'));
          return;
        }

        if (req.url === '/vendors/vue3-sfc-loader.LICENSE') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end(readFileSync(vueSfcLoaderLicenseFile, 'utf8'));
          return;
        }

        next();
      });
    },
    generateBundle(this: { emitFile: (file: { type: 'asset'; fileName: string; source: string }) => void }) {
      this.emitFile({
        type: 'asset',
        fileName: 'vendors/vue3-sfc-loader.esm.js',
        source: readFileSync(vueSfcLoaderRuntimeFile, 'utf8'),
      });
      this.emitFile({
        type: 'asset',
        fileName: 'vendors/vue3-sfc-loader.LICENSE',
        source: readFileSync(vueSfcLoaderLicenseFile, 'utf8'),
      });
    },
  });

  return {
    plugins: [
      vue(),
      serveVendoredVueSfcLoaderRuntime(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // inlineDynamicImports: true, // 移除此行以启用代码分割，优化加载性能和内存占用
          entryFileNames: 'Content/UmdDashboard/assets/index.[hash].js',
          chunkFileNames: 'Content/UmdDashboard/assets/[name].[hash].js',
          assetFileNames: 'Content/UmdDashboard/assets/[name].[hash].[ext]',
          manualChunks(id) {
            if (id.includes('@vueuse/core')) {
              return 'vendor-vueuse';
            }

            if (id.includes('/src/views/_builtin/iframe-page/vueComponent.vue')) {
              return 'iframe-vue-component';
            }

            if (
              id.includes('/node_modules/vue/') ||
              id.includes('/node_modules/vue-router/') ||
              id.includes('/node_modules/pinia/')
            ) {
              return 'vendor-vue';
            }

            return undefined;
          },
        },
      },
    },
    esbuild: {
      // 使用 Vite 的 mode 判定生产构建，避免依赖不稳定的 NODE_ENV 注入时机。
      drop: isProductionBuild ? ['console', 'debugger'] : [],
    },
    server: {
      // [MOCK MODE] 已注释掉后端代理，项目运行在本地 Mock 模式，无需连接服务器
      // 恢复连接后端时，取消下方 proxy 注释，并将 target 改为实际后端地址
      // proxy: {
      //   '/auth': {
      //     target: 'https://your-backend.example.com',
      //     changeOrigin: true,
      //   },
      //   '/api': {
      //     target: 'https://your-backend.example.com',
      //     changeOrigin: true,
      //   },
      //   '/Restful': {
      //     target: 'https://your-backend.example.com',
      //     changeOrigin: true,
      //   },
      //   '/codes': {
      //     target: 'https://your-backend.example.com',
      //     changeOrigin: true,
      //   },
      //   '/codet': {
      //     target: 'https://your-backend.example.com',
      //     changeOrigin: true,
      //   },
      //   '/storages': {
      //     target: 'https://your-backend.example.com',
      //     changeOrigin: true,
      //   },
      // },
    },
  };
});
