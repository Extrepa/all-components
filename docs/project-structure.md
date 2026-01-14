# Project Structure Documentation

**Project:** all-components
**Last Updated:** 2026-01-09

## Directory Structure
```
all-components/
- `Errl_Components/`
  - `components/`
  - `content/`
  - `shaders/`
  - `store/`
- `INDEX.md`
- `PROJECT_STATUS.md`
- `README.md`
- `docs/`
- `errl-club-ui/`
  - `components/`
  - `screens/`
- `errl-design-system/`
  - `src/`
- `errl-forge/`
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

### Project-Based Organization

**errl-club-ui/** (50+ components)
- `components/` - UI components
- `screens/` - Screen components

**figma-clone-engine/** (41 components)
- `components/` - Editor components

**errl_vibecheck/** (11 components)
- `components/` - App components

**errl-forge/** (12 components)
- Asset remixer components

**errl-portal/** (5 components)
- UI components (button, card, input, scroll-area, tabs)

**errl-portal-shared/** (Shared components)
- Component library catalog
- Project components (bubble-mouse-trail, gravity-sticker-field, etc.)
- SVG utilities
- UI components

**Errl_Components/** (13 components)
- BubbleButton, BubbleMesh, ErrlContentLayout, TrippyScene
- Shaders and stores

**errl_scene_builder/** (24 components)
- AppShell, AssetPanel, CanvasSettings, ErrlEditor, SceneViewport
- Renderer, hooks, utilities

**Total**: 199 component files from 9 projects

## File Naming Conventions

- Components organized by source project
- Maintains original project structure
- Easy to trace component origins

## Import/Export Structure

- Reference library (components are copies)
- Not used as shared dependencies
- Organized for browsing and comparison
