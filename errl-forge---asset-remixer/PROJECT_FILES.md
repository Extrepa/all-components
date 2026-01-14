# Complete Project Files

This document contains the complete contents of all source files needed to rebuild the project.

## Configuration Files

### package.json

```json
{
  "name": "errl-forge---asset-remixer",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.555.0",
    "react-dom": "^19.2.0",
    "react": "^19.2.0",
    "@google/genai": "^1.30.0"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.0"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "skipLibCheck": true,
    "types": [
      "node"
    ],
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}
```

### vite.config.ts

```typescript
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
        }
      }
    };
});
```

### .gitignore

```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local
.env
.env.local
.env.*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

## Source Files

**Note:** Due to length, the complete source code for each file is in the actual project. For Gemini to rebuild, you should:

1. Read each file from the project directory
2. Create it in the new project
3. Follow the dependency order in BUILD_INSTRUCTIONS.md

### File Locations

All source files are in the project root. Here's what needs to be created:

1. **types.ts** - Type definitions
2. **constants.ts** - Presets and style modifiers
3. **utils.ts** - imageUrlToBase64 function
4. **services/aiProvider.ts** - AIProvider interface
5. **services/providers/geminiProvider.ts** - Gemini implementation
6. **services/providers/openaiProvider.ts** - OpenAI implementation
7. **services/providers/anthropicProvider.ts** - Anthropic implementation
8. **services/aiService.ts** - Main AI service
9. **services/mapleStoryService.ts** - MapleStory API service
10. **components/AssetLibrary.tsx** - Asset browsing UI
11. **components/AssetEditor.tsx** - Asset editing UI
12. **App.tsx** - Main application
13. **index.tsx** - Entry point
14. **index.html** - HTML template
15. **index.css** - Base styles

### Getting File Contents

To get the complete contents of each file, read them from the project:

```bash
# Example: Read a file
cat types.ts
cat services/aiService.ts
cat components/AssetEditor.tsx
# etc.
```

Or use the file reading tools to get each file's complete content.

## File Size Notes

Some files are quite large (especially components). When providing to Gemini:

1. **Provide files in dependency order** (as listed in BUILD_INSTRUCTIONS.md)
2. **Break into chunks** if needed for very large files
3. **Include file paths** with each file's content
4. **Note dependencies** between files

## Critical Implementation Details

### AI Service Pattern
- Uses singleton pattern
- Factory function creates providers
- Provider switching at runtime

### Type System
- All types exported from types.ts
- Strict TypeScript configuration
- No implicit any

### Error Handling
- Try-catch in all async functions
- Fallback metadata on errors
- User-friendly error states

### API Integration
- Retry logic for 5xx errors
- Timeout handling (10s)
- CORS-aware image fetching

