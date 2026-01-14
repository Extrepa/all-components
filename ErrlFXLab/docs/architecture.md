# Architecture Documentation

**Project:** ErrlFXLab
**Type:** Web App
**Last Updated:** 2026-01-10

## Technical Architecture

### Technology Stack

Technology stack information to be documented.
### Project Type

Web App

## Architecture Overview

ErrlFXLab is a web-based creative coding laboratory for experimenting with visual effects, graphics, and interactive visualizations. Built as a client-side web application with modular architecture.

### Core Architecture

**Technical Stack:**
- Vanilla JavaScript (ES modules)
- HTML5 Canvas
- P5.js - Creative coding library
- Three.js - 3D graphics (optional)
- LocalStorage - State persistence

**Modular Structure:**
- Modular refactoring completed
- Independent modules for different FX types
- Shared utilities and helpers

### Component Structure

**Core Modules:**
- `app.js` - Main application orchestrator
- `ui.js` - UI management
- `projects.js` - Project management
- `session.js` - Session handling
- `storage.js` - LocalStorage management

**FX Modules:**
- `p5-fx.js` - P5.js effects
- `html-fx.js` - HTML/CSS effects
- `three-d.js` - Three.js 3D effects
- `voxels.js` - Voxel effects
- `svg-handler.js` - SVG processing

**Utilities:**
- `utils.js` - Shared utilities
- `audio.js` - Audio handling
- `capture.js` - Screenshot/capture
- `export.js` - Export functionality

## Key Design Decisions

### Modular Architecture
- **Rationale**: Easy to add/remove features
- **Benefit**: Maintainable, extensible codebase
- **Status**: Modular refactoring completed

### Client-Side Only
- **Rationale**: No build step required
- **Benefit**: Simple deployment, works offline
- **Implementation**: Open index.html directly

### LocalStorage Persistence
- **Rationale**: Save projects and presets
- **Benefit**: User data persists across sessions
- **Implementation**: LocalStorage API

## Dependencies

- P5.js - Creative coding library
- Three.js - 3D graphics (optional)
- Vanilla JavaScript - No framework dependencies

## Design Patterns

### Module Pattern
- Each FX type is a module
- Shared utilities
- Event-driven updates

### State Management
- Global App state object
- LocalStorage persistence
- State synchronization

## Performance Considerations

### Canvas Rendering
- Efficient Canvas2D operations
- Optimized animation loops
- Frame rate management

### Module Loading
- Lazy loading of FX modules
- Efficient resource usage
- On-demand initialization

## Related Documentation

- [Refactoring Complete](../REFACTORING_COMPLETE.md) - Refactoring summary
- [Modular Refactoring Complete](../MODULAR_REFACTORING_COMPLETE.md) - Modular refactoring notes
- [Refactoring Status](../REFACTORING_STATUS.md) - Current refactoring status
- [Test Report](../TEST_REPORT.md) - Test results and verification
- [Project Structure](project-structure.md) - File organization
