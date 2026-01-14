import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/shared': path.resolve(__dirname, '../shared'),
      '@errl-design-system': path.resolve(__dirname, '../all-components/errl-design-system/src'),
    },
  },
})