# Architecture Documentation

**Project:** psychedelic-liquid-light-show
**Type:** Web App
**Last Updated:** 2026-01-10

## Technical Architecture

### Technology Stack

- **React**
- **Three.js**
- **Pixi.js**
### Project Type

Web App

## Architecture Overview

psychedelic-liquid-light-show is a virtual recreation of 1960s-era liquid light shows using interactive Canvas2D particle simulations and AI-powered color palette generation.

### Core Architecture

**Technical Stack:**
- React 19 - UI framework
- TypeScript - Type safety
- Vite - Build tool
- PIXI.js v8 + WebGL shaders - Advanced rendering
- Canvas2D - Fallback rendering
- Google Gemini AI - Color palette generation

### Two-Phase Fluid Simulation

**Realistic Physics:**
- Oil floating above water
- Immiscible color mixing
- Buoyancy and surface tension
- Specular highlights
- Fresnel reflections
- Refraction
- Optional thin-film interference

**Particle System:**
- ~1200 active particles
- Radial gradients
- Physics: velocity, damping, life cycle
- Dual rendering modes: Demo and interactive painting

## Key Design Decisions

### Two-Phase Fluid System
- **Rationale**: Realistic oil-on-water behavior
- **Benefit**: Authentic liquid light show feel
- **Implementation**: Physics-based particle system

### AI-Powered Palettes
- **Rationale**: Generate creative color combinations
- **Benefit**: Infinite palette possibilities
- **Implementation**: Google Gemini API integration

### PIXI.js + WebGL
- **Rationale**: High-performance rendering
- **Benefit**: Smooth animations, advanced effects
- **Fallback**: Canvas2D for compatibility

## Dependencies
- `pixi.js` - WebGL rendering
- `react`, `react-dom` - UI framework
- `three` - 3D utilities (if used)
- `vite-plugin-glsl` - GLSL shader support

## Design Patterns

### Component-Based UI
- React components for UI
- Canvas/WebGL for rendering
- Separation of concerns

### State Management
- React state for UI
- Canvas state for simulation
- Efficient state updates

## Performance Considerations

### Particle Optimization
- Caps at 1200 particles
- FIFO eviction
- Efficient rendering

### Quality Settings
- Adjustable simulation resolution
- Performance vs. quality trade-offs
- Responsive to device capabilities

## Related Documentation

- [WARP Guide](../WARP_GUIDE.md) - WARP (warp.dev) AI assistant guide
- [Project Structure](project-structure.md) - File organization
