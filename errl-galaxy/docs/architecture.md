# Architecture Documentation

**Project:** errl-galaxy
**Type:** Next.js App
**Last Updated:** 2026-01-10

## Technical Architecture

### Technology Stack

- **Next.js**
- **React**
- **Three.js**
### Project Type

Next.js App

## Architecture Overview

Errl Galaxy is a Next.js application for exploring and visualizing galaxy structures using Three.js and React Three Fiber. It provides interactive 3D galaxy visualization with modern web technologies.

### Core Architecture

**Technical Stack:**
- Next.js 14 - React framework with SSR
- React 18 - UI framework
- Three.js - 3D graphics library
- React Three Fiber - React renderer for Three.js
- Lamina - Shader materials
- Zustand - State management
- TailwindCSS - Styling

### Component Structure

**Next.js App Router:**
- Server-side rendering support
- App directory structure
- Route-based organization

**3D Visualization:**
- Three.js scene setup
- Galaxy structure rendering
- Interactive camera controls
- Lamina shader materials for visual effects

**State Management:**
- Zustand for global state
- React state for component state
- Efficient state updates

## Key Design Decisions

### Next.js for SSR
- **Rationale**: Better SEO and initial load performance
- **Benefit**: Server-rendered content, fast initial load
- **Implementation**: Next.js App Router

### React Three Fiber
- **Rationale**: React-friendly Three.js integration
- **Benefit**: Component-based 3D scene management
- **Implementation**: useFrame hooks for animations

### Lamina Shaders
- **Rationale**: Advanced shader materials
- **Benefit**: Rich visual effects for galaxy visualization
- **Implementation**: Lamina material system

## Dependencies
- `react`, `react-dom` - UI framework
- `next` - React framework
- `three` - 3D graphics library
- `@react-three/fiber` - React renderer for Three.js
- `@react-three/drei` - Three.js helpers
- `lamina` - Shader materials
- `zustand` - State management
- `tailwindcss` - Styling

## Design Patterns

### Component-Based 3D
- Three.js objects as React components
- useFrame for animation loops
- Declarative 3D scene definition

### Server-Side Rendering
- Next.js SSR for initial content
- Client-side hydration
- Optimized performance

## Performance Considerations

### Next.js Optimizations
- Automatic code splitting
- Image optimization
- Static generation where possible

### Three.js Performance
- Efficient rendering
- Optimized geometry
- LOD (Level of Detail) support

## Related Documentation

- [Cursor Context](../CURSOR_CONTEXT.md) - Development context
- [Project Structure](project-structure.md) - File organization
