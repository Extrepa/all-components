# Architecture Documentation

**Project:** svg_editor
**Type:** Web App
**Last Updated:** 2026-01-10

## Technical Architecture

### Technology Stack

- **React**
- **Paper.js**
### Project Type

Web App

## Architecture Overview

svg_editor is a comprehensive suite of 25+ professional tools for complete SVG manipulation, editing, and creation - designed as "Photoshop for SVGs".

**Note:** Project is migrating from vanilla JavaScript (app.js) to React + TypeScript. See [Migration Progress](../MIGRATION_PROGRESS.md) and [Feature Status](FEATURE_STATUS.md) for current status.

### Core Architecture

**Technical Stack (Current):**
- Vanilla JavaScript - No frameworks (legacy)
- React + TypeScript - Migration in progress
- DOM API - Direct SVG manipulation
- CSS3 - Modern styling
- HTML5 - Semantic markup

**Tool Categories:**
- Core Workflow (3 tools): Preview, Workflow Manager, Shape Library
- Editing Tools (10 tools): Color Replacer, Transform, Attributes, Path Merger, Node Editor, etc.
- Advanced Tools (8 tools): Image Tracer, Animator, Optimizer, Path Simplifier, etc.
- Precision & Cleanup (2 tools): Cleanup Tools, Measurement Tools
- Export & System (4 tools): Export Manager, Templates, File Patch, History

### Single Page Application

**Architecture:**
- All tools in one interface
- Shared state management
- Non-destructive editing
- Real-time preview
- Full history system (100 states)

**Data Flow:**
1. SVG file parsed into DOM structure
2. Paths and groups extracted and indexed
3. Tools manipulate DOM structure
4. Changes rendered in real-time
5. History system tracks all changes

## Key Design Decisions

### Vanilla JavaScript
- **Rationale**: No framework overhead
- **Benefit**: Direct control, fast performance
- **Trade-off**: More manual DOM management

### Non-Destructive Editing
- **Rationale**: Full undo/redo capability
- **Benefit**: Safe experimentation
- **Implementation**: History system with snapshots

### Tool-Based Architecture
- **Rationale**: Each tool is independent
- **Benefit**: Easy to add/remove tools
- **Structure**: Modular tool system

## Dependencies
- `lucide-react` - Icons (if React version exists)
- `paper` - Vector graphics (if Paper.js version)
- `react`, `react-dom` - UI framework (if React version)
- Or pure JavaScript for vanilla version

## Design Patterns

### Tool Pattern
- Each tool is self-contained
- Shared SVG state
- Tool switching via sidebar

### History Pattern
- Snapshot-based undo/redo
- 100 state limit
- Efficient state storage

## Performance Considerations

### Large SVG Handling
- Efficient DOM manipulation
- Optimized rendering
- Performance warnings for >10MB files

### History Management
- Limited to 100 states
- Efficient snapshot storage
- Memory-conscious implementation

## Related Documentation

- [README](../README.md) - Complete tool documentation
- [Project Structure](project-structure.md) - File organization
