# Architecture Documentation

## Project Structure

```
universal-component-extractor/
├── electron/              # Electron main process
│   ├── main.ts           # Main process entry point
│   ├── preload.ts        # Preload script for IPC
│   └── tsconfig.json     # TypeScript config for Electron
├── components/           # React components
│   ├── AnalysisTab.tsx   # Analysis display component
│   ├── CodeAnalysisPanel.tsx # Code analysis results panel
│   ├── CodeAnnotations.tsx # Code annotation display
│   ├── CodeBrowser.tsx   # File browser component
│   ├── CodeDisplay.tsx   # Code display/editor
│   ├── ConsolePanel.tsx  # Console log display
│   ├── FileTree.tsx      # File tree navigation
│   ├── icons.tsx         # Icon components
│   ├── PreviewDisplay.tsx # Preview iframe component
│   └── SettingsModal.tsx # Settings dialog
├── services/             # Business logic
│   └── aiService.ts      # AI provider abstraction (multi-provider)
├── utils/                # Utility functions
│   ├── codeAnalyzer.ts   # Code analysis and identification
│   ├── codeWrapper.ts    # Code wrapping utilities
│   ├── contentAggregator.ts # Multi-file aggregation
│   └── fileTypeDetector.ts  # File type detection
├── types/                # TypeScript definitions
│   └── electron.d.ts     # Electron API types
├── scripts/              # Build scripts
│   ├── copy-three.js     # Copy Three.js libraries
│   └── rename-electron.js # Rename .js to .cjs
├── public/               # Static assets
│   └── libs/             # Local libraries (Three.js)
├── App.tsx               # Main application component
├── index.tsx             # React entry point
├── types.ts              # Shared type definitions
└── vite.config.ts        # Vite configuration
```

## Technology Stack

### Frontend
- **React 19**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling (via className)
- **react-syntax-highlighter**: Code syntax highlighting
- **Prism.js**: Syntax highlighting engine

### Desktop
- **Electron 30**: Desktop app framework
- **electron-store**: Settings persistence
- **electron-builder**: App packaging

### AI Integration
- **@google/genai**: Gemini API
- **openai**: OpenAI API
- **@anthropic-ai/sdk**: Anthropic API
- **Ollama**: Local AI (via HTTP)

### Utilities
- **jszip**: ZIP file creation
- **three**: Three.js library (local)

## Component Architecture

### App.tsx (Main Component)

**Responsibilities:**
- Application state management
- File upload handling
- AI extraction orchestration
- Tab navigation
- Settings management

**State:**
- `uploadedFiles`: Array of uploaded files
- `extractedCode`: Extracted component data
- `activeFileId`: Currently selected file
- `mainTab`: Active main tab (preview, codebrowser, etc.)
- `activeTab`: Active code tab (HTML, CSS, etc.)
- `aiSettings`: AI provider configuration

**Key Functions:**
- `handlePreviewClick`: Analyzes code and shows analysis panel
- `handlePreviewAsIs`: Previews code without wrapping
- `handleWrapAndPreview`: Wraps code then previews
- `handleProcessClick`: Triggers AI extraction
- `processFiles`: Handles file uploads
- `handleDownloadZip`: Creates ZIP export
- `handleCodeUpdate`: Updates extracted code
- `parseCodeForPreview`: Parses code into ExtractedCode structure

### CodeAnalysisPanel Component

**Responsibilities:**
- Display code analysis results
- Show code type, completeness, errors
- Explain wrapping needs
- Provide action buttons (Preview As-Is, Wrap & Preview, Extract)

**Features:**
- Code type detection display
- Completeness status (complete/fragment/snippet)
- Error and warning display
- Wrapping recommendations
- Dependency detection
- Action buttons based on analysis

### PreviewDisplay Component

**Responsibilities:**
- Live preview rendering
- Iframe management
- Console log capture
- Babel compilation (for React)
- Three.js integration

**Features:**
- **Browser Mode**: HTML-only, no JS execution
- **Vanilla Mode**: HTML + CSS + JS with light theme, centered layout
- **Canvas Mode**: Same as vanilla but optimized for full-screen canvas (dark theme, full viewport)
- **React Mode**: TSX compilation with Babel
- Error capture and display
- Zoom and fullscreen controls
- Console integration

**Preview Mode Differences:**
- `browser`: HTML-only preview, no JavaScript execution
- `vanilla`: Full HTML/CSS/JS with light theme, centered layout, padding
- `canvas`: Full HTML/CSS/JS with dark theme, full viewport, no padding (optimized for Three.js/p5.js)
- `react`: React/TSX compilation and rendering

**Technical Details:**
- Uses blob URLs for iframe content (supports ES modules)
- Injects console capture script
- Compiles TSX with Babel Standalone
- Handles Three.js and OrbitControls loading asynchronously
- Waits for library dependencies before executing user code

### CodeBrowser Component

**Responsibilities:**
- File navigation
- Code display with syntax highlighting
- File operations (copy, download)
- Search functionality

**Features:**
- File tree integration
- Syntax highlighting
- Line numbers
- Search within code
- File metadata display

