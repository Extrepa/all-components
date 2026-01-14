# Project Structure Documentation

**Project:** errl_vibecheck
**Last Updated:** 2026-01-09

## Directory Structure
```
errl_vibecheck/
- `ADDITIONS_SINCE_AISTUDIO.md`
- `GROWTH_SUMMARY.md`
- `IMPLEMENTATION_SUMMARY.md`
- `INDEX.md`
- `PROJECT_STATUS.md`
- `README.md`
- `docs/`
- `index.css`
- `index.html`
- `index.tsx`
- `main.css`
- `metadata.json`
- `package-lock.json`
- `package.json`
- `src/`
  ... (7 more items)
```

## File Organization

### Core Files

- Configuration files (package.json, tsconfig.json, etc.)
- Entry points (index.html, main.js, etc.)
- Source code directories

### Documentation

- Root documentation files
- docs/ directory (this directory)
- README.md

### Build and Distribution

- Build output directories
- Distribution files
- Compiled assets

## Key Directories

### `src/` - Source Code
- `components/` - React components
  - `App.tsx` - Main app
  - `Header.tsx` - Navigation
  - `Renderer.tsx` - Code rendering
  - `Result.tsx` - Result display
  - `Collection.tsx` - Collection management
  - `Screensaver.tsx` - Screensaver mode
- `lib/` - Utilities and stores
  - `store.ts` - Zustand store
  - `actions.ts` - Actions
  - `llm.ts` - AI client
  - `models.ts` - AI models
  - `modes.ts` - Output modes
  - `filter.ts`, `sort.ts` - Utilities
  - `export.ts` - Export functionality

### `tests/` - Test Files
- `unit/` - Unit tests
- `setup.ts` - Test configuration

## File Naming Conventions

- React components: PascalCase (e.g., `App.tsx`)
- Utilities: camelCase (e.g., `store.ts`)
- Test files: `*.test.ts`

## Import/Export Structure

- ES modules
- TypeScript strict mode
- Path aliases (`@/` maps to `src/`)
