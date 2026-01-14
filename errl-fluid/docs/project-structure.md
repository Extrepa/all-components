# Project Structure Documentation

**Project:** errl-fluid
**Last Updated:** 2026-01-09

## Directory Structure
```
errl-fluid/
- `ERRL-SPEC.md`
- `INDEX.md`
- `PROJECT_STATUS.md`
- `README.md`
- `docs/`
- `eslint.config.js`
- `index.html`
- `package-lock.json`
- `package.json`
- `postcss.config.js`
- `public/`
- `src/`
  - `components/`
  - `hooks/`
  - `shaders/`
  ... (6 more items)
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
  - Core scene components
  - Fluid simulation components
  - Interaction components
- `shaders/` - GLSL shaders
  - Fragment shaders
  - Vertex shaders
- `hooks/` - Custom React hooks
- `content/` - Content configuration
  - `errl-config.ts` - ERRL_CONFIG

### `public/` - Public Assets
- Static assets
- Configuration files

## File Naming Conventions

- React components: PascalCase (e.g., `ErrlBackdrop.tsx`)
- Shaders: camelCase (e.g., `vertexShader.glsl`)
- Utilities: camelCase

## Import/Export Structure

- ES modules
- TypeScript
- React Three Fiber
- Web Worker for physics (Cannon.js)
