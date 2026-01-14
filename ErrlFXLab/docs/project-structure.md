# Project Structure Documentation

**Project:** ErrlFXLab
**Last Updated:** 2026-01-09

## Directory Structure
```
ErrlFXLab/
- `INDEX.md`
- `MODULAR_REFACTORING_COMPLETE.md`
- `PROJECT_STATUS.md`
- `README.md`
- `REFACTORING_COMPLETE.md`
- `REFACTORING_STATUS.md`
- `TEST_REPORT.md`
- `docs/`
- `index.html`
- `js/`
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

### `js/` - JavaScript Modules
- `app.js` - Main application orchestrator
- `ui.js` - UI management
- `projects.js` - Project management
- `session.js` - Session handling
- `storage.js` - LocalStorage management
- `p5-fx.js` - P5.js effects
- `html-fx.js` - HTML/CSS effects
- `three-d.js` - Three.js 3D effects
- `voxels.js` - Voxel effects
- `svg-handler.js` - SVG processing
- `audio.js` - Audio handling
- `capture.js` - Screenshot/capture
- `export.js` - Export functionality
- `utils.js` - Shared utilities

### `docs/` - Documentation
- Architecture, project structure, completion checklist
- Refactoring documentation

## File Naming Conventions

- JavaScript modules: camelCase (e.g., `app.js`, `projects.js`)
- Documentation: UPPERCASE with underscores (e.g., `MODULAR_REFACTORING_COMPLETE.md`)

## Import/Export Structure

- ES modules (no build step)
- Direct browser execution
- LocalStorage for persistence
