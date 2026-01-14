# Architecture Documentation

**Project:** errl-club
**Type:** Web App
**Last Updated:** 2026-01-10

## Technical Architecture

### Technology Stack

- **React**
- **Three.js**
- **Supabase**
### Project Type

Web App

## Architecture Overview

errl-club is a browser-based 3D virtual nightclub built with Vite, plain JavaScript (ES modules), and Three.js. It features audio-reactive systems, multiplayer support, and comprehensive game systems.

### Core Architecture

**Technical Stack:**
- Vite - Build tool and dev server
- Plain JavaScript (ES modules) - No framework
- Three.js - 3D rendering via WebGL
- Supabase - Backend services (optional)

**Architecture Flow:**
```
Input (WASD/Mouse) → Avatar Controller
AudioSystem → Audio-reactive Lights
Avatar → Scene Graph → PostProcessing Manager → Three.js Renderer → HUD/UI
Audio → Particle/FX Triggers
```

### Core Systems

1. **Avatar System**
   - Errl-like goo avatars
   - Movement and animation
   - Physics-based interactions

2. **Audio System**
   - Beat detection and BPM estimation
   - Frequency band extraction (bass, mid, treble)
   - Audio-reactive lighting and effects

3. **Network Sync**
   - Player state serialization
   - State diffing and broadcasting
   - Multiplayer support

4. **Initialization Flow**
   - Phase-based initialization
   - Dependency management
   - GameInitializer orchestrates startup

## Key Design Decisions

### Plain JavaScript (No Framework)
- **Rationale**: Performance and simplicity
- **Benefit**: Direct control, no framework overhead
- **Implementation**: ES modules with Vite

### Audio-Reactive Systems
- **Rationale**: Immersive club experience
- **Benefit**: Dynamic, music-driven visuals
- **Implementation**: Real-time audio analysis

### Component-Based Architecture
- **Rationale**: Modular, maintainable code
- **Benefit**: Easy to extend and modify
- **Structure**: Organized by system (avatar/, audio/, etc.)

## Dependencies
- `@supabase/supabase-js` - Backend services (optional)
- `three` - 3D graphics library
- Vite - Build tool

## Design Patterns

### System-Based Organization
- Systems organized by directory (avatar/, audio/, camera/, etc.)
- Clear separation of concerns
- Modular architecture

### Event-Driven Updates
- Audio events trigger visual effects
- Input events drive avatar movement
- Network events sync player state

## Performance Considerations

### WebGL Optimization
- Efficient Three.js rendering
- Optimized geometry and materials
- Post-processing effects

### Audio Processing
- Real-time frequency analysis
- Efficient beat detection
- Optimized audio-reactive updates

## Related Documentation

- [Network Sync](network_sync.md) - Network synchronization
- [Initialization Flow](initialization_flow.md) - Startup sequence
- [Project Structure](project-structure.md) - File organization
