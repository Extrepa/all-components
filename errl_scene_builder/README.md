# Errl Scene Builder

⚠️ **DEPRECATED** - This project is deprecated in favor of [multi-tool-app](../multi-tool-app/) Scene Maker mode. See [DEPRECATION.md](DEPRECATION.md) for migration guidance.

A web application for building and synthesizing visual scenes with comprehensive UI components and specifications.

## Overview

Errl Scene Builder is a React-based web application for creating and managing visual scenes. It includes a comprehensive specification system for UI components, assets, backgrounds, and behaviors.

## Features

- Scene synthesis and building
- Comprehensive UI component system
- Asset and background management
- Effects and behaviors system
- Template system
- Errl Assist UI integration

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

See [INDEX.md](INDEX.md) for detailed project structure.

Key directories:
- `src/` - Application source code
- `public/` - Public assets
- `docs/current/specs/` - Specification documents
- `templates/` - Scene templates
- `svgs/` - SVG assets

## Documentation

- [INDEX.md](INDEX.md) - Workspace index
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - Current status
- [Documentation Index](docs/index.md) - Detailed docs
- [Specifications](docs/current/specs/README.md) - All specification documents

## Specifications

Comprehensive specifications are available in `docs/current/specs/` (12 specification files):

### UI/Components Specifications
- [UI and Components](docs/current/specs/ERRL_SCENE_SYNTH_UI_AND_COMPONENTS.md) - UI and components specification
- [UI Architecture](docs/current/specs/ERRL_SCENE_SYNTH_UI_ARCHITECTURE.md) - UI architecture specification
- [UI Design Kit](docs/current/specs/ERRL_SCENE_SYNTH_UI_DESIGN_KIT.md) - UI design kit specification
- [Errl Assist UI](docs/current/specs/ERRL_SCENE_SYNTH_ERRL_ASSIST_UI.md) - Errl Assist UI specification
- [Component Tree](docs/current/specs/ERRL_SCENE_SYNTH_COMPONENT_TREE.md) - Component tree specification

### Architecture Specifications
- [Scene Schema](docs/current/specs/ERRL_SCENE_SYNTH_SCENE_SCHEMA.md) - Scene schema specification
- [Tailwind Map](docs/current/specs/ERRL_SCENE_SYNTH_TAILWIND_MAP.md) - Tailwind CSS mapping specification

### Asset/Background Specifications
- [Asset Spec](docs/current/specs/ERRL_SCENE_SYNTH_ASSET_SPEC.md) - Asset specification
- [Backgrounds](docs/current/specs/ERRL_SCENE_SYNTH_BACKGROUNDS.md) - Backgrounds specification

### Behavior/Template Specifications
- [FX and Behaviors](docs/current/specs/ERRL_SCENE_SYNTH_FX_AND_BEHAVIORS.md) - Effects and behaviors specification
- [Templates](docs/current/specs/ERRL_SCENE_SYNTH_TEMPLATES.md) - Templates specification

## Dependencies

- React
- Vite
- TailwindCSS
- Zustand
- React Router DOM
- html-to-image
- lucide-react

## Development

```bash
# Development
npm run dev

# Build
npm run build

# Preview
npm run preview
```

## License

See project files for license information.
