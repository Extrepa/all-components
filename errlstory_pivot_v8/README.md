# ErrlStory – React Prototype

ErrlStory is a 2D side-scrolling action RPG inspired by MapleStory, starring a goo creature called Errl.

This prototype uses a custom "Flash-style" game loop (Fixed Timestep) inside a React application, rendering to an HTML5 Canvas.

## Controls

**Title Screen**
- `Enter` or `Space`: Start Game (Go to Town)

**Town (Hub)**
- `F`: Go to Field (Gameplay/Grind Map)
- `B`: Go to Boss Arena
- `Esc`: Return to Title
- Invisible portal in center: Dev Room (debug tools)

**Field & Boss**
- `T`: Return to Town

**Movement**
- `Arrow Left` / `A`: Move left
- `Arrow Right` / `D`: Move right
- `Space` / `Arrow Up` / `W`: Jump
- `Shift`: Dash
- `Arrow Down` / `S`: Crouch (squish effect)
- Hold `Down` + `Jump`: Drop through platforms

**Combat**
- `Z` / `K`: Melee attack
- `X` / `L`: Magic attack (unlocked at level 5)
- Hold `X` / `L`: Charge magic attack

**UI**
- `I`: Inventory
- `Q`: Quest Log
- `Escape`: Close modals / Return to title
- `Arrow Up` / `W` (near NPC/Portal): Interact

**Dev Room** (Debug Tools)
- `~` or `F1`: Open Dev Menu
- `Escape`: Close Dev Menu
- Portal: Exit Dev Room

## Tech Stack
- **React**: UI Shell and Component lifecycle.
- **Canvas API**: Raw 2D rendering (no external game engine like Phaser).
- **Custom Loop**: Fixed timestep update (60hz), variable rendering.
- **Tailwind CSS**: Styling the container and UI overlays.

## Documentation

- [INDEX.md](INDEX.md) - Workspace index
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - Current status
- [Documentation Index](docs/index.md) - Detailed docs with links to all documentation

### Game Development Documentation

**Game Design & Planning:**
- [Game Design](docs/game-design.md) - Game design documentation
- [Features](docs/features.md) - Feature list and status
- [Controls](docs/controls.md) - Control scheme documentation
- [Progression](docs/progression.md) - Progression system
- [Future Ideas](docs/future-ideas.md) - Future development ideas

**Development Plans:**
- [Phase 1 Plan](docs/phase1-plan.md) - Phase 1 development plan
- [Phase 3 Plan](docs/phase3-plan.md) - Phase 3 development plan
- [Dev Room Plan](docs/dev-room-plan.md) - Dev room implementation plan
- [Mobile Controls Plan](docs/mobile-controls-plan.md) - Mobile controls plan
- [Asset Generator Plan](docs/ASSET_GENERATOR_PLAN.md) - Asset generator planning

**Asset Documentation:**
- [Asset Sizes](docs/ASSET_SIZES.md) - Asset size specifications
- [Errl Sprite Prep](docs/ERRL_SPRITE_PREP.md) - Sprite preparation guide

**Technical Documentation:**
- [Dev Notes](DEV_NOTES.md) - Architectural details and roadmap
- [Architecture](docs/architecture.md) - Technical architecture and design
- [Project Structure](docs/project-structure.md) - File organization and structure

## Development
See [DEV_NOTES.md](DEV_NOTES.md) for architectural details and the roadmap for extending the game.