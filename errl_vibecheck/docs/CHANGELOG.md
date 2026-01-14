# Changelog

All notable changes to VibeCheck will be documented in this file.

## [Unreleased]

### Added (Latest)
- **Sorting Functionality**
  - Sort by newest/oldest (creation date)
  - Sort by prompt (A-Z, Z-A)
  - Sort by output mode
  - Sort by generation speed (fastest/slowest)
  - Sort dropdown in header
  - Real-time sorting with filters

- **Keyboard Shortcuts**
  - Escape key to exit fullscreen/screensaver
  - Ctrl/Cmd + K to focus search
  - Ctrl/Cmd + F to focus search (alternative)
  - Smart detection (doesn't trigger in input fields)
  - Global keyboard handler

- **Enhanced Testing**
  - Export functionality tests (10 tests)
  - Sort functionality tests (8 tests)
  - Total test coverage: 30 tests, all passing

### Added
- **Export Functionality**
  - Export individual outputs as code files (JS, HTML, SVG, GLSL)
  - Export rounds as JSON files
  - Copy code to clipboard with visual feedback
  - Download functionality for all output types

- **Search & Filter**
  - Search prompts and code content
  - Filter by output mode (P5.js, SVG, HTML, etc.)
  - Filter by AI model (Flash, Pro, etc.)
  - Real-time filtering with search query
  - Filter UI in header component

- **Documentation**
  - Comprehensive documentation in `/docs` folder
  - Development guide with contribution guidelines
  - Troubleshooting guide for common issues
  - API reference documentation
  - Architecture and implementation details
  - Usage guide for end users

- **Code Quality**
  - JSDoc comments for all key functions
  - Type-safe utility functions
  - Improved type definitions
  - Better error handling

- **Testing Framework**
  - Vitest configuration
  - Test setup with mocks
  - Unit tests for utilities and filters
  - Test scripts in package.json

### Changed
- **ModelOutput Component**
  - Updated export functionality to use new export utilities
  - Added copy to clipboard button
  - Added download code button
  - Improved export JSON functionality

- **Header Component**
  - Added search input field
  - Added filter dropdown (mode/model)
  - Integrated with new filter system

- **App Component**
  - Integrated filtering logic
  - Real-time feed filtering
  - Empty state for no results

- **State Management**
  - Added `searchQuery` to AppState
  - Added `filterMode` and `filterValue` to AppState
  - New actions: `setSearchQuery`, `setFilter`

### Technical
- New utility module: `src/lib/export.ts`
- New utility module: `src/lib/filter.ts`
- Enhanced type definitions in `src/lib/types.ts`
- Updated store with new state properties

## [0.0.0] - Initial Release

### Features
- Multi-mode code generation (P5.js, SVG, HTML, GLSL, 3D Wireframes, 3D Voxels, Images)
- AI model comparison (Flash, Pro, etc.)
- Batch generation mode
- Versus mode for model comparison
- Fullscreen mode
- Screensaver mode
- Collections system
- Favorites system
- Audio feedback
- Preset prompts
- URL-based sharing

