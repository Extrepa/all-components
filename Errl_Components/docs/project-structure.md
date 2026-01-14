# Project Structure Documentation

**Project:** Errl_Components
**Last Updated:** 2026-01-09

## Directory Structure
```
Errl_Components/
- `ERRL_NOTES.md`
- `INDEX.md`
- `NOTES.md`
- `PROJECT_STATUS.md`
- `README.md`
- `USAGE.md`
- `docs/`
- `index.html`
- `package-lock.json`
- `package.json`
- `scrollConfig.ts`
- `src/`
  - `components/`
  - `content/`
  - `shaders/`
  ... (2 more items)
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
- `components/` - React Three Fiber components
  - `ErrlPage.tsx` - Main orchestrator
  - `ProjectorRig.tsx` - Overhead projector shader
  - `InstancedBubbleSystem.tsx` - Optimized bubbles
  - `ExplosionSystem.tsx` - Particle effects
  - `BubbleButton.tsx` - DOM button component
  - `ErrlContentLayout.tsx` - HTML content layout
  - `ScrollController.tsx` - Scroll navigation
  - `PerformanceMonitor.tsx` - FPS tracking
- `content/` - Content configuration
  - `errl-config.ts` - ERRL_CONFIG
- `store/` - Zustand stores
  - `useErrlInteractions.ts` - Bubble interactions
  - `useScrollStore.ts` - Scroll control
  - `useHypnoStore.ts` - Legacy trigger
- `shaders/` - Shader files
  - `vertexShader.glsl` - Base vertex shader
  - `fragmentShader.glsl` - Base fragment shader

## File Naming Conventions

- React components: PascalCase (e.g., `ErrlPage.tsx`)
- Stores: camelCase with `use` prefix (e.g., `useErrlInteractions.ts`)
- Shaders: camelCase (e.g., `vertexShader.glsl`)

## Import/Export Structure

- ES modules
- TypeScript
- React Three Fiber
- Zustand stores
