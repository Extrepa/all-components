# File Checklist for Gemini

Use this checklist to ensure all files are created when rebuilding the project.

## Configuration Files
- [ ] package.json
- [ ] tsconfig.json
- [ ] vite.config.ts
- [ ] .gitignore
- [ ] .env.local (template)
- [ ] index.html

## Core Type Definitions
- [ ] types.ts

## Constants and Utilities
- [ ] constants.ts
- [ ] utils.ts
- [ ] index.css

## AI Provider System
- [ ] services/aiProvider.ts
- [ ] services/providers/geminiProvider.ts
- [ ] services/providers/openaiProvider.ts
- [ ] services/providers/anthropicProvider.ts
- [ ] services/aiService.ts

## External API Integration
- [ ] services/mapleStoryService.ts

## React Components
- [ ] components/AssetLibrary.tsx
- [ ] components/AssetEditor.tsx

## Application Entry Points
- [ ] App.tsx
- [ ] index.tsx

## Documentation (Optional but Recommended)
- [ ] docs/README.md
- [ ] docs/01-overview.md
- [ ] docs/02-architecture.md
- [ ] docs/03-features.md
- [ ] docs/04-api-reference.md
- [ ] docs/05-setup-guide.md
- [ ] docs/06-usage-guide.md
- [ ] docs/07-milestones.md
- [ ] docs/08-contributing.md

## Build Instructions
- [ ] BUILD_INSTRUCTIONS.md
- [ ] PROJECT_FILES.md
- [ ] GEMINI_BUILD_PACKAGE.md
- [ ] FILE_CHECKLIST.md (this file)

## Verification Steps
After creating all files:
- [ ] Run `npm install`
- [ ] Run `npx tsc --noEmit` (no errors)
- [ ] Run `npm run build` (successful)
- [ ] Run `npm run dev` (server starts)
- [ ] Open http://localhost:3000 (app loads)
