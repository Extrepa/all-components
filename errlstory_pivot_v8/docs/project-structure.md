# Project Structure Documentation

**Project:** errlstory_pivot_v8
**Last Updated:** 2026-01-09

## Directory Structure
```
errlstory_pivot_v8/
- `App.tsx`
- `DEV_NOTES.md`
- `INDEX.md`
- `PROJECT_STATUS.md`
- `README.md`
- `components/`
- `docs/`
- `game/`
  - `core/`
  - `data/`
  - `dev/`
  - `effects/`
  - `entities/`
- `index.html`
- `index.tsx`
  ... (8 more items)
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

### `game/` - Game Core
- `core/` - Core systems (Game, Loop, SceneManager, Input, Camera, Audio, Save)
- `data/` - Game data (cosmetics, items, quests)
- `dev/` - Dev tools (DevState, DevMenu)
- `effects/` - Visual effects (FloatingTextManager, ParticleSystem)
- `entities/` - Game entities (Player, Mob, NPC, Portal, Projectile, etc.)
- `scenes/` - Game scenes (Title, Town, Field, Boss, DevRoom, GameOver)
- `systems/` - Game systems (QuestSystem, DailyChallengeSystem)
- `ui/` - UI components (HUD, Inventory, QuestLog, Shop, etc.)

### `components/` - React Components
- `GameCanvas.tsx` - Canvas wrapper

## File Naming Conventions

- Game classes: PascalCase (e.g., `Game.ts`, `Player.ts`)
- React components: PascalCase (e.g., `GameCanvas.tsx`)
- Data files: camelCase (e.g., `items.ts`)

## Import/Export Structure

- ES modules
- TypeScript
- React for UI shell
- Canvas API for game rendering
