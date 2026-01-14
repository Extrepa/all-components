# Project Structure Documentation

**Project:** errl-club
**Last Updated:** 2026-01-09

## Directory Structure
```
errl-club/
- `05-Logs/`
  - `Daily/`
- `AGENTS.md`
- `CLEANUP_SUMMARY.md`
- `CONTRIBUTING.md`
- `INDEX.md`
- `PROJECT_STATUS.md`
- `README.md`
- `_Resources/`
  - `DesignSystem/`
- `docs/`
  - `assets/`
  - `design-references/`
  - `design-system/`
  - `dev/`
  ... (28 more items)
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
- `main.js` - Entry point
- `avatar/` - Avatar system
- `audio/` - Audio system
- `camera/` - Camera controls
- `collectibles/` - Collectible items
- `config/` - Configuration files
- `core/` - Core game systems
- `dev/` - Development tools
- `effects/` - Visual effects
- `entities/` - Game entities
- `input/` - Input handling
- `interactions/` - Interactive objects
- `network/` - Network/multiplayer
- `plugins/` - Plugin system
- `scene/` - Scene management
- `shaders/` - Custom shaders
- `systems/` - Game systems
- `ui/` - UI components

### `docs/` - Documentation
- `testing/` - Testing documentation (705 tests)
- `refactoring/` - Refactoring plans
- `dev/` - Development tools
- `design-references/` - Design references
- `specs/` - System specifications

## File Naming Conventions

- JavaScript: camelCase (e.g., `main.js`, `avatarController.js`)
- Classes: PascalCase (e.g., `GameInitializer.js`)

## Import/Export Structure

- ES modules
- Plain JavaScript
- Three.js imports
