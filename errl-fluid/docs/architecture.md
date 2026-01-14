# Architecture Documentation

**Project:** errl-fluid
**Type:** Web App
**Last Updated:** 2026-01-10

## Technical Architecture

### Technology Stack

- **React**
- **Three.js**
- **React Three Fiber**
### Project Type

Web App

## Architecture Overview

errl-fluid is a React-based fluid simulation application using Three.js and React Three Fiber. It implements the ERRL specification for high-performance WebGL physics with semantic HTML overlays.

### Core Architecture

**Technical Stack:**
- React 18 + Vite (TypeScript)
- Three.js + React Three Fiber
- Cannon.js (physics in Web Worker)
- React Spring + Framer Motion (animations)
- Tailwind CSS (styling)
- Zustand (state management)

### Component Structure

**Core Scene (App.tsx):**
- Fixed Perspective camera at [0, 0, 5]
- Scroll hijacked by ScrollControls (Damping: 0.3)
- Layering: Z-Index 0 (Canvas) and Z-Index 10 (HTML overlay)

**Fluid Simulation (ErrlBackdrop.tsx + errl.ts):**
- Domain Warping via Fractal Brownian Motion (FBM)
- Logic: `f(p) = fbm( p + fbm( p + fbm(p) ) )`
- Projector Light: 2D distance field mask in fragment shader
- Sync: uScrollY uniform driven by scroll.offset
- Performance: 4 octaves (high tier) or 2 octaves (low tier)

**Interaction Actors (StretchyBubble.tsx):**
- Interactive bubble system
- Physics-based interactions
- Real-time response to user input

## Key Design Decisions

### Deep Immersion Protocol
- **Rationale**: High-performance WebGL physics with semantic HTML
- **Benefit**: Best of both worlds - performance and accessibility
- **Implementation**: Canvas layer + HTML overlay

### Web Worker Physics
- **Rationale**: Offload physics calculations
- **Benefit**: Maintains 60fps during physics calculations
- **Implementation**: Cannon.js running in Web Worker

### Quality Tiers
- **Rationale**: Support different device capabilities
- **Benefit**: Works on low-end and high-end devices
- **Implementation**: Octave count adjustment via quality.ts

## Dependencies
- `@react-spring/three` - Spring animations for Three.js
- `@react-three/cannon` - Physics integration
- `@react-three/drei` - Three.js helpers
- `@react-three/fiber` - React renderer for Three.js
- `framer-motion` - Animation library
- `leva` - Debug controls
- `react`, `react-dom` - UI framework
- `three` - 3D graphics library
- `zustand` - State management

## Design Patterns

### Scroll-Controlled Rendering
- Scroll position drives shader uniforms
- Smooth transitions between sections
- Performance-optimized updates

### Component-Based Physics
- Physics components as React components
- Web Worker integration
- Real-time physics simulation

## Performance Considerations

### Quality Tiers
- High Tier: 4 octaves of noise
- Low Tier: 2 octaves of noise
- Automatic quality detection

### Web Worker Physics
- Physics calculations off main thread
- Maintains UI responsiveness
- Efficient resource usage

## Related Documentation

- [ERRL Specification](../ERRL-SPEC.md) - Master specification
- [Project Structure](project-structure.md) - File organization
