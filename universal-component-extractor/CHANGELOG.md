# Changelog

All notable changes to the Universal Component Extractor will be documented in this file.

## [2.0.6] - 2024

### Changed
- **PreviewDisplay Component**
  - Simplified library inlining logic for better maintainability
  - Improved variable naming for clarity (`safeCompleteHtml` instead of `completeHtml`)
  - Removed unnecessary debug code and effects
  - Streamlined library caching and fetching logic
  - Better code organization and comments

- **OutputPane Component**
  - Removed unnecessary z-index classes for cleaner styling
  - Added animation classes for smoother UI transitions
  - Improved component structure and layout

- **Build Scripts**
  - Cleaned up `copy-libs.js`: removed unused code
  - Improved code organization and maintainability

- **Content Security Policy**
  - Minor CSP update in `index.html` for better security

### Fixed
- **Library Inlining Bug**: Fixed missing script tag escaping when fetching libraries for the first time (now consistent with cached library handling)
  - Prevents premature script tag closure when inlining library code
  - Ensures all library code is properly escaped before insertion

### Technical Improvements
- Code quality: removed debug logging and unnecessary effects
- Better error handling in library loading
- Improved code organization and maintainability
- Cleaner component styling and structure

## [2.0.5] - 2024

### Added
- **Framework-Specific Export Presets**
  - Vite React preset: exports component to `src/components/` with TSX, CSS, and usage examples
  - Next.js preset: exports component to `components/` with TSX, CSS Modules, and page examples
  - New export buttons in OutputPane for framework-specific bundles
  - Usage examples included in exported README files

- **Extraction History & Improved Diffs**
  - Extraction history: tracks last 5 extractions within a session
  - History navigation: select previous extractions to view their diffs and analysis
  - Improved diff view: line-aware diff generation using unified diff algorithm
  - Per-file diff selection: choose specific files from multi-file projects to compare
  - Better diff labels: clear indication of original vs extracted content

- **Interaction Modes**
  - Three interaction modes for AI extraction:
    - **Extract** (default): Full extraction and refactor for reuse
    - **Explain**: Emphasize explanation and analysis with lighter transformations
    - **Review**: Structured code review with risks, improvements, and suggestions
  - Mode selection in Settings modal with clear descriptions
  - All AI providers support interaction modes

- **Enhanced AI Model Selection**
  - Model-specific guidance: prompts adapt based on selected model capabilities
  - Updated model lists: added newer models (GPT-5.1, GPT-5 Mini, Claude 4 Opus/Sonnet, Gemini 3 Pro, etc.)
  - Visual indicator: InputPane shows current provider/model/mode in compact pill
  - Human-readable model labels: cleaner display names (e.g., "GPT-5.1" instead of "gpt-5.1")
  - Model-specific prompt guidance for optimal output quality

- **New Utilities**
  - `utils/diffUtils.ts`: Unified diff generation utility for better code comparison
  - Enhanced `utils/exportHelpers.ts`: Framework-specific export builders

### Changed
- **Diff View**
  - Replaced simple add/remove diff with line-aware unified diff
  - Better matching of original and transformed code
  - Improved error handling for diff generation

- **Export System**
  - Extended export helpers with framework-aware file mapping
  - Export presets now include framework-specific folder structures
  - README files include usage examples for each framework

- **AI Service**
  - All providers now support interaction modes (Extract, Explain, Review)
  - Model-specific guidance added to prompts for better output
  - Enhanced model selection with updated model lists

- **Documentation**
  - Updated README.md with current model lists
  - Updated getting-started.md with newer model examples
  - Updated testing.md with new model test cases

### Fixed
- Improved diff generation reliability
- Better handling of missing original source in multi-file projects
- Enhanced error messages for export operations

## [2.0.4] - 2024

### Added
- **Keyboard Shortcuts System**
  - Comprehensive keyboard shortcut support
  - `Ctrl/Cmd + E` - Extract component
  - `Ctrl/Cmd + K` - Clear input
  - `Ctrl/Cmd + ,` - Open settings
  - `Shift + ?` - Show keyboard shortcuts
  - `Ctrl/Cmd + I` - Import files
  - `Ctrl/Cmd + Shift + Z` - Export as ZIP
  - `Ctrl/Cmd + Shift + H` - Export as HTML
  - Keyboard shortcuts help modal
  - Platform-aware shortcuts (Mac/Windows)

- **Welcome Modal**
  - First-time user onboarding
  - App capabilities overview
  - Quick start guide
  - Keyboard shortcuts introduction
  - "Don't show again" option
  - Help button in header

