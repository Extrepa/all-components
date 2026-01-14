# Features Documentation

## Overview

The Universal Component Extractor is a comprehensive tool for reverse-engineering and extracting web components from various sources. This document provides detailed information about all features.

## Core Features

### 1. Multi-File Upload & Management

#### Supported File Types
- **Markup**: HTML, HTM
- **Stylesheets**: CSS, SCSS, SASS
- **Scripts**: JavaScript (JS, MJS, CJS), TypeScript (TS), JSX, TSX, 3JS (Three.js)
- **Data**: JSON

#### File Operations
- **Drag & Drop**: Drop multiple files onto the input area
- **File Selection**: Click the Import button to select files
- **File Tree**: Browse uploaded files in an organized tree structure
- **File Removal**: Remove individual files from the project
- **File Metadata**: View file size, type, and modification date

#### Example Code Library
- **Quick Start**: Pre-built example components to try immediately
- **Simple Card**: Basic HTML/CSS card component
- **React Counter**: Functional React component with state
- **Three.js Cube**: Interactive 3D cube with OrbitControls
- **p5.js Sketch**: Animated creative coding sketch
- **Vanilla JS Animation**: Pure JavaScript animated component
- **One-Click Load**: Click any example button to prefill the input box

#### File Organization
Files are automatically categorized into:
- **Markup Files**: HTML documents
- **Stylesheets**: CSS and SCSS files
- **Scripts**: JavaScript and TypeScript files
- **Data Files**: JSON configuration/data files

### 2. AI-Powered Component Extraction

#### Supported AI Providers
- **Ollama** (Free, Local) - Recommended for privacy and cost
  - Optimized prompt for local models
  - Focus on complete, working code generation
- **Gemini** (Google) - Fast and capable
  - Base prompt optimized for Gemini models
  - Proven effective in AI Studio
- **OpenAI** - GPT-4 and GPT-3.5 models
  - Enhanced instructions for precise XML tag output
  - Optimized for GPT model behavior
- **Anthropic** - Claude models
  - Tailored for Claude's analysis capabilities
  - Emphasis on thorough analysis sections

#### Extraction Process
1. **Analysis**: AI analyzes the input code structure
2. **Framework Detection**: Identifies React, Three.js, Vanilla JS, etc.
3. **Code Cleaning**: Removes build dependencies and clutter
4. **Modernization**: Converts to modern ES6+ syntax
5. **Component Generation**: Creates clean, standalone components

#### AI Prompt System
- **Provider-Specific Optimization**: Each AI provider receives tailored instructions
- **Local Library Integration**: Prompts guide AI to use local library paths
- **Consistent Output Format**: All providers output the same XML-tagged structure
- **Analysis Generation**: Prompts include instructions for comprehensive analysis sections

#### Output Formats
- **HTML**: Semantic markup
- **CSS**: Modern CSS with variables
- **SCSS**: SCSS version with nesting
- **TSX**: React/TypeScript component
- **Vanilla JS**: Browser-compatible JavaScript

### 3. Live Preview System

#### Preview Modes
- **Vanilla JS Preview**: Runs extracted JavaScript directly
- **React Preview**: Compiles and runs TSX components using Babel

#### Preview Features
- **Real-time Updates**: Preview updates as code is extracted
- **Zoom Controls**: Zoom in/out for detailed inspection
- **Full Screen Mode**: Expand preview to full screen
- **Refresh**: Reload preview to test changes
- **Error Display**: Shows runtime errors in preview

#### Console Integration
- **Live Console**: Captures console.log, console.warn, console.error
- **Error Tracking**: Displays JavaScript errors with stack traces
- **System Messages**: Shows preview initialization status

### 4. Code Browser

#### Features
- **Syntax Highlighting**: Color-coded syntax for all languages
- **Line Numbers**: Easy reference for code sections
- **File Navigation**: Switch between uploaded files
- **Search**: Find text within code files
- **Copy & Download**: Quick actions for individual files

#### File Viewing
- **Side-by-Side**: File tree and code viewer layout
- **Active File Highlighting**: Visual indication of selected file
- **File Type Icons**: Visual file type identification

