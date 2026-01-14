# Architecture Documentation

**Project:** ErrlOS-Plugin
**Type:** Obsidian Plugin
**Last Updated:** 2026-01-10

## Technical Architecture

### Technology Stack

- **Node.js** - Runtime environment
- **TypeScript** - Primary programming language
- **Obsidian API** - Plugin framework and APIs

### Project Type

Obsidian Plugin - A modular creative operating system for Obsidian

## Architecture Overview

ErrlOS uses an **organ-based architecture** where each feature is an independent module ("organ") that can be enabled, disabled, or replaced.

### Core Components

1. **Kernel**: Core orchestrator with module registry and shared APIs
   - Manages organ registration and lifecycle
   - Provides shared APIs to all organs
   - Handles command registration

2. **Organs**: Independent feature modules
   - Each organ is self-contained
   - Can be enabled/disabled individually
   - Register with kernel on initialization
   - Examples: Dashboard, Capture, Project Pulse, Time Machine

3. **Dashboard System**: Three-layer approach for grid layout
   - **CSS Layer**: Base styles with CSS custom properties
   - **Post-Processor**: Applies inline styles on markdown render
   - **MutationObserver + Interval**: Reactive updates for dynamic elements

### System Architecture

```
┌─────────────────────────────────────┐
│         ErrlOS Kernel               │
│  - Module Registry                  │
│  - Shared APIs                      │
│  - Command Manager                  │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                 │
┌──────▼──────┐  ┌──────▼──────┐
│   Organs    │  │   Organs    │
│  (Modules)  │  │  (Modules)  │
└─────────────┘  └─────────────┘
```

### Data Flow

1. **Initialization**: Kernel loads → Organs register → Commands registered
2. **User Interaction**: User action → Command executed → Organ handles → UI updates
3. **Dashboard Rendering**: Markdown parsed → CSS applied → Post-processor runs → Observer watches

## Key Design Decisions

### Organ-Based Architecture
- **Rationale**: Allows modular, independent features
- **Benefit**: Easy to add/remove features without affecting others
- **Trade-off**: Requires careful API design for inter-organ communication

### Three-Layer Dashboard System
- **Rationale**: Obsidian's reading mode can override CSS styles
- **Benefit**: Ensures grid layout works in both reading and editing modes
- **Implementation**: CSS foundation + post-processor + reactive observer

### Performance Optimizations
- Event delegation (single document-level click handler)
- Scoped MutationObserver (dashboard view only)
- Throttled interval checks (1s max)
- Computed style checks before re-applying

## Dependencies

- **Obsidian API**: Core plugin framework
- **TypeScript**: Type safety and modern JavaScript features
- **Node.js**: Runtime environment

## Design Patterns

### Module Pattern
- Each organ is a self-contained module
- Exports registration function
- Imports shared APIs from kernel

### Observer Pattern
- MutationObserver watches for DOM changes
- Interval-based fallback for style persistence
- Event delegation for button clicks

### Registry Pattern
- Kernel maintains registry of all organs
- Commands registered centrally
- Shared APIs available through registry

## Performance Considerations

1. **Scoped Observers**: MutationObserver scoped to dashboard view only
2. **Throttled Updates**: Interval checks limited to 1 second
3. **Conditional Re-application**: Only re-applies styles when needed
4. **Event Delegation**: Single click handler for all buttons

## Security

- No external network requests
- All data stored locally in Obsidian vault
- User-controlled paths and configurations
- No sensitive data collection

## Related Documentation

- [Developer Guide](../DEVELOPER_GUIDE.md) - How to create new organs
- [User Guide](../USER_GUIDE.md) - User-facing documentation
- [Project Structure](project-structure.md) - File organization
