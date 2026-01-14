# Project Structure Documentation

**Project:** psychedelic-liquid-light-show
**Last Updated:** 2026-01-09

## Directory Structure
```
psychedelic-liquid-light-show/
- `App.tsx`
- `INDEX.md`
- `PROJECT_STATUS.md`
- `QUICK_START.md`
- `README.md`
- `WARP_GUIDE.md`
- `components/`
  - `controls/`
  - `icons/`
- `constants/`
- `constants.ts`
- `docs/`
  - `features/`
- `engines/`
  - `liquid-pixi/`
  ... (24 more items)
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
- `App.tsx` - Main application component
- `components/` - React components
  - `controls/` - UI controls
  - `icons/` - Icon components
- `engines/` - Rendering engines
  - `liquid-pixi/` - PIXI.js rendering
- `constants/` - Configuration constants

### `docs/` - Documentation
- `features/` - Feature documentation
- Detailed guides (overview, structure, architecture, etc.)

## File Naming Conventions

- React components: PascalCase (e.g., `App.tsx`)
- Utilities: camelCase
- Constants: UPPERCASE

## Import/Export Structure

- ES modules
- TypeScript
- React components
- PIXI.js for rendering
