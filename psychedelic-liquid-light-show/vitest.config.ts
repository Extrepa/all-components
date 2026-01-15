import path from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: [
      {
        find: /^@\/shared\/(.+)$/,
        replacement: path.resolve(__dirname, '../shared') + '/$1',
      },
      {
        find: '@/shared',
        replacement: path.resolve(__dirname, '../shared'),
      },
      {
        find: '@errl-design-system',
        replacement: path.resolve(__dirname, '../errl-design-system/src'),
      },
      {
        find: 'react',
        replacement: path.resolve(__dirname, 'node_modules/react'),
      },
      {
        find: 'react-dom',
        replacement: path.resolve(__dirname, 'node_modules/react-dom'),
      },
      {
        find: /^@\//,
        replacement: path.resolve(__dirname, '.') + '/',
      },
    ],
  },
});
