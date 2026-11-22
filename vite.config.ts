import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        typhoon: resolve(__dirname, 'projects/typhoon.html'),
        bikeysens: resolve(__dirname, 'projects/bikeysens.html'),
        rcxd: resolve(__dirname, 'projects/rcxd.html'),
        'team-214': resolve(__dirname, 'projects/team-214.html'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    exclude: ['e2e/**', 'node_modules/**', 'dist/**', '.agents/**'],
  },
});