### 5. Analysis & Insights

#### Build Approach
- **Tool Recommendations**: Suggests best build tools (Vite, Webpack, etc.)
- **Dependency Analysis**: Lists required npm packages
- **Configuration Tips**: Build configuration suggestions
- **Deployment Guidance**: Deployment recommendations

#### Code Simplification
- **Removed Dependencies**: Lists what was stripped out
- **Modernization Details**: Explains code improvements
- **Performance Optimizations**: Highlights performance gains
- **Code Size Reduction**: Shows size improvements

#### Active Code Analysis
- **Execution Flow**: Identifies code execution paths
- **Dead Code Detection**: Highlights unused code
- **Import Analysis**: Shows which imports are actually used
- **Function Usage**: Tracks function calls and usage

#### How It Works
- **Architecture Explanation**: Component structure overview
- **Data Flow**: How data moves through the component
- **Lifecycle**: Component initialization and updates
- **Event Handling**: Event flow and callbacks

#### Editable Sections
- **Safe to Edit**: Styling, text, configuration
- **Edit with Caution**: Event handlers, state logic
- **Avoid Editing**: Core framework code, dependencies
- **Customization Points**: Where to make changes

### 6. Export & Download

#### Export Formats
- **Full ZIP**: Complete project with all files
- **Single HTML**: Standalone HTML file with embedded CSS/JS
- **Individual Files**: Download HTML, CSS, SCSS, TSX, JS separately
- **JSON Data**: Export extracted data as JSON
- **3D Scene Export**: Export Three.js scenes as JSON

#### Download Options
- **Component Name**: Customize file names
- **Format Selection**: Choose specific formats
- **Batch Download**: Download multiple formats at once

### 7. Settings & Configuration

#### AI Provider Settings
- **Provider Selection**: Choose AI provider
- **API Key Management**: Secure API key storage
- **Model Selection**: Choose specific AI model
- **Ollama Configuration**: Configure local Ollama URL

#### Settings Persistence
- **Electron Store**: Settings saved locally (desktop app)
- **LocalStorage**: Settings saved in browser (web mode)
- **Auto-load**: Settings loaded on app start

### 8. Console & Error Handling

#### Console Features
- **Strategic Placement**: Console panel positioned on input source side, below Import/Extract/Clear buttons
- **Log Levels**: Info, Warn, Error, System
- **Filtering**: Filter logs by level
- **Stack Traces**: Expandable error stack traces
- **Timestamps**: Time-stamped log entries
- **Copy Logs**: Copy individual log entries
- **Auto-Hide**: Console only displays when there are logs to show

#### Error Handling
- **Runtime Errors**: Captured from preview iframe
- **Compilation Errors**: Babel compilation errors
- **Network Errors**: API request failures
- **User-Friendly Messages**: Clear error descriptions
- **Real-time Sync**: Logs synchronized from preview iframe to main app

### 9. Code Display & Editing

#### Display Features
- **Syntax Highlighting**: Language-aware highlighting
- **Line Numbers**: Reference line numbers
- **Search**: Find text within code
- **Edit Mode**: Toggle between view and edit
- **Code Annotations**: Visual indicators for editable sections

#### Editing Features
- **Live Editing**: Edit code and see changes
- **Undo/Redo**: (Future feature)
- **Auto-format**: (Future feature)
- **Validation**: Real-time syntax checking

### 10. Accessibility

#### ARIA Support
- **ARIA Labels**: Screen reader support
- **Role Attributes**: Semantic HTML roles
- **Tab Navigation**: Keyboard navigation support
- **Focus Management**: Proper focus handling

#### Keyboard Shortcuts
- **Tab Navigation**: Navigate between tabs
- **Enter/Space**: Activate buttons
- **Escape**: Close modals
- **Arrow Keys**: Navigate file tree

## Advanced Features

### Three.js Support
- **Automatic Detection**: Detects Three.js usage
- **Local Library Loading**: Uses local Three.js files from `public/libs/three/`
- **OrbitControls**: Supports OrbitControls addon
- **Scene Export**: Export Three.js scenes as JSON
- **No CDN Dependency**: All Three.js files bundled locally

