# Architecture Documentation

**Project:** errlstory_pivot_v8
**Type:** Web App
**Last Updated:** 2026-01-10

## Technical Architecture

### Technology Stack

- **React**
### Project Type

Web App

## Architecture Overview

errlstory_pivot_v8 is a 2D side-scrolling action RPG inspired by MapleStory, starring a goo creature called Errl. Uses a custom "Flash-style" game loop inside a React application.

### Core Architecture

**Technical Stack:**
- React - UI shell and component lifecycle
- Canvas API - Raw 2D rendering (no game engine)
- Custom Loop - Fixed timestep update (60hz), variable rendering
- Tailwind CSS - Styling

**Game Loop:**
- Fixed timestep update (60hz)
- Variable rendering
- Flash-style game loop architecture
- React component wrapper

### Component Structure

**Game Core (`game/core/`):**
- `Game.ts` - Main game orchestrator
- `Loop.ts` - Game loop implementation
- `SceneManager.ts` - Scene management
- `Input.ts` - Input handling
- `Camera.ts` - Camera system
- `AudioSystem.ts` - Audio management
- `SaveSystem.ts` - Save/load functionality

**Scenes (`game/scenes/`):**
- `TitleScene.ts` - Title screen
- `TownScene.ts` - Hub/town scene
- `FieldScene.ts` - Gameplay/grind map
- `BossScene.ts` - Boss arena
- `DevRoomScene.ts` - Debug tools
- `GameOverScene.ts` - Game over screen

**Entities (`game/entities/`):**
- `Player.ts` - Main character
- `Mob.ts` - Enemy mobs
- `NPC.ts` - Non-player characters
- `Portal.ts` - Scene transitions
- `Projectile.ts` - Projectile system

**Systems (`game/systems/`):**
- `QuestSystem.ts` - Quest management
- `DailyChallengeSystem.ts` - Daily challenges

## Key Design Decisions

### Custom Game Loop
- **Rationale**: Full control over game timing
- **Benefit**: Predictable, consistent gameplay
- **Implementation**: Fixed timestep (60hz) update loop

### Canvas API (No Engine)
- **Rationale**: Lightweight, no engine overhead
- **Benefit**: Full control, smaller bundle
- **Trade-off**: More manual work

### React UI Shell
- **Rationale**: Modern UI framework
- **Benefit**: Component-based UI
- **Implementation**: React wraps Canvas game

## Dependencies
- `react`, `react-dom` - UI framework
- Tailwind CSS - Styling
- Canvas API - Rendering

## Design Patterns

### Scene Pattern
- Each scene is a class
- Scene manager coordinates
- Easy scene transitions

### Entity-Component Pattern
- Entities with components
- Modular game objects
- Flexible composition

## Performance Considerations

### Fixed Timestep
- Consistent 60hz updates
- Frame-independent logic
- Smooth gameplay

### Canvas Optimization
- Efficient 2D rendering
- Optimized draw calls
- Performance monitoring

## Related Documentation

- [Dev Notes](../DEV_NOTES.md) - Architectural details
- [Project Structure](project-structure.md) - File organization
