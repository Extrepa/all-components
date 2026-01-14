# Hybrid Initialization Approach

**Date**: December 10, 2025  
**Status**: Active  
**Related**: Phase A refactoring (A1-A7), Phase B foundation modules

## Overview

After Phase A refactoring, the project uses a **hybrid initialization approach** that balances code organization with flexibility:

- **GameInitializer**: Handles standard, reusable system initialization
- **main.js**: Handles custom enhancements and user-interaction-dependent setup

This approach allows us to:
- Keep standard initialization organized and reusable
- Maintain custom features without polluting the standard initialization flow
- Easily test standard systems independently
- Add new custom features without modifying GameInitializer

## Architecture

### GameInitializer (Standard Initialization)

**Location**: `src/core/GameInitializer.js`

**Responsibilities**:
- Initialize foundation systems (StateManager, EventBus)
- Set up Three.js (Scene, Camera, Renderer)
- Initialize input systems
- Build scene geometry
- Initialize standard game systems (Avatar, Physics, Collision, etc.)
- Set up post-processing
- Initialize UI systems
- Set up event handlers
- Return all initialized systems as a single object

**What it handles**:
- ✅ Standard Three.js setup
- ✅ Standard game systems (Avatar, Physics, Collision, etc.)
- ✅ Standard UI systems
- ✅ Standard interactive objects (doors, teleporters, etc.)
- ✅ Standard post-processing setup
- ✅ Standard audio system initialization

**What it doesn't handle**:
- ❌ Custom enhancements (holographic rings, visualizer room)
- ❌ User-interaction-dependent initialization (audio file loading)
- ❌ Custom interactive objects specific to main.js

### main.js (Custom Enhancements)

**Location**: `src/main.js` (898 lines, down from 1,404)

**Responsibilities**:
- Import CSS and Three.js
- Set up canvas
- Call `GameInitializer.initialize()`
- Extract systems from GameInitializer
- Add custom enhancements:
  - Holographic rings
  - Visualizer room teleporter
  - Custom camera console
  - Custom lighting console
  - Codex asset integration
- Handle user-interaction-dependent initialization:
  - Audio file loading (requires user click)
  - Audio context initialization
- Set up GameLoop and UpdateManager
- Start GameLoop after post-processing is ready

**What it handles**:
- ✅ Custom visual enhancements
- ✅ Custom interactive objects
- ✅ User-interaction-dependent setup
- ✅ GameLoop initialization
- ✅ UpdateManager setup

## Initialization Flow

```mermaid
flowchart TD
  Start[main.js starts] --> Canvas[Get canvas element]
  Canvas --> GI[Create GameInitializer]
  GI --> Init[GameInitializer.initialize()]
  Init --> Systems[Systems object returned]
  Systems --> Extract[Extract systems in main.js]
  Extract --> Custom[Add custom enhancements]
  Custom --> Audio[Setup audio on user interaction]
  Audio --> GL[Initialize GameLoop]
  GL --> UM[Initialize UpdateManager]
  UM --> StartLoop[Start GameLoop]
```

## When to Use Each Approach

### Use GameInitializer For:

- **Standard systems** that will be used in multiple contexts
- **Reusable initialization** that doesn't depend on custom features
- **Systems that need to be testable** independently
- **Systems that follow standard patterns**

**Examples**:
- Avatar system
- Physics system
- Collision system
- Standard UI panels
- Standard interactive objects (doors, teleporters)

### Use main.js For:

- **Custom enhancements** specific to the main game
- **User-interaction-dependent** initialization
- **One-off features** that don't need to be reusable
- **Features that depend on custom setup** in main.js

**Examples**:
- Holographic rings (custom visual effect)
- Visualizer room teleporter (custom feature)
- Audio file loading (requires user click)
- Custom camera/lighting consoles

## Migration Guide

### Adding a New Standard System

1. **Create the system class** in appropriate directory
2. **Create or update initializer** in `src/core/initializers/`
3. **Add to GameInitializer** in appropriate phase
4. **Add update call** to `SystemsUpdater.js`
5. **Extract from systems object** in main.js if needed

**Example**: Adding a new standard interactive object

```javascript
// In GameInitializer.js, Phase 7
const myNewObject = new MyNewObject(scene, position);
this.systems.myNewObject = myNewObject;
```

### Adding a New Custom Feature

1. **Create the feature class** in appropriate directory
2. **Import in main.js**
3. **Initialize after GameInitializer** completes
4. **Add to systems object** if needed for updates

**Example**: Adding a custom visual effect

```javascript
// In main.js, after GameInitializer.initialize()
const customEffect = new CustomEffect(scene, systems.camera);
systems.customEffect = customEffect;
```

## Benefits

### Code Organization
- Standard initialization is centralized and reusable
- Custom code is clearly separated
- Easy to understand what's standard vs. custom

### Maintainability
- Changes to standard systems don't affect custom code
- Custom features can be modified without touching GameInitializer
- Clear separation of concerns

### Testability
- GameInitializer can be tested independently
- Standard systems can be tested in isolation
- Custom features can be tested separately

### Flexibility
- Easy to add new standard systems
- Easy to add new custom features
- Can migrate features between approaches as needed

## Current State

**Phase A (A1-A7)**: ✅ Complete
- main.js reduced from 1,404 to 898 lines (36% reduction)
- All standard initialization moved to GameInitializer
- Custom enhancements remain in main.js

**Phase B (B1-B3)**: ✅ Complete
- StateManager integrated in GameInitializer (Phase 0)
- EventBus integrated in GameInitializer (Phase 0)
- Avatar serialization implemented

**Next Steps**:
- Continue with Phase C (Multiplayer Preparation)
- Maintain hybrid approach for new features

## Related Documentation

- `docs/refactoring/REFACTORING_PLAN.md` - Full refactoring plan
- `docs/refactoring/REFACTORING_SESSION_SUMMARY.md` - Session summary
- `docs/DEVELOPER_QUICKSTART.md` - Developer guide
- `docs/initialization_flow.md` - Initialization flow diagram

