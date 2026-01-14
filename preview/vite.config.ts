import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const ROOT_DIR = path.resolve(__dirname, '..');
const SHARED_DIR = path.resolve(ROOT_DIR, 'shared');
const IGNORE_PROJECTS = new Set([
  '.git',
  '.cursor',
  '.DS_Store',
  'node_modules',
  'dist',
  'build',
  '.next',
  '.cache',
  '.npm-cache',
  '_archive',
  '_Resources',
  '05-Logs',
  'preview',
  'docs',
  'tools'
]);

function buildAliases() {
  const entries = fs.readdirSync(ROOT_DIR, { withFileTypes: true });
  const aliases: Record<string, string> = {};

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.') || IGNORE_PROJECTS.has(entry.name)) continue;
    aliases[`@${entry.name}`] = path.resolve(ROOT_DIR, entry.name);
  }

  return aliases;
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'dynamic-at-alias',
      resolveId(id, importer) {
        if (id === '@errl-design-system/styles/errlDesignSystem.css') {
          return path.resolve(__dirname, 'src/stubs/empty.css');
        }

        if (importer && importer.includes('/errl_scene_builder/') && id.includes('styles.css')) {
          return path.resolve(__dirname, 'src/stubs/empty.css');
        }

        if (id === 'zustand') {
          return path.resolve(__dirname, 'src/stubs/zustand.ts');
        }

        if (id === 'zustand/middleware') {
          return path.resolve(__dirname, 'src/stubs/zustand-middleware.ts');
        }

        if (id === 'use-debounce') {
          return path.resolve(__dirname, 'src/stubs/use-debounce.ts');
        }

        if (id === 'clsx') {
          return path.resolve(__dirname, 'src/stubs/clsx.ts');
        }

        if (id === 'react-router-dom') {
          return path.resolve(__dirname, 'src/stubs/react-router-dom.tsx');
        }

        if (id === 'lucide-react') {
          return path.resolve(__dirname, 'src/stubs/lucide-react.tsx');
        }

        if (id === 'next/link') {
          return path.resolve(__dirname, 'src/stubs/next-link.tsx');
        }

        if (id === 'next/navigation') {
          return path.resolve(__dirname, 'src/stubs/next-navigation.ts');
        }

        if (importer && importer.includes('/errl-club-ui/') && id.startsWith('../')) {
          const remainder = id.replace(/^\.\.\//, '');
          return path.resolve(ROOT_DIR, 'errl-club', 'src', remainder);
        }

        if (!id.startsWith('@/')) return null;

        if (importer && importer.includes('/component-vault/')) {
          if (id === '@/app/actions') {
            return path.resolve(__dirname, 'src/stubs/component-vault-actions.ts');
          }
          if (id === '@/lib/db/prisma') {
            return path.resolve(__dirname, 'src/stubs/component-vault-prisma.ts');
          }
        }

        if (id === '@/shared/utils/export') {
          return path.resolve(__dirname, 'src/stubs/shared-export.ts');
        }

        if (id.startsWith('@/shared')) {
          const remainder = id.replace('@/shared', '');
          const resolved = path.resolve(SHARED_DIR, `.${remainder}`);
          try {
            if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
              return path.join(resolved, 'index.ts');
            }
            if (!fs.existsSync(resolved)) {
              const extensions = ['.ts', '.tsx', '.js', '.jsx'];
              for (const ext of extensions) {
                const candidate = `${resolved}${ext}`;
                if (fs.existsSync(candidate)) {
                  return candidate;
                }
              }
            }
          } catch {
            // ignore and fall through
          }
          return resolved;
        }

        if (!importer) return null;

        const match = importer.match(/\/(component-vault|svg_editor|errl_scene_builder|figma-clone-engine)\//);
        if (!match) return null;

        const projectName = match[1];
        const projectSrc = path.resolve(ROOT_DIR, projectName, 'src');
        const remainder = id.replace('@/', '');
        return path.resolve(projectSrc, remainder);
      },
    },
  ],
  base: './', // Use relative paths for assets so it works when served from subdirectory
  server: {
    port: 5174,
    strictPort: true,
    fs: {
      allow: [ROOT_DIR],
    },
  },
  resolve: {
    alias: {
      '@errl-design-system/styles/errlDesignSystem.css': path.resolve(__dirname, 'src/stubs/empty.css'),
      ...buildAliases(),
    },
  },
});
