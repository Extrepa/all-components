# Architecture Documentation

**Project:** liquid-light-show-simulator
**Type:** Web App
**Last Updated:** 2026-01-10

## Technical Architecture

### Technology Stack

- **React**
### Project Type

Web App

## Architecture Overview

liquid-light-show-simulator is a browser-based canvas app that recreates 1960s-era liquid light shows using interactive Canvas2D particle simulations.

### Core Architecture

**Technical Stack:**
- TypeScript - Type safety
- Vite - Build tool
- Canvas2D - Rendering (no WebGL)
- Vitest - Testing

**Architecture:**
- Simple, self-contained structure
- Pure utility functions for simulation
- Canvas-based rendering
- Focus on visual feel over physical accuracy

### Component Structure

**Main Entry (`src/main.ts`):**
- Creates canvas
- Handles resize and pointer input
- Runs animation loop
- Delegates simulation + rendering

**Simulation (`src/simulation/blobs.ts`):**
- `createBlobs(count)` - Initializes colorful blobs
- `updateBlobs(blobs, dt, width, height, pointer)` - Updates positions, wobble, hue
- `drawBlobs(ctx, blobs, width, height)` - Renders with additive blending

**Testing (`src/simulation/blobs.test.ts`):**
- Vitest unit tests
- Covers blob creation and motion

## Key Design Decisions

### Canvas2D (Not WebGL)
- **Rationale**: Simplicity and compatibility
- **Benefit**: Works everywhere, easy to understand
- **Trade-off**: Less performance than WebGL

### Pure Functions
- **Rationale**: Testable, predictable code
- **Benefit**: Easy to test and reason about
- **Implementation**: Pure utility functions

### Visual Feel Over Physics
- **Rationale**: Focus on aesthetic, not accuracy
- **Benefit**: Intentionally small and self-contained
- **Future**: Can evolve to WebGL/shaders if needed

## Dependencies

- TypeScript - Type safety
- Vite - Build tool and dev server
- Vitest - Testing framework

## Design Patterns

### Functional Programming
- Pure functions for simulation
- Immutable data structures
- Predictable state updates

### Separation of Concerns
- Simulation logic separate from rendering
- Input handling separate from update loop
- Clear boundaries between systems

## Performance Considerations

### Particle System
- Caps at reasonable particle count
- Efficient Canvas2D rendering
- Optimized update loops

### Future Evolution
- Can migrate to WebGL for better performance
- Can add shaders for advanced effects
- Structure supports evolution

## Related Documentation

- [WARP Guide](../WARP_GUIDE.md) - WARP (warp.dev) AI assistant guide
- [Project Structure](project-structure.md) - File organization