### AnalysisTab Component

**Responsibilities:**
- Display AI-generated analysis
- Tabbed sections for different analysis types
- Markdown rendering
- User guidance

**Sections:**
- Build Approach
- Code Simplification
- Active Code Analysis
- How It Works
- Editable Sections

### ConsolePanel Component

**Responsibilities:**
- Log display and filtering
- Error stack trace display
- Console management
- Log operations (copy, clear)

**Features:**
- Collapsible panel
- Log level filtering
- Expandable stack traces
- Auto-scroll
- Timestamp display

### FileTree Component

**Responsibilities:**
- File hierarchy display
- File selection
- File removal
- Category organization

**Features:**
- Expandable categories
- File type icons
- Active file highlighting
- Remove file action

## Service Layer

### aiService.ts

**Purpose:** Abstract AI provider interface

**Functions:**
- `extractComponentFromHtml`: Main extraction function
- `extractWithGemini`: Gemini extraction
- `extractWithOpenAI`: OpenAI extraction
- `extractWithAnthropic`: Anthropic extraction
- `extractWithOllama`: Ollama extraction
- `processStream`: Stream processing helper

**Stream Processing:**
- Parses XML-like tags from AI output
- Updates UI progressively
- Handles errors gracefully
- Extracts: HTML, CSS, SCSS, TSX, JS, Explanation, Analysis

### Legacy Code Removed

**Note:** `geminiService.ts` was removed as it was unused legacy code. All AI providers are now handled through the unified `aiService.ts`.

## Utility Functions

### fileTypeDetector.ts

**Purpose:** File type detection and categorization

**Functions:**
- `detectFileType`: Detect from filename
- `getFileTypeInfo`: Get detailed file info
- `isSupportedFileType`: Check support
- `getSyntaxLanguage`: Get syntax highlighter language
- `groupFilesByCategory`: Organize files

**File Types:**
- HTML, CSS, SCSS, TS, TSX, JS, JSX, JSON, 3JS

### codeAnalyzer.ts

**Purpose:** Analyze pasted code to identify type, completeness, errors, and wrapping needs

**Functions:**
- `analyzeCode`: Main analysis function
- `detectCodeType`: Identify code type (HTML, React, Three.js, p5.js, etc.)
- `checkCompleteness`: Determine if code is complete, fragment, or snippet
- `detectErrors`: Find syntax errors and missing dependencies
- `analyzeWrappingNeeds`: Determine if wrapping is needed and why
- `suggestPreviewMode`: Recommend appropriate preview mode
- `generateRecommendations`: Provide actionable recommendations
- `detectDependencies`: Find required libraries

**Analysis Results:**
- Code type (HTML, React, Three.js, p5.js, vanilla, CSS, JSON, mixed, unknown)
- Completeness status (complete, fragment, snippet, unknown)
- Errors and warnings with severity
- Wrapping needs with explanation
- Suggested preview mode
- Detected dependencies
- Actionable recommendations

### codeWrapper.ts

**Purpose:** Wrap code fragments in HTML structure (user-initiated only)

**Functions:**
- `isThreeJsCode`: Detect Three.js code
- `isP5JsCode`: Detect p5.js code
- `wrapThreeJsCode`: Wrap Three.js code in HTML
- `wrapP5JsCode`: Wrap p5.js code in HTML
- `analyzeWrappingNeeds`: Explain why wrapping might be needed
- `wrapCode`: Wrap code based on type (explicit user action)

**Wrapping Strategy:**
- Three.js: Adds HTML structure, container div, Three.js library, OrbitControls if needed
- p5.js: Adds HTML structure, p5.js library (setup/draw functions work in global mode)
- Vanilla JS: Adds basic HTML page with container for DOM manipulation

**Important:** Wrapping is never automatic - users must explicitly choose to wrap code.

### contentAggregator.ts

**Purpose:** Combine multiple files for AI extraction

**Functions:**
- `aggregateFiles`: Combine files intelligently
- `detectDependencies`: Find npm dependencies
- `generateFileStructure`: Create structure description
- `createCombinedInput`: Format for AI

**Features:**
- Groups by category
- Sorts scripts by dependencies
- Detects npm packages
- Generates file structure

## Data Flow

### Code Analysis and Preview Flow

1. **User Input**
   - User pastes code into `htmlInput` state
   - Or uploads files (stored in `uploadedFiles` state)

2. **Code Analysis** (when user clicks Preview)
   - `handlePreviewClick()` triggers `analyzeCode()`
   - Code analyzed for type, completeness, errors, wrapping needs
   - `CodeAnalysisPanel` displays results

3. **User Decision**
   - User chooses action based on analysis:
     - **Preview As-Is**: Code previewed without modifications
     - **Wrap & Preview**: Code wrapped in HTML structure, then previewed
     - **Extract**: AI extraction triggered

4. **Preview Execution**
   - `parseCodeForPreview()` parses code into ExtractedCode structure
   - Preview mode set based on code type
   - `PreviewDisplay` renders in iframe with blob URL
   - Libraries loaded asynchronously (Three.js, p5.js, React)
   - Code executes after dependencies ready

