# Project Structure Documentation

**Project:** liquid-light-show-simulator
**Last Updated:** 2026-01-09

## Directory Structure
```
liquid-light-show-simulator/
- `INDEX.md`
- `PROJECT_STATUS.md`
- `README.md`
- `WARP_GUIDE.md`
- `docs/`
- `index.html`
- `package-lock.json`
- `package.json`
- `src/`
  - `simulation/`
- `tsconfig.json`
- `vite.config.ts`
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
- `main.ts` - Application entry point
- `simulation/` - Blob simulation
  - `blobs.ts` - Pure utility functions (createBlobs, updateBlobs, drawBlobs)
  - `blobs.test.ts` - Vitest unit tests

### Build Configuration
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration

## File Naming Conventions

- TypeScript: camelCase (e.g., `main.ts`, `blobs.ts`)
- Test files: `*.test.ts`

## Import/Export Structure

- ES modules
- TypeScript
- Pure functions for simulation
- Vitest for testing
