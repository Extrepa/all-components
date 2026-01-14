# Architecture Documentation

**Project:** errl_scene_builder
**Type:** Web App
**Last Updated:** 2026-01-10

## Technical Architecture

### Technology Stack

- **React**
- **Vite**
- **TailwindCSS**
- **Zustand**
### Project Type

Web App

## Architecture Overview

errl_scene_builder is a web-based scene synthesis application built with React and Vite. The application allows users to create, edit, and manage visual scenes using a component-based architecture.

### System Architecture

The application follows a component-based architecture with:
- **React Components** - UI components for scene editing
- **Zustand State Management** - Global state management for scenes and UI state
- **Vite Build System** - Fast development and optimized production builds
- **TailwindCSS** - Utility-first CSS framework for styling

### Component Structure

- **Scene Editor** - Main editing interface
- **Component Tree** - Hierarchical component organization
- **Asset Management** - Asset registry and management
- **Template System** - Pre-built scene templates
- **FX and Behaviors** - Effects and interactive behaviors

### Data Flow

1. **Scene Creation**: User creates new scene → Scene schema initialized
2. **Component Addition**: User adds components → Component tree updated → State synchronized
3. **Asset Management**: Assets loaded → Registry updated → Available for use
4. **Template Application**: Template selected → Scene populated → Components instantiated

### Key Design Decisions

- **Component-Based**: Modular components for reusability
- **State Management**: Zustand for lightweight, performant state
- **TailwindCSS**: Utility-first styling for rapid development
- **Specification-Driven**: 12 detailed specification documents guide implementation

## Dependencies
- `@tailwindcss/vite`
- `html-to-image`
- `lucide-react`
- `react`
- `react-dom`
- `react-router-dom`
- `zustand`

## Design Patterns

Design patterns and architectural patterns used in this project will be documented here.

## Performance Considerations

Performance considerations and optimizations will be documented here.

## Security

Security considerations and implementations will be documented here.
