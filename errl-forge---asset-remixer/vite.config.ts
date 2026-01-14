import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY),
        'process.env.ANTHROPIC_API_KEY': JSON.stringify(env.ANTHROPIC_API_KEY),
        'process.env.AI_PROVIDER': JSON.stringify(env.AI_PROVIDER || 'gemini')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          '@errl-design-system': path.resolve(__dirname, '../all-components/errl-design-system/src'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              // Vendor chunks
              'react-vendor': ['react', 'react-dom'],
              'lucide-icons': ['lucide-react'],
              'ai-vendor': ['@google/genai'],
              // Service chunks
              'services': [
                './services/aiService',
                './services/mapleStoryService',
                './services/storageService',
                './services/batchService',
                './services/animationService'
              ],
              // Component chunks (large components)
              'components-library': ['./components/AssetLibrary'],
              'components-editor': ['./components/AssetEditor'],
            }
          }
        },
        chunkSizeWarningLimit: 600, // Increase warning threshold slightly
      }
    };
});
