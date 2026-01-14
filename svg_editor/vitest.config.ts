import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    css: true,
  },
  resolve: {
    alias: [
      // Shared package aliases
      { 
        find: '@/shared/hooks', 
        replacement: path.resolve(__dirname, '../shared/hooks/index.ts')
      },
      { 
        find: '@/shared/utils', 
        replacement: path.resolve(__dirname, '../shared/utils/index.ts')
      },
      { 
        find: /^@\/shared\/(.+)$/, 
        replacement: path.resolve(__dirname, '../shared') + '/$1'
      },
      { 
        find: '@/shared', 
        replacement: path.resolve(__dirname, '../shared')
      },
      // Local @ alias
      { 
        find: '@', 
        replacement: path.resolve(__dirname, './src')
      },
    ],
  },
});
