import { defineConfig } from 'vitest/config';

export default defineConfig(async () => {
  const react = (await import('@vitejs/plugin-react-swc')).default;

  return {
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      css: true,
    },
  };
});
