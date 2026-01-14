# Errl Club Simulator

A browser-based 3D virtual nightclub where users appear as Errl-like goo avatars, move around, dance, and interact.

**Last Updated**: December 10, 2025  
**Status**: Production Ready ✅ | 705 Tests | Comprehensive Documentation

## Tech Stack

- **Frontend**: Vite, plain JavaScript (ES modules), Three.js
- **Rendering**: WebGL via Three.js
- **Bundling**: Vite

## Architecture at a Glance

```mermaid
flowchart LR
  Input[Input (WASD/Mouse)] --> Avatar[Avatar Controller]
  Audio[AudioSystem] --> Lights[Audio-reactive Lights]
  Avatar --> Scene[Scene Graph]
  Scene --> PostFX[PostProcessing Manager]
  PostFX --> Render[Three.js Renderer]
  Render --> HUD[HUD/UI]
  Audio --> FX[Particle/FX Triggers]
```

- **Network sync**: See `docs/network_sync.md` for how player state is serialized, diffed, and broadcast.
- **Initialization flow**: See `docs/initialization_flow.md` for phase order and dependencies in `GameInitializer`.

## Requirements

- **Node.js**: v25.2.1 (use `.nvmrc` or check `package.json` engines field)
- **npm**: v10.0.0 or higher

### Quick Setup

If you have `nvm` installed:
```bash
nvm use  # Automatically uses version from .nvmrc
```

## Development

### Initial Setup

```bash
# Install dependencies
npm install

# Set up git hooks (runs automatically after npm install)
npm run prepare

# Copy environment variables template
cp .env.example .env
# Edit .env with your configuration
```

### Development Commands

```bash
# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Code Quality
npm run lint          # Check for linting errors
npm run lint:fix      # Auto-fix linting errors
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
npm run check         # Run both lint and format checks

# Testing
npm test              # Run all tests (705 tests across 27 files)
npm run test:e2e      # Run end-to-end tests
npm run test:unit     # Run unit tests
npm run test:headed   # Run tests with browser visible
npm run test:debug    # Run tests in debug mode
npm run test:report   # Show test report

# Security
npm run audit         # Check for security vulnerabilities
npm run audit:fix     # Fix security vulnerabilities
```

### Pre-commit Hooks

This project uses Husky and lint-staged to automatically:
- Run ESLint on staged JavaScript files
- Format code with Prettier
- Prevent commits with linting errors

These checks run automatically when you commit. To bypass (not recommended):
```bash
git commit --no-verify
```

## Project Structure

```
errl-club/
├── src/                    # Source code
│   ├── main.js            # Main JavaScript entry point
│   ├── style.css          # Global styles
│   ├── avatar/            # Avatar system
│   ├── audio/             # Audio system
│   ├── camera/            # Camera controls
│   ├── collectibles/      # Collectible items
│   ├── config/            # Configuration files
│   ├── core/              # Core game systems
│   ├── dev/               # Development tools
│   ├── effects/           # Visual effects
│   ├── entities/          # Game entities
│   ├── input/             # Input handling
│   ├── interactions/      # Interactive objects
│   ├── network/           # Network/multiplayer
│   ├── plugins/           # Plugin system
│   ├── scene/             # Scene management
│   ├── shaders/           # Custom shaders
│   ├── systems/           # Game systems
│   └── ui/                # UI components
├── docs/                  # Documentation
│   ├── testing/           # Testing documentation
│   ├── refactoring/       # Refactoring plans
│   └── specs/             # System specifications
├── scripts/               # Build scripts
└── dist/                  # Build output (generated)
```

### Documentation

- **[docs/README.md](docs/README.md)** - Documentation index
- **[docs/DEVELOPER_QUICKSTART.md](docs/DEVELOPER_QUICKSTART.md)** - Quick start guide for new developers
- **[docs/CODEX_FEATURES_GUIDE.md](docs/CODEX_FEATURES_GUIDE.md)** - Complete Codex features guide
- **[docs/KEYBINDS_REFERENCE.md](docs/KEYBINDS_REFERENCE.md)** - Complete keybinds reference
- **[docs/testing/](docs/testing/)** - Testing plans and reports
- **[docs/refactoring/](docs/refactoring/)** - Refactoring documentation
- **[src/assets/avatars/ASSET_CATALOG.md](src/assets/avatars/ASSET_CATALOG.md)** - Avatar asset catalog
- **[src/config/COLOR_VARIANTS_README.md](src/config/COLOR_VARIANTS_README.md)** - Color variants guide

## Roadmap

This project follows a 500-step implementation roadmap across 10 chapters:
1. Foundations & Core Structure
2. Core Club Geometry
3. Errl Avatar Engine
4. Input, Movement & Camera
5. Environment Interactions
6. Audio & Visual Systems ✅ (Completed)
7. Multiplayer Infrastructure
8. World Expansion
9. UX, UI & Polish ✅ (Completed - December 10, 2025)
10. Release, Live Ops & Future Expansion

## Chapter 6 Features (Audio & Visual Systems)

### Audio-Reactive Features
- Beat detection and BPM estimation
- Frequency band extraction (bass, mid, treble)
- Audio-reactive lighting (bloom, wall lights, LED strips)
- Beat-triggered effects (strobe, bass quake, floor ripples)
- Speaker particle bursts on strong peaks
- DJ screen shader transitions

### Visual Modes
- UV/Blacklight mode (U key)
- Visualizer style picker (V key) - multiple styles: default, neon, retro, cyberpunk, minimal, intense
- Chromatic aberration at high vibe levels
- Ghost trails at high energy
- Color inversion flashes on key musical moments
- Glitch mode (Shift+G)

### Visual Effects
- Vibe meter that tracks dance intensity
- Visual recorder for capturing frames (Ctrl+R)
- Visualizer room with intense effects (accessible via teleporter)
- Audio mapping configuration system
- Breathing/pulsing effects on speakers and LED strips

## Controls

### Movement
- **WASD** - Move avatar
- **Shift + WASD** - Run
- **Ctrl** - Crouch
- **Space** - Hop/Jump
- **Shift + Space** - Dash
- **Shift + D** - Dance

### Camera
- **Mouse Drag** - Orbit camera
- **Scroll Wheel** - Zoom in/out
- **1, 2, 3** - Camera presets
- **R** - Snap camera behind avatar
- **C** - Toggle cinematic mode
- **F** - Toggle freecam mode
- **L** - Toggle lock-on mode

### Interactions
- **E** - Interact with objects
- **Tab** - Open emote wheel
- **T** - Toggle replay recording
- **G** - Spawn ghost replay
- **Y** - Teleport to nearest anchor

### Visual Effects
- **U** - Toggle UV/blacklight mode
- **V** - Toggle visualizer style picker
- **Shift + G** - Toggle glitch mode
- **Ctrl + R** - Toggle visual recording
- **I** - Trigger color inversion flash

### Events
- **B** - Trigger blackout event
- **Shift + S** - Trigger strobe event
- **Shift + W** - Trigger wave event

## Documentation

- [INDEX.md](INDEX.md) - Workspace index
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - Current status
- [Documentation Index](docs/index.md) - Detailed docs
