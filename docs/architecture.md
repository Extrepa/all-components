# Architecture Documentation

**Project:** all-components
**Type:** Component Library
**Last Updated:** 2026-01-09

## Technical Architecture

### Technology Stack

Technology stack information to be documented.
### Project Type

Component Library

## Architecture Overview

All Components is a collection of components copied from various projects in the workspace. It serves as a reference library and component catalog.

### Component Organization

Components are organized by source project:
- **errl-club-ui**: 50+ UI components (largest collection)
- **figma-clone-engine**: 41 React/TypeScript components
- **errl_vibecheck**: 11 components
- **errl-forge**: 12 asset remixer components
- **errl-portal**: 5 UI components
- **errl-portal-shared**: Shared components and project components
- **Errl_Components**: 13 components
- **errl_scene_builder**: 24 components

**Total**: 199 component files (tsx, ts, jsx, js) from 9 projects

### Component Categories

**UI Components:**
- Base components (Button, Dropdown, InputField, Modal, Slider)
- UI modules (AssetManagerUI, AudioPlayer, CameraSettingsUI)
- Screen components (FriendsList, MainMenu, ProfileScreen)

**Editor Components:**
- LayersPanel, InspectorPanel, Rulers, AlignmentGuides
- Inspector system with controls, sections, hooks

**Visual Components:**
- BubbleButton, BubbleMesh, ErrlContentLayout
- TrippyScene, shaders, stores

## Key Design Decisions

### Reference Library Approach
- **Rationale**: Centralized component reference
- **Benefit**: Easy browsing and comparison
- **Note**: Components are copies, not shared dependencies

### Project-Based Organization
- **Rationale**: Maintain source project context
- **Benefit**: Easy to trace component origins
- **Structure**: Organized by source project directories

## Dependencies

Components use various dependencies from their source projects:
- React, TypeScript, JavaScript
- Three.js, React Three Fiber
- Various UI libraries and utilities
- Project-specific dependencies

## Related Documentation

- [README](../README.md) - Component catalog details
- [Project Structure](project-structure.md) - File organization

## Design Patterns

Design patterns and architectural patterns used in this project will be documented here.

## Performance Considerations

Performance considerations and optimizations will be documented here.

## Security

Security considerations and implementations will be documented here.
