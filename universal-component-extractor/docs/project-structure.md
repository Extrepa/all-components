# Project Structure Documentation

**Project:** universal-component-extractor
**Last Updated:** 2026-01-09

## Directory Structure
```
universal-component-extractor/
- `App.tsx`
- `CHANGELOG.md`
- `INDEX.md`
- `PROJECT_STATUS.md`
- `README.md`
- `components/`
- `coverage/`
  - `universal-component-extractor/`
- `dist-electron/`
- `docs/`
  - `archive/`
- `electron/`
- `exported_components/`
- `hooks/`
- `index.css`
  ... (19 more items)
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
  - `AnalysisTab.tsx` - Analysis interface
  - `CodeBrowser.tsx` - Code browser
  - `ConsolePanel.tsx` - Console panel
  - `FileTree.tsx` - File tree navigation
- `services/` - AI service abstraction layer
- `utils/` - Utility functions
  - `fileTypeDetector.ts` - File type detection
  - `contentAggregator.ts` - Content aggregation
- `types/` - TypeScript type definitions

### `electron/` - Electron Main Process
- Main process files
- Preload scripts
- Window management

### `docs/` - Documentation
- User guide, developer guide
- Use cases, testing docs
- Build tools documentation

### `exported_components/` - Extracted Components
- Output directory for extracted components

## File Naming Conventions

- React components: PascalCase (e.g., `AnalysisTab.tsx`)
- Services: camelCase (e.g., `fileTypeDetector.ts`)
- Types: PascalCase interfaces

## Import/Export Structure

- ES modules
- TypeScript
- Electron main/renderer separation
- AI service abstraction
