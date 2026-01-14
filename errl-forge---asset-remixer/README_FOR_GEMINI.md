# Instructions for Gemini AI

## Your Task

Rebuild the **Errl Forge Asset Remixer** project from scratch. This is a React + TypeScript application for AI-powered game asset generation.

## How to Use This Package

1. **Start Here:** Read `GEMINI_BUILD_PACKAGE.md` for the overview
2. **Follow Instructions:** Read `BUILD_INSTRUCTIONS.md` for step-by-step guide
3. **Get File Contents:** Read each source file from the project directory
4. **Create Files:** Create files in the dependency order specified
5. **Verify:** Use the checklist in `FILE_CHECKLIST.md`

## Project Structure

```
errl-forge-asset-remixer/
├── BUILD_INSTRUCTIONS.md      ← Start here
├── GEMINI_BUILD_PACKAGE.md    ← Overview
├── PROJECT_FILES.md            ← File structure reference
├── FILE_CHECKLIST.md           ← Verification checklist
├── README_FOR_GEMINI.md        ← This file
│
├── package.json                ← Create first
├── tsconfig.json                ← Create first
├── vite.config.ts              ← Create first
├── .gitignore                  ← Create first
│
├── types.ts                    ← Create early (no dependencies)
├── constants.ts                ← Depends on types.ts
├── utils.ts                    ← No dependencies
│
├── services/
│   ├── aiProvider.ts          ← Depends on types.ts
│   ├── aiService.ts           ← Depends on all providers
│   ├── mapleStoryService.ts   ← Depends on types.ts
│   └── providers/
│       ├── geminiProvider.ts
│       ├── openaiProvider.ts
│       └── anthropicProvider.ts
│
├── components/
│   ├── AssetLibrary.tsx       ← Depends on services
│   └── AssetEditor.tsx        ← Depends on services
│
├── App.tsx                     ← Depends on all components
├── index.tsx                   ← Entry point
├── index.html                  ← HTML template
└── index.css                   ← Styles
```

## Critical Information

### Dependencies Order
Files must be created in dependency order. Each file imports from previous ones.

### Key Patterns
- **Provider Pattern:** Abstract interface with multiple implementations
- **Singleton Service:** Global AI service instance
- **Type Safety:** Full TypeScript, strict mode

### Required API Keys
At least one AI provider API key is required:
- Gemini (recommended): https://aistudio.google.com/apikey
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/

### Build Commands
```bash
npm install
npm run dev      # Development server
npm run build    # Production build
```

## File Reading Strategy

When reading source files, read them completely in this order:

1. `types.ts` - All type definitions
2. `constants.ts` - Presets and modifiers
3. `utils.ts` - Utility functions
4. `services/aiProvider.ts` - Interface definition
5. `services/providers/geminiProvider.ts` - Full implementation
6. `services/providers/openaiProvider.ts` - Full implementation
7. `services/providers/anthropicProvider.ts` - Full implementation
8. `services/aiService.ts` - Service router
9. `services/mapleStoryService.ts` - API integration
10. `components/AssetLibrary.tsx` - Complete component
11. `components/AssetEditor.tsx` - Complete component
12. `App.tsx` - Main application
13. `index.tsx` - Entry point
14. `index.html` - HTML template
15. `index.css` - Base styles

## Success Criteria

The build is successful when:
- ✅ All files created
- ✅ `npm run build` completes
- ✅ `npm run dev` starts server
- ✅ Application loads in browser
- ✅ Can generate assets
- ✅ Can browse MapleStory assets

## Getting Help

- Check `docs/` folder for detailed documentation
- Review `BUILD_INSTRUCTIONS.md` for troubleshooting
- Verify file contents match exactly
- Check import paths are correct

## Important Notes

1. **TypeScript Strict Mode:** All types must be properly defined
2. **No `any` Types:** Use proper types or `unknown`
3. **Error Handling:** All async functions need try-catch
4. **Environment Variables:** Must be in `.env.local` file
5. **File Paths:** Use exact paths as shown in imports

Good luck building! 🚀

