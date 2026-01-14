# Project Structure Documentation

**Project:** errl-forge---asset-remixer
**Last Updated:** 2026-01-09

## Directory Structure
```
errl-forge---asset-remixer/
- `App.tsx`
- `BUILD_INSTRUCTIONS.md`
- `FILE_CHECKLIST.md`
- `GEMINI_BUILD_PACKAGE.md`
- `INDEX.md`
- `PROJECT_FILES.md`
- `PROJECT_STATUS.md`
- `README.md`
- `README_FOR_GEMINI.md`
- `components/`
- `constants/`
- `constants.ts`
- `docs/`
- `gemini-build-files/`
  - `components/`
  ... (18 more items)
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

### `components/` - React Components
- AssetEditor, AssetLibrary
- AnimationGenerator, BatchGenerator
- HitboxEditor and other UI components

### `constants/` - Constants
- Configuration values
- Asset definitions

### `docs/` - Documentation
- Build instructions, file checklists
- Architecture and project structure

## File Naming Conventions

- React components: PascalCase (e.g., `AssetEditor.tsx`)
- Constants: camelCase (e.g., `constants.ts`)

## Import/Export Structure

- ES modules
- TypeScript
- React component imports
