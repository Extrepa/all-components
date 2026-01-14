# Gemini AI Build Package

This package contains everything needed to rebuild the Errl Forge Asset Remixer project.

## Quick Start for Gemini

**Task:** Rebuild the Errl Forge Asset Remixer project from scratch.

**Steps:**
1. Read `BUILD_INSTRUCTIONS.md` for step-by-step instructions
2. Read `PROJECT_FILES.md` for file structure and configuration
3. Create files in the order specified in BUILD_INSTRUCTIONS.md
4. Use the actual source files from the project directory

## Project Summary

- **Type:** React + TypeScript web application
- **Purpose:** AI-powered game asset generation and remixing
- **Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS
- **AI Providers:** Gemini, OpenAI, Anthropic
- **External APIs:** MapleStory.io

## File Organization

### Configuration Files (Create First)
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `.gitignore` - Git ignore rules
- `.env.local` - Environment variables (template)

### Core Source Files (Create in Order)
1. `types.ts` - Type definitions
2. `constants.ts` - Constants and presets
3. `utils.ts` - Utility functions
4. `services/aiProvider.ts` - Provider interface
5. `services/providers/*.ts` - Provider implementations
6. `services/aiService.ts` - Main AI service
7. `services/mapleStoryService.ts` - MapleStory API
8. `components/AssetLibrary.tsx` - Asset browser
9. `components/AssetEditor.tsx` - Asset editor
10. `App.tsx` - Main app component
11. `index.tsx` - Entry point
12. `index.html` - HTML template
13. `index.css` - Base styles

## Key Dependencies

```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "typescript": "~5.8.2",
  "vite": "^6.2.0",
  "@vitejs/plugin-react": "^5.0.0",
  "lucide-react": "^0.555.0",
  "@google/genai": "^1.30.0"
}
```

## Environment Variables Required

```bash
GEMINI_API_KEY=your_key_here
# Optional:
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
AI_PROVIDER=gemini
```

## Build Commands

```bash
npm install          # Install dependencies
npm run dev         # Start dev server
npm run build       # Build for production
npm run preview     # Preview production build
```

## Architecture Highlights

1. **Provider Pattern:** Abstract AI provider interface with multiple implementations
2. **Singleton Service:** Global AI service instance with runtime provider switching
3. **Type Safety:** Full TypeScript with strict typing
4. **Error Handling:** Comprehensive try-catch with fallbacks
5. **API Integration:** Retry logic and timeout handling

## Critical Implementation Notes

### AI Provider System
- All providers implement `AIProvider` interface
- Factory function in `aiService.ts` creates instances
- Singleton pattern for global access
- Runtime provider switching supported

### Type System
- All types in `types.ts`
- Strict TypeScript (no implicit any)
- Interfaces for all data structures

### Component Structure
- `App.tsx` - Main container, state management
- `AssetLibrary` - Browsing and selection
- `AssetEditor` - Editing and generation

### Service Layer
- `aiService.ts` - Unified AI interface
- `mapleStoryService.ts` - External API integration
- Provider implementations in `services/providers/`

## Testing Checklist

After building:
- [ ] Project builds without errors (`npm run build`)
- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] Dev server starts (`npm run dev`)
- [ ] UI loads in browser
- [ ] Provider selector works
- [ ] Can generate asset from preset
- [ ] Can browse MapleStory assets
- [ ] Can remix MapleStory asset
- [ ] Export functionality works

## File Reading Instructions

To get complete file contents, read each file in this order:

1. Read `types.ts` completely
2. Read `constants.ts` completely
3. Read `utils.ts` completely
4. Read `services/aiProvider.ts` completely
5. Read each file in `services/providers/`:
   - `geminiProvider.ts`
   - `openaiProvider.ts`
   - `anthropicProvider.ts`
6. Read `services/aiService.ts` completely
7. Read `services/mapleStoryService.ts` completely
8. Read `components/AssetLibrary.tsx` completely
9. Read `components/AssetEditor.tsx` completely
10. Read `App.tsx` completely
11. Read `index.tsx` completely
12. Read `index.html` completely
13. Read `index.css` completely

## Common Issues

1. **Import errors:** Check file paths match exactly
2. **Type errors:** Ensure types.ts is created first
3. **Build errors:** Verify all dependencies installed
4. **Runtime errors:** Check API keys in .env.local
5. **CORS errors:** Some external images may be blocked

## Documentation

Full documentation is available in the `docs/` folder:
- `docs/README.md` - Documentation index
- `docs/01-overview.md` - Project overview
- `docs/02-architecture.md` - System architecture
- `docs/05-setup-guide.md` - Setup instructions
- `docs/08-contributing.md` - Extension guide

## Success Criteria

The project is successfully built when:
1. ✅ `npm run build` completes without errors
2. ✅ `npm run dev` starts server on port 3000
3. ✅ Application loads in browser
4. ✅ Can generate assets using AI
5. ✅ Can browse and remix MapleStory assets
6. ✅ Export functionality works

## Next Steps After Build

1. Set up API keys in `.env.local`
2. Test each AI provider
3. Generate test assets
4. Review documentation for advanced features
5. Customize or extend as needed