- **Error Handling Improvements**
  - Centralized error formatting utility
  - Retry mechanism with exponential backoff
  - User-friendly error messages
  - Retryable error detection
  - Better error context

- **Performance Utilities**
  - Debounce and throttle functions
  - Performance measurement utilities
  - Lazy loading helpers
  - Code splitting utilities
  - Performance budget checking

- **Testing Infrastructure**
  - Vitest test framework setup
  - 63 comprehensive tests (all passing)
  - Unit tests for utilities
  - Service tests with mocks
  - Integration tests for workflows
  - Test coverage reporting

- **Documentation**
  - [docs/testing.md](./docs/testing.md) - Comprehensive testing guide
  - `WORKFLOW_USER.md` - User workflow documentation
  - `WORKFLOW_DEVELOPER.md` - Developer workflow guide
  - [docs/future-considerations.md](./docs/future-considerations.md) - Future roadmap
  - Setup verification guide (now in [docs/project-status.md](./docs/project-status.md))

### Changed
- **Error Handling**
  - Improved error messages across all AI providers
  - Centralized error formatting
  - Better retry logic for network errors

- **User Experience**
  - Welcome modal on first load
  - Keyboard shortcuts for power users
  - Help button in header
  - Improved onboarding flow

### Fixed
- Fixed localStorage check for welcome modal
- Improved error handling in Ollama provider
- Better error messages for all failure scenarios

## [2.0.3] - 2024

### Added
- **Local Library Installation**: All required libraries now installed locally
  - p5.js (1.9.0) installed via npm and copied to `public/libs/p5/`
  - @babel/standalone (7.23.10) installed via npm and copied to `public/libs/babel/`
  - React & ReactDOM (18.2.0 UMD) downloaded and copied to `public/libs/react/`
- **Unified Copy Script**: New `scripts/copy-libs.js` to manage all library copying
  - Replaces `copy-three.js` with comprehensive library management
  - Handles Three.js, p5.js, Babel, React, and ReactDOM
  - Downloads React/ReactDOM UMD builds automatically if needed

### Changed
- **Preview Library Loading**: All libraries now load from local paths instead of CDNs
  - p5.js: `/libs/p5/p5.min.js` (was CDN)
  - Babel: `/libs/babel/babel.min.js` (was CDN, with fallback)
  - React: `/libs/react/react.development.js` (was CDN)
  - ReactDOM: `/libs/react/react-dom.development.js` (was CDN)
  - Three.js: Already local, maintained
- **Build Scripts**: Updated to use `copy-libs.js` instead of `copy-three.js`
  - `build:electron` now calls `copy-libs.js`
  - `electron:dev` now calls `copy-libs.js`
  - `copy-libs` npm script updated

### Performance
- **Faster Loading**: Eliminated external CDN requests for faster preview initialization
- **Offline Support**: Full functionality without internet connection
- **Reliability**: No dependency on CDN availability
- **Consistency**: Locked library versions ensure consistent behavior

### Dependencies
- Added `p5@^1.9.0` as dependency
- Added `@babel/standalone@^7.23.10` as dependency

## [2.0.2] - 2024

### Added
- **Example Code Buttons**: Quick-start example components to help users try the extraction process
  - Simple Card (HTML/CSS)
  - React Counter (React)
  - Three.js Cube (Three.js)
  - p5.js Sketch (p5.js)
  - Vanilla JS Animation (Vanilla JS)
- **Example Code Utility**: New `utils/exampleCode.ts` file with example code definitions

### Changed
- **Console Panel Location**: Moved console panel to input source side, below Import/Extract/Clear buttons
- **Title Design**: Moved "Universal Component Extractor" title to top left with animated gradient
  - Gradient: blue → purple → pink
  - Smooth animation with CSS keyframes
  - Improved header layout
- **Header Layout**: Restructured header for better space utilization

### Fixed
- Fixed duplicate console panel appearing twice in App.tsx
- Fixed missing `previewLogs` state initialization
- Ensured proper log synchronization between PreviewDisplay and App components

## [2.0.1] - 2024

### Changed
- **AI Prompt System**
  - Implemented provider-specific prompts for each AI model
  - Updated all prompts to use local library paths instead of CDNs
  - Simplified prompt structure to match effective Gemini AI Studio style
  - Added provider-specific guidance for OpenAI, Anthropic, and Ollama models
  - Fixed Anthropic and Ollama prompt function calls

- **UI Structure**
  - Separated Preview tab from Extracted Code tab
  - Removed duplicate download buttons and code tabs from Preview tab
  - Reorganized tab content for better organization

