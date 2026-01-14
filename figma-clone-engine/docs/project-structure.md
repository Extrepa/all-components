# Project Structure Documentation

**Project:** figma-clone-engine
**Last Updated:** 2026-01-09

## Directory Structure
```
figma-clone-engine/
- `CHANGELOG.md`
- `DOCUMENTATION_COMPLETE.md`
- `IMPLEMENTATION_COMPLETE.md`
- `IMPLEMENTATION_SUMMARY.md`
- `INDEX.md`
- `INSPECTOR_PANEL_UPDATE_PLAN.md`
- `PROJECT_STATUS.md`
- `README.md`
- `docs/`
- `index.html`
- `package-lock.json`
- `package.json`
- `src/`
  - `components/`
  - `hooks/`
  ... (4 more items)
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
  - `LayersPanel.tsx` - Layer management
  - `InspectorPanel.tsx` - Property editing
  - `Rulers.tsx` - Measurement rulers
  - `AlignmentGuides.tsx` - Visual guides
  - `ContextMenu.tsx` - Right-click menu
  - `FileMenu.tsx` - File operations
- `hooks/` - Custom React hooks
- `utils/` - Utility functions
  - `helpers.ts` - Helper functions
  - `migration.ts` - State migration
  - `layout.ts` - Layout calculations
  - `codeGeneration.ts` - CSS/React code gen
  - `fileOperations.ts` - File handling
  - `editOperations.ts` - Edit operations
  - `zoomOperations.ts` - Zoom controls
  - `groupOperations.ts` - Grouping
  - `layerOperations.ts` - Layer operations
- `types.ts` - TypeScript types
- `App.tsx` - Main application

### `shared/` - Shared Utilities
- `hooks/` - Shared hooks (useHistory, etc.)

## File Naming Conventions

- React components: PascalCase (e.g., `InspectorPanel.tsx`)
- Utilities: camelCase (e.g., `helpers.ts`)
- Types: PascalCase interfaces

## Import/Export Structure

- ES modules
- TypeScript
- Path aliases (`@/` for shared)
- Normalized state structure
