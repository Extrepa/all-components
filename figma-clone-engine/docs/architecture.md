# Architecture Documentation

**Project:** figma-clone-engine
**Type:** Web App
**Last Updated:** 2026-01-09

## Technical Architecture

### Technology Stack

- **React**
### Project Type

Web App

## Architecture Overview

figma-clone-engine is a high-performance, component-based design tool built with React, TypeScript, and HTML5 Canvas. It provides professional design tool capabilities with infinite canvas, component architecture, and auto-layout.

### Core Architecture

**Technical Stack:**
- React - UI framework
- TypeScript - Type safety
- HTML5 Canvas - Rendering
- Normalized State - Efficient state management
- History System - Undo/redo

### Component Structure

**Main App (`App.tsx`):**
- DesignState management
- Viewport control
- Selection handling
- Tool management
- History system

**Core Components:**
- `LayersPanel` - Layer tree and management
- `InspectorPanel` - Property editing
- `Rulers` - Measurement rulers
- `AlignmentGuides` - Visual alignment guides
- `ContextMenu` - Right-click menu
- `FileMenu` - File operations
- `BottomDock` - Tool dock
- `FloatingTopNav` - Top navigation

**Node Types:**
- FrameNode - Container with auto-layout
- TextNode - Text elements
- RectangleNode - Shapes
- ImageNode - Images
- VectorNode - Vector paths
- InstanceNode - Component instances
- CommentNode - Comments

## Key Design Decisions

### Normalized State
- **Rationale**: Efficient state updates
- **Benefit**: Fast lookups, minimal re-renders
- **Implementation**: Flat node structure with parent references

### Canvas Rendering
- **Rationale**: High-performance rendering
- **Benefit**: Smooth interactions, large canvas support
- **Implementation**: HTML5 Canvas with optimized draw calls

### Component System
- **Rationale**: Master/Instance pattern
- **Benefit**: Reusable components, easy updates
- **Implementation**: Instance nodes reference master components

## Dependencies
- `react`, `react-dom` - UI framework
- `lucide-react` - Icons
- Canvas API - Rendering

## Design Patterns

### Master/Instance Pattern
- Master components define structure
- Instances reference masters
- Changes propagate to instances

### History Pattern
- Snapshot-based undo/redo
- Efficient state storage
- Full history support

## Performance Considerations

### Infinite Canvas
- Efficient viewport culling
- Optimized rendering
- Smooth pan/zoom

### Normalized State
- Fast node lookups
- Minimal re-renders
- Efficient updates

## Related Documentation

- [Architecture](architecture.md) - Detailed architecture (if exists)
- [Implementation Plan](implementation_plan.md) - Feature implementation
- [Project Structure](project-structure.md) - File organization
