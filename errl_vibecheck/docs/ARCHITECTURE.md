# Architecture Documentation

**Project:** errl_vibecheck
**Type:** Web App
**Last Updated:** 2026-01-09

## Technical Architecture

### Technology Stack

- **React**
- **TailwindCSS**
- **Google GenAI**
### Project Type

Web App

## Architecture Overview

errl_vibecheck is an AI-powered visual coding playground that allows batch testing prompts with visual outputs. Generates code in multiple formats using Google's Gemini AI models.

### Core Architecture

**Technical Stack:**
- React 19 - UI framework
- TypeScript - Type safety
- Vite - Build tool
- Zustand - State management (with Immer)
- Tailwind CSS - Styling
- Google Gemini API - AI code generation
- Tone.js - Audio synthesis

### Component Structure

**Core Components:**
- `App.tsx` - Main application
- `Header.tsx` - Navigation and controls
- `Renderer.tsx` - Code rendering in sandboxed iframes
- `Result.tsx` - Individual result display
- `Collection.tsx` - Collection management
- `Screensaver.tsx` - Fullscreen display mode

**State Management:**
- Zustand store with Immer middleware
- Persistent state via Zustand persist
- Selector-based state access

**Features:**
- Multiple output modes (P5.js, SVG, HTML, Shaders, 3D Wireframes, 3D Voxels, Images)
- AI model comparison (Gemini Flash, Pro, etc.)
- Batch generation
- Visual rendering in sandboxed iframes
- Search & filter
- Export functionality
- Keyboard shortcuts
- Audio feedback
- Screensaver mode
- Favorites system
- Sharing via URLs
- Versus mode (side-by-side comparison)

## Key Design Decisions

### Sandboxed Rendering
- **Rationale**: Safe code execution
- **Benefit**: Isolated execution, no security risks
- **Implementation**: iframe sandboxing

### Zustand with Immer
- **Rationale**: Immutable state updates
- **Benefit**: Predictable state, easy debugging
- **Implementation**: Immer middleware

### Multi-Mode Support
- **Rationale**: Support various output formats
- **Benefit**: Flexible code generation
- **Implementation**: Mode-specific renderers

## Dependencies
- `@google/genai` - Gemini API client
- `@tailwindcss/browser` - Tailwind CSS
- `clsx` - Class name utility
- `immer` - Immutable state updates
- `lodash` - Utility functions
- `p-limit` - Promise concurrency
- `react`, `react-dom` - UI framework
- `react-syntax-highlighter` - Code highlighting
- `tailwindcss` - Styling
- `tone` - Audio synthesis

## Design Patterns

### Store Pattern
- Zustand store with selectors
- Persistent state
- Efficient updates

### Component Composition
- Reusable components
- Composition over inheritance
- Clear component boundaries

## Performance Considerations

### Batch Processing
- Concurrent request limiting (p-limit)
- Efficient rendering
- Optimized state updates

### Virtual Scrolling
- Efficient list rendering
- Large result sets handled
- Smooth scrolling

## Related Documentation

- [Architecture](ARCHITECTURE.md) - Detailed architecture
- [Project Structure](project-structure.md) - File organization