5. **Display**
   - Preview shown in iframe
   - Console logs captured
   - Errors displayed if any

### Extraction Flow

1. **User Input**
   - Paste code or upload files
   - Files stored in `uploadedFiles` state

2. **Content Aggregation**
   - Files combined via `contentAggregator`
   - Dependencies detected
   - Structure generated

3. **AI Extraction**
   - Content sent to AI provider
   - Stream processing begins
   - Tags extracted progressively

4. **State Updates**
   - `extractedCode` updated in real-time
   - UI updates as code streams in
   - Preview updates automatically

5. **Display**
   - Code shown in tabs
   - Preview rendered
   - Analysis displayed

### Preview Modes

**Browser Mode:**
- HTML-only rendering
- No JavaScript execution
- Best for: Static HTML/CSS preview

**Vanilla Mode:**
- HTML + CSS + JavaScript
- Light theme, centered layout
- Best for: Traditional web components, UI elements

**Canvas Mode:**
- HTML + CSS + JavaScript
- Dark theme, full viewport layout
- Best for: Three.js, p5.js, WebGL, full-screen canvas applications
- Same rendering pipeline as vanilla, different styling

**React Mode:**
- TSX compilation with Babel
- React/ReactDOM loaded
- Best for: React components

## IPC Communication (Electron)

### Main Process (electron/main.ts)

**Responsibilities:**
- Window management
- Settings persistence
- IPC handlers

**IPC Handlers:**
- `get-settings`: Retrieve saved settings
- `save-settings`: Save settings

### Preload Script (electron/preload.ts)

**Purpose:** Secure bridge between renderer and main

**Exposes:**
- `window.electronAPI.getSettings()`
- `window.electronAPI.saveSettings(settings)`

## Library Management

### Strategy

**Local Storage:**
- All libraries stored in `public/libs/` directory
- Copied from `node_modules` during build
- Ensures offline support

**Libraries Included:**
- Three.js (three.min.js, three.module.js, OrbitControls.js)
- p5.js (p5.min.js)
- Babel Standalone (babel.min.js)
- React/ReactDOM (react.development.js, react-dom.development.js)

**Loading Strategy:**
- UMD builds for global access (Three.js, React)
- ES modules for modern imports (three.module.js)
- Local files preferred, CDN fallback for React UMD
- Version locked in package.json for reproducibility

**Benefits:**
- Offline support
- Faster loading (no CDN latency)
- Version control
- No external dependencies

## Build Process

### Development

1. **Copy Libraries**
   - Run `npm run copy-libs` or it runs automatically during build
   - Libraries copied from `node_modules` to `public/libs`
   - React UMD builds downloaded if not in node_modules

2. **TypeScript Compilation**
   - Electron code compiled to CommonJS
   - Files renamed to `.cjs`

3. **Vite Build**
   - React app bundled
   - Assets optimized

4. **Electron Launch**
   - Main process starts
   - Renderer loads from Vite dev server

### Production

1. **Build Steps**
   - Copy libraries
   - Compile TypeScript
   - Bundle with Vite
   - Package with electron-builder

2. **Output**
   - `.dmg` file for Mac
   - Includes all dependencies
   - Three.js libraries included

## Type System

### Core Types

```typescript
interface ExtractedCode {
  html: string;
  css: string;
  scss: string;
  tsx: string;
  vanillaJs: string;
  explanation: string;
  componentName?: string;
  framework?: string;
  buildApproach?: string;
  codeSimplification?: string;
  activeCode?: string;
  howItWorks?: string;
  editableSections?: string;
  originalFiles?: UploadedFile[];
}

interface UploadedFile {
  id: string;
  name: string;
  type: FileType;
  content: string;
  lastModified: number;
  size: number;
}

type FileType = 'html' | 'css' | 'scss' | 'ts' | 'tsx' | 'js' | 'jsx' | 'json' | '3js' | 'unknown';
```

## Security Considerations

### Content Security Policy
- Preview iframe uses sandbox attributes
- Restricted permissions
- No external script execution (except CDNs)

### API Keys
- Stored securely (electron-store or localStorage)
- Never exposed in code
- Encrypted in storage

### Preview Isolation
- Runs in isolated iframe
- Sandboxed environment
- No access to main window

## Performance Optimizations

### Code Splitting
- Components loaded on demand
- Large libraries lazy-loaded
- Bundle size optimization

### Debouncing
- Input debouncing (500ms)
- Preview updates debounced
- Reduces re-renders

### Memory Management
- Files stored efficiently
- Large files handled carefully
- Cleanup on unmount

## Future Enhancements

### Planned Features
- Code diff view
- Project templates
- Framework-specific exports
- Component library integration
- Version control integration

### Technical Improvements
- Web Workers for heavy processing
- IndexedDB for file storage
- Service Worker for offline support
- Better error recovery

---

For user instructions, see [INSTRUCTIONS.md](./INSTRUCTIONS.md)  
For feature details, see [FEATURES.md](./FEATURES.md)  
For getting started, see [docs/getting-started.md](./docs/getting-started.md)  
For complete documentation index, see [docs/README.md](./docs/README.md)

