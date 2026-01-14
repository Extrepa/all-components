# Build Instructions for Gemini AI

This document provides complete instructions for rebuilding the Errl Forge Asset Remixer project from scratch.

## Project Overview

**Errl Forge** is a React + TypeScript application for AI-powered game asset generation and remixing. It integrates with multiple AI providers (Gemini, OpenAI, Anthropic) and the MapleStory.io API.

## Prerequisites

- Node.js 18+ (recommended: 20+)
- npm or yarn
- API keys for at least one AI provider (Gemini recommended)

## Step-by-Step Build Instructions

### Step 1: Initialize Project

```bash
mkdir errl-forge-asset-remixer
cd errl-forge-asset-remixer
npm init -y
```

### Step 2: Install Dependencies

```bash
npm install react@^19.2.0 react-dom@^19.2.0 lucide-react@^0.555.0 @google/genai@^1.30.0
npm install -D vite@^6.2.0 @vitejs/plugin-react@^5.0.0 typescript@~5.8.2 @types/node@^22.14.0
```

### Step 3: Create Project Structure

Create the following directory structure:

```
errl-forge-asset-remixer/
├── components/
│   ├── AssetEditor.tsx
│   └── AssetLibrary.tsx
├── services/
│   ├── providers/
│   │   ├── geminiProvider.ts
│   │   ├── openaiProvider.ts
│   │   └── anthropicProvider.ts
│   ├── aiProvider.ts
│   ├── aiService.ts
│   └── mapleStoryService.ts
├── docs/ (optional - documentation)
├── App.tsx
├── index.tsx
├── index.html
├── index.css
├── types.ts
├── constants.ts
├── utils.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
└── .env.local (create this)
```

### Step 4: Create Configuration Files

#### package.json
See `PROJECT_FILES.md` for complete package.json content.

#### tsconfig.json
See `PROJECT_FILES.md` for complete tsconfig.json content.

#### vite.config.ts
See `PROJECT_FILES.md` for complete vite.config.ts content.

#### .env.local
Create `.env.local` in project root:
```
GEMINI_API_KEY=your_api_key_here
OPENAI_API_KEY=your_openai_key_here (optional)
ANTHROPIC_API_KEY=your_anthropic_key_here (optional)
AI_PROVIDER=gemini
```

### Step 5: Create Source Files

Create all source files in the order listed in `PROJECT_FILES.md`. The files are organized by dependency order:

1. **types.ts** - Type definitions (no dependencies)
2. **constants.ts** - Constants and presets (depends on types.ts)
3. **utils.ts** - Utility functions (no dependencies)
4. **services/aiProvider.ts** - Provider interface (depends on types.ts)
5. **services/providers/geminiProvider.ts** - Gemini implementation
6. **services/providers/openaiProvider.ts** - OpenAI implementation
7. **services/providers/anthropicProvider.ts** - Anthropic implementation
8. **services/aiService.ts** - Main AI service (depends on all providers)
9. **services/mapleStoryService.ts** - MapleStory API integration
10. **components/AssetLibrary.tsx** - Asset browsing component
11. **components/AssetEditor.tsx** - Asset editing component
12. **App.tsx** - Main application component
13. **index.tsx** - Entry point
14. **index.html** - HTML template
15. **index.css** - Base styles

### Step 6: Verify Build

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Build for production
npm run build

# Start development server
npm run dev
```

### Step 7: Test Application

1. Open http://localhost:3000
2. Select an AI provider from dropdown
3. Try generating an asset from a preset
4. Test MapleStory asset browsing
5. Test asset remixing

## File Creation Order

Follow this order when creating files (each file depends on previous ones):

1. `types.ts`
2. `constants.ts` (imports from types.ts)
3. `utils.ts`
4. `services/aiProvider.ts` (imports from types.ts)
5. `services/providers/*.ts` (imports from aiProvider.ts and types.ts)
6. `services/aiService.ts` (imports from all providers)
7. `services/mapleStoryService.ts` (imports from types.ts)
8. `components/AssetLibrary.tsx` (imports from types.ts, constants.ts, mapleStoryService.ts)
9. `components/AssetEditor.tsx` (imports from types.ts, constants.ts, aiService.ts)
10. `App.tsx` (imports from all components and services)
11. `index.tsx` (imports App.tsx)
12. `index.html`
13. `index.css`

## Key Implementation Notes

### AI Provider Pattern
- All providers implement the `AIProvider` interface
- Factory pattern in `aiService.ts` creates provider instances
- Singleton pattern for global service access

### Type Safety
- All files use TypeScript with strict typing
- No `any` types (except where necessary for external APIs)
- Interfaces defined in `types.ts`

### Error Handling
- All async operations wrapped in try-catch
- Fallback metadata returned on generation failures
- User-friendly error messages displayed in UI

### API Integration
- MapleStory.io API with retry logic
- CORS handling for external images
- Request timeout handling (10s)

## Troubleshooting

### Build Errors
- Ensure all dependencies are installed
- Check TypeScript version matches (5.8.2)
- Verify all imports are correct

### Runtime Errors
- Check API keys are set in `.env.local`
- Restart dev server after adding env vars
- Check browser console for detailed errors

### Type Errors
- Run `npx tsc --noEmit` to see all type errors
- Ensure all types are properly exported
- Check import paths are correct

## Next Steps

After building:
1. Read `docs/README.md` for full documentation
2. Review `docs/06-usage-guide.md` for usage instructions
3. Check `docs/08-contributing.md` for extension guide

## Complete File List

All source files are documented in `PROJECT_FILES.md` with their complete contents.

