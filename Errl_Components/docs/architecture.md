# Architecture Documentation

**Project:** Errl_Components
**Type:** Component Library
**Last Updated:** 2026-01-09

## Technical Architecture

### Technology Stack

- **React**
- **Three.js**
### Project Type

Component Library

## Architecture Overview

Errl Components uses the **"Red Pill" Pattern: DOM → Zustand → WebGL** - a three-layer architecture that keeps React out of the animation loop.

### Three-Layer Architecture

1. **DOM Layer**: HTML buttons emit events to zustand stores
2. **Store Layer**: Zustand holds interaction state (hover, clicks, scroll)
3. **WebGL Layer**: Three.js components read stores directly in `useFrame` loops

This pattern ensures:
- Zero React re-renders during animations
- Smooth 60fps performance
- Perfect sync between DOM and WebGL

### Core Components

**ErrlPage** - Main orchestrator:
- ProjectorRig: Scroll-synced shader background
- InstancedBubbleSystem: Optimized bubble rendering
- ExplosionSystem: Particle burst effects
- ErrlContentLayout: HTML narrative content

**ProjectorRig** - Overhead projector shader:
- Scroll position drives `uScrollProgress` uniform
- Animated oil noise creates fluid effects
- Section-based light intensity interpolation
- Edge glows and chromatic aberration

**InstancedBubbleSystem** - Optimized bubble rendering:
- Single `InstancedMesh` for all bubbles
- Per-instance attributes for position and hover strength
- Vertex shader wobble on hover
- Fragment shader with Errl colors and glows
- Conditional updates (only when state changes)

**ExplosionSystem** - Particle effects:
- 50 particles in single draw call
- Physics: velocity, drag, lifetime
- 2D→3D coordinate mapping from click position
- Color variation (cyan/magenta palette)

## Key Design Decisions

### Red Pill Pattern
- **Rationale**: Keep React out of animation loop for performance
- **Benefit**: 60fps animations without React re-renders
- **Implementation**: Zustand stores + useFrame hooks

### Instanced Rendering
- **Rationale**: Optimize bubble rendering
- **Benefit**: Single draw call for all bubbles
- **Trade-off**: Requires careful state management

### Configuration-Driven Content
- **Rationale**: Externalize content without code changes
- **Benefit**: Easy content updates
- **Implementation**: ERRL_CONFIG in `src/content/errl-config.ts`

## Dependencies
- `@react-three/drei` - Three.js helpers
- `@react-three/fiber` - React renderer for Three.js
- `react`, `react-dom` - UI framework
- `three` - 3D graphics library
- `zustand` - State management

## Design Patterns

### Store Pattern
- Zustand stores for interaction state
- Direct state access in useFrame loops
- Event-driven updates from DOM

### Component Composition
- ErrlPage orchestrates all layers
- Modular component system
- Reusable shader components

## Performance Considerations

### Optimizations
- Instanced rendering for bubbles
- Conditional uniform updates
- Cached calculations (aspect ratio)
- Efficient Zustand stores

### Monitoring
- Performance monitor (P key)
- FPS tracking
- Frame time measurement
- Target: 60fps (16.67ms per frame)

## Related Documentation

- [README](../README.md) - Complete architecture details
- [Project Structure](project-structure.md) - File organization