### Fixed
- Anthropic provider now uses correct prompt function
- Ollama provider now uses correct prompt function
- All providers consistently use local library paths
- **UI Duplicate Sections**: Removed duplicate download buttons and code tabs that were appearing in both Preview and Extracted Code tabs
- **Code Display**: Extracted code now correctly displays only in the Extracted Code tab
- **Tab Navigation**: Fixed tab content rendering - each tab now shows only its intended content
- **React Import Error**: Fixed React useState error in SettingsModal by ensuring proper React import
- **Content Security Policy**: Added proper CSP to resolve Electron security warnings
- **Babel CDN Loading**: Fixed CSP to allow `cdnjs.cloudflare.com` for Babel Standalone, React, ReactDOM, and p5.js CDN resources

## [2.0.0] - 2024

### Added
- **Multi-File Upload Support**
  - Upload multiple files simultaneously
  - Drag and drop multiple files
  - File type detection and categorization
  - File tree browser with organized categories

- **Code Browser**
  - Syntax highlighting for all supported languages
  - Line numbers for code navigation
  - File navigation with sidebar
  - Search functionality within files
  - Copy and download individual files

- **Analysis Tab**
  - Build approach recommendations
  - Code simplification details
  - Active code analysis
  - How it works explanations
  - Editable sections guidance

- **Enhanced Console Panel**
  - Collapsible console with expand/collapse
  - Log filtering by level (All, Info, Warn, Error, System)
  - Stack trace display with expandable details
  - Copy logs functionality
  - Enhanced error capture from preview iframe

- **Improved Code Display**
  - Syntax highlighting with proper language detection
  - Edit/View toggle for code editing
  - Line numbers for better navigation
  - Search within code
  - Code annotations showing editable sections

- **Tab-Based Navigation**
  - Preview tab with live preview and console
  - Code Browser tab for uploaded files
  - Extracted Code tab for viewing/editing
  - Analysis tab for detailed insights

- **Accessibility Features**
  - ARIA labels for screen readers
  - Keyboard navigation support
  - Focus management
  - Semantic HTML structure

- **Responsive Design**
  - Mobile-friendly layouts
  - Adaptive grid systems
  - Responsive typography
  - Touch-friendly controls

### Changed
- **File Organization**
  - New `utils/` directory for utility functions
  - Reorganized component structure
  - Better separation of concerns

- **AI Service**
  - Extended prompts to generate analysis data
  - New output tags for analysis sections
  - Improved error handling

- **Type System**
  - Extended `ExtractedCode` interface
  - New `UploadedFile` interface
  - Enhanced `FileType` type system

### Fixed
- Console error capture with stack traces
- Error handling in preview iframe
- File type detection edge cases
- Three.js/OrbitControls loading logic
- Tag extraction regex patterns

### Dependencies
- Added `react-syntax-highlighter@^16.1.0`
- Added `@types/react-syntax-highlighter@^15.5.13`
- Added `prismjs@^1.30.0`
- Added `react-diff-view@^3.3.2` (for future use)

## [1.0.0] - Initial Release

### Added
- **Core Features**
  - Component extraction from HTML, JSX, TSX, Three.js
  - Support for multiple AI providers (Gemini, OpenAI, Anthropic, Ollama)
  - Live preview with Vanilla JS and React modes
  - Export to multiple formats (HTML, CSS, SCSS, TSX, JS, ZIP)
  - Settings persistence

- **AI Providers**
  - Gemini API integration
  - OpenAI API integration
  - Anthropic API integration
  - Ollama local AI support

- **Preview System**
  - Real-time preview updates
  - Babel compilation for React/TSX
  - Three.js support with OrbitControls
  - Console log capture
  - Error display

- **Export Features**
  - Individual file downloads
  - Complete ZIP package
  - Standalone HTML export
  - JSON data export
  - Three.js scene export

- **Desktop App**
  - Electron-based Mac application
  - Native window management
  - Settings storage with electron-store
  - DMG installer

---

## Version History

- **2.0.6**: Code quality improvements - library inlining cleanup and bug fix, styling improvements, build script cleanup
- **2.0.5**: Phase 3 features - framework presets, extraction history, interaction modes, enhanced AI model selection
- **2.0.4**: Keyboard shortcuts, welcome modal, error handling improvements, testing infrastructure
- **2.0.3**: Local library installation for offline support
- **2.0.2**: Example code buttons, UI enhancements
- **2.0.1**: AI prompt system improvements, UI structure fixes
- **2.0.0**: Major update with multi-file support, enhanced UI, and analysis features
- **1.0.0**: Initial release with core extraction features

---

For detailed update notes and version history, see [docs/project-status.md](./docs/project-status.md)  
For complete documentation index, see [docs/README.md](./docs/README.md)