### p5.js Support
- **Automatic Detection**: Detects p5.js usage in code
- **Local Library Loading**: Uses local p5.js from `public/libs/p5/`
- **Instance Mode Support**: Properly handles p5.js instance mode in preview
- **Creative Coding**: Full support for p5.js sketches and animations
- **No CDN Dependency**: p5.js bundled locally

### Babel Standalone Support
- **Client-Side Compilation**: Compiles TSX/JSX to JavaScript in browser
- **Local Library Loading**: Uses local Babel from `public/libs/babel/`
- **CDN Fallback**: Falls back to CDN if local file missing
- **React Compilation**: Transforms React components for preview
- **Fast Processing**: No external dependencies for compilation

### React/TSX Support
- **Babel Compilation**: Client-side TSX compilation using local Babel
- **Local React Builds**: Uses React/ReactDOM UMD builds from `public/libs/react/`
- **Component Detection**: Auto-detects React components
- **Hooks Support**: Full React hooks support
- **No CDN Dependency**: All React files bundled locally

### Multi-File Projects
- **Intelligent Aggregation**: Combines related files
- **Dependency Detection**: Finds npm package dependencies
- **File Structure**: Generates file structure description
- **Context Preservation**: Maintains file relationships

## Performance Features

### Local Library Optimization
- **No CDN Requests**: All libraries loaded from local files
- **Faster Loading**: Eliminated network latency for library loading
- **Offline Support**: Full functionality without internet connection
- **Consistent Versions**: Locked library versions for stability
- **Reduced Bundle Size**: Libraries served separately, not bundled

### Optimization
- **Debounced Updates**: Prevents excessive re-renders
- **Lazy Loading**: Components loaded on demand
- **Code Splitting**: Optimized bundle sizes
- **Memory Management**: Efficient file handling

### Streaming
- **Real-time Updates**: AI responses stream in real-time
- **Progressive Rendering**: UI updates as code is extracted
- **Chunk Processing**: Processes AI output in chunks

## Security Features

### Data Privacy
- **Local Processing**: Ollama runs completely locally
- **No Data Collection**: No telemetry or tracking
- **Secure Storage**: API keys stored securely
- **Sandboxed Preview**: Preview runs in isolated iframe

### Content Security
- **CSP Headers**: Content Security Policy for preview
- **Sandbox Attributes**: Restricted iframe permissions
- **Input Validation**: Validates user input
- **Error Sanitization**: Sanitizes error messages

## UI/UX Features

### Responsive Design
- **Mobile Support**: Works on mobile devices
- **Tablet Support**: Optimized for tablets
- **Desktop Optimized**: Full-featured desktop experience
- **Adaptive Layouts**: Layouts adapt to screen size

### Visual Design
- **Dark Theme**: Modern dark theme
- **Color Coding**: Syntax highlighting and status colors
- **Icons**: Visual file type and action icons
- **Animations**: Smooth transitions and animations
- **Animated Gradient Title**: Beautiful gradient animation on main title (blue → purple → pink)
- **Improved Header**: Title positioned at top left with settings button on right

### User Experience
- **Drag & Drop**: Intuitive file upload
- **Visual Feedback**: Loading states and progress
- **Error Messages**: Clear, actionable error messages
- **Tooltips**: Helpful tooltips throughout

## Integration Features

### Framework Support
- **React**: Full React component extraction
- **Vue**: (Future feature)
- **Svelte**: (Future feature)
- **Vanilla JS**: Pure JavaScript support
- **Three.js**: 3D graphics support
- **p5.js**: Creative coding support

### Build Tool Integration
- **Vite**: Recommended for modern projects
- **Webpack**: Traditional bundler support
- **Parcel**: Zero-config support
- **Rollup**: Library bundling support

---

For detailed usage instructions, see [INSTRUCTIONS.md](./INSTRUCTIONS.md)  
For technical architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md)  
For workflow guides, see [WORKFLOW_USER.md](./WORKFLOW_USER.md)  
For complete documentation index, see [docs/README.md](./docs/README.md)

