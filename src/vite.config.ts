import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/ts/app.ts', 'resources/css/app.css'],
      refresh: true,
    }),
    vue(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      host: 'localhost',
    },
  },
  resolve: {
    alias: {
      '@': new URL('./resources/ts', import.meta.url).pathname,
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'clover', 'lcov'],
      reportsDirectory: 'build/logs/coverage',
      include: ['resources/ts/**/*.{ts,vue}'],
      exclude: [
        'resources/ts/app.ts',
        'resources/ts/**/*.d.ts',
        'resources/ts/tests/**',
      ],
    },
  },
});