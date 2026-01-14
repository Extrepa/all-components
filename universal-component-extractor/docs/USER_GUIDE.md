# User Guide - Universal Component Extractor

This comprehensive guide covers everything you need to know about using the Universal Component Extractor, from installation to advanced workflows.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Features Overview](#features-overview)
3. [Basic Usage](#basic-usage)
4. [Workflows](#workflows)
5. [Export Options](#export-options)
6. [Settings & Configuration](#settings--configuration)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)
9. [Quick Reference](#quick-reference)

---

## Getting Started

### Installation

#### Prerequisites
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **Git**: For version control (if cloning from repository)

#### Install Dependencies

```bash
npm install
```

This installs all required dependencies including React, Electron, TypeScript, and AI provider SDKs.

#### Copy Required Libraries

```bash
npm run copy-libs
```

This copies Three.js, p5.js, Babel, React, and ReactDOM to `public/libs/` for local use.

**Note:** This runs automatically during build, but you can run it manually if needed.

### First-Time Setup

#### Configure AI Provider

1. Click the settings button (⚙️) in the top right corner
2. Choose your AI provider:
   - **Ollama** (Recommended - Free & Local)
   - **Gemini** (Requires API key)
   - **OpenAI** (Requires API key)
   - **Anthropic** (Requires API key)
3. Enter your API key if required
4. Select your preferred model
5. Click "Save Settings"

#### Set Up Ollama (Recommended)

Ollama runs completely locally - no data leaves your machine and no API keys are needed.

1. **Install Ollama:**
   - Visit https://ollama.ai
   - Download and install for Mac
   - Ollama runs automatically in the background

2. **Download a Model:**
   ```bash
   ollama pull llama3.2
   ```
   
   Other recommended models:
   - `llama3.1` - More capable
   - `mistral` - Alternative option
   - `codellama` - Code-focused

3. **Verify Ollama is Running:**
   ```bash
   curl http://localhost:11434/api/tags
   ```
   
   If this returns a list of models, Ollama is running correctly.

4. **Configure in App:**
   - Click the settings button (⚙️) in the top right
   - Select "Ollama" as provider
   - Model should default to "llama3.2"
   - Ollama URL should be "http://localhost:11434"
   - Click "Save Settings"

#### Using API Providers

**Gemini (Google):**
1. Get API key from https://makersuite.google.com/app/apikey
2. Configure in app settings
3. Choose model (e.g., gemini-3-pro-preview or gemini-2.5-flash)

**OpenAI:**
1. Get API key from https://platform.openai.com/api-keys
2. Configure in app settings
3. Choose model (e.g., gpt-5.1, gpt-4.1-mini, or gpt-4o)

**Anthropic (Claude):**
1. Get API key from https://console.anthropic.com/
2. Configure in app settings
3. Choose model (e.g., claude-opus-4-20250514 or claude-3.5-sonnet-20241022)

---

## Features Overview

### Core Features

#### 1. Multi-File Upload & Management

**Supported File Types:**
- **Markup**: HTML, HTM
- **Stylesheets**: CSS, SCSS, SASS
- **Scripts**: JavaScript (JS, MJS, CJS), TypeScript (TS), JSX, TSX, 3JS (Three.js)
- **Data**: JSON

**File Operations:**
- Drag & Drop multiple files onto the input area
- File Selection via Import button
- File Tree browser with organized categories
- File Removal for individual files
- File Metadata (size, type, modification date)

**Example Code Library:**
- Quick Start examples to try immediately
- Simple Card (HTML/CSS)
- React Counter (React component)
- Three.js Cube (Interactive 3D)
- p5.js Sketch (Creative coding)
- Vanilla JS Animation
- One-Click Load for any example

#### 2. AI-Powered Component Extraction

**Supported AI Providers:**
- **Ollama** (Free, Local) - Recommended for privacy and cost
- **Gemini** (Google) - Fast and capable
- **OpenAI** - GPT-4 and GPT-3.5 models
- **Anthropic** - Claude models

**Extraction Process:**
1. Analysis: AI analyzes input code structure
2. Framework Detection: Identifies React, Three.js, Vanilla JS, etc.
3. Code Cleaning: Removes build dependencies and clutter
4. Modernization: Converts to modern ES6+ syntax
5. Component Generation: Creates clean, standalone components

**Interaction Modes:**
- **Extract** (default): Full extraction and refactor for reuse
- **Explain**: Emphasize explanation and analysis with lighter transformations
- **Review**: Structured code review with risks, improvements, and suggestions

#### 3. Live Preview System

**Preview Modes:**
- **Browser Mode**: HTML-only rendering, no JavaScript execution
- **Vanilla Mode**: HTML + CSS + JavaScript with light theme, centered layout
- **Canvas Mode**: Full-screen canvas optimized for Three.js/p5.js (dark theme)
- **React Mode**: TSX compilation with Babel and React rendering

**Preview Features:**
- Real-time updates as code is extracted
- Zoom controls for detailed inspection
- Full Screen mode
- Refresh to reload preview
- Error display with stack traces
- Console integration with log capture

#### 4. Code Browser

**Features:**
- Syntax highlighting for all languages
- Line numbers for easy reference
- File navigation between uploaded files
- Search within code files
- Copy & Download for individual files
- Side-by-side file tree and code viewer

#### 5. Analysis & Insights

**Build Approach:**
- Tool recommendations (Vite, Webpack, etc.)
- Dependency analysis with npm package lists
- Configuration tips
- Deployment guidance

**Code Simplification:**
- Lists removed dependencies
- Explains modernizations
- Highlights performance improvements
- Shows code size reduction

**Active Code Analysis:**
- Execution flow identification
- Dead code detection
- Import analysis
- Function usage tracking

**How It Works:**
- Component architecture explanation
- Data flow visualization
- Lifecycle details
- Event handling explanation

**Editable Sections:**
- Safe to edit (styling, text, configuration)
- Edit with caution (event handlers, state logic)
- Avoid editing (core framework code, dependencies)
- Customization points highlighted

#### 6. Export & Download

**Export Formats:**
- **Full ZIP**: Complete project with all files
- **Single HTML**: Standalone HTML file with embedded CSS/JS
- **Individual Files**: Download HTML, CSS, SCSS, TSX, JS separately
- **JSON Data**: Export extracted data as JSON
- **3D Scene Export**: Export Three.js scenes as JSON

**Framework-Specific Presets:**
- **Vite React Preset**: `src/components/` structure with TSX, CSS, and usage examples
- **Next.js Preset**: `components/` structure with TSX, CSS Modules, and page examples
- **React Component Preset**: Component + CSS + README
- **Vanilla Widget Preset**: index.html + JS + CSS + README

**Download Options:**
- Component name customization
- Format selection
- Batch download support

#### 7. Code Analysis System

**Code Type Detection:**
- Automatically identifies HTML, React, Three.js, p5.js, vanilla JS, CSS, JSON
- Detects completeness (complete, fragment, snippet)
- Finds syntax errors and missing dependencies
- Analyzes wrapping needs with explanations

**User-Controlled Workflow:**
- Preview button shows analysis before preview
- User chooses: Preview As-Is, Wrap & Preview, or Extract
- Explicit wrapping actions (never automatic)
- Clear explanations of why wrapping might be needed

#### 8. Console & Error Handling

**Console Features:**
- Strategic placement on input source side
- Log levels: Info, Warn, Error, System
- Filtering by log level
- Expandable error stack traces
- Timestamps on log entries
- Copy individual log entries
- Auto-hide when no logs

**Error Handling:**
- Runtime errors captured from preview iframe
- Compilation errors (Babel)
- Network errors (API requests)
- User-friendly error messages
- Real-time log synchronization

#### 9. Code Display & Editing

**Display Features:**
- Syntax highlighting (language-aware)
- Line numbers
- Search within code
- Edit mode toggle
- Code annotations (green/yellow/red indicators)

**Editing Features:**
- Live editing with preview updates
- Validation (real-time syntax checking)
- Code annotations show what's safe to edit

#### 10. Accessibility

**ARIA Support:**
- Screen reader support
- Semantic HTML roles
- Keyboard navigation
- Proper focus management

**Keyboard Shortcuts:**
- Tab navigation between elements
- Enter/Space to activate buttons
- Escape to close modals
- Arrow keys for file tree navigation

### Advanced Features

#### Three.js Support
- Automatic detection of Three.js usage
- Local library loading from `public/libs/three/`
- OrbitControls support
- Scene export as JSON
- No CDN dependency

#### p5.js Support
- Automatic detection of p5.js usage
- Local library loading from `public/libs/p5/`
- Instance mode support
- Full creative coding support
- No CDN dependency

#### Babel Standalone Support
- Client-side TSX/JSX compilation
- Local library loading from `public/libs/babel/`
- CDN fallback if local file missing
- React compilation support
- Fast processing without external dependencies

#### React/TSX Support
- Babel compilation for client-side TSX
- Local React/ReactDOM UMD builds
- Component auto-detection
- Full React hooks support
- No CDN dependency

#### Multi-File Projects
- Intelligent file aggregation
- Dependency detection (npm packages)
- File structure generation
- Context preservation
- File relationship understanding

#### Extraction History
- Tracks last 5 extractions in session
- History navigation to view previous extractions
- Per-file diff selection for multi-file projects
- Improved diff generation with line-aware unified diff

---

## Basic Usage

### Step 1: Input Your Code

**Option A: Paste Code**
1. Click in the input textarea
2. Paste your HTML, JSX, TSX, or JavaScript code
3. Or paste JSON data

**Option B: Upload Files**
1. Click the "Import" button
2. Select one or more files
3. Or drag and drop files onto the input area

**Supported File Types:**
- HTML (.html, .htm)
- CSS (.css)
- SCSS (.scss, .sass)
- JavaScript (.js, .mjs, .cjs)
- TypeScript (.ts)
- JSX (.jsx)
- TSX (.tsx)
- Three.js (.3js)
- JSON (.json)

### Step 2: Understand Your Code (Code Analysis)

**Use Case:** You've pasted code and want to understand what it is, if it needs wrapping, and what you can do with it.

1. **Click Preview Button**
   - Click the "Preview" button (purple button above the input)
   - The code analysis panel will appear

2. **Review the Analysis**
   - **Code Type**: See what type of code was detected (HTML, React, Three.js, etc.)
   - **Completeness**: Check if it's complete, a fragment, or just a snippet
   - **Errors/Warnings**: See any syntax errors or missing dependencies
   - **Wrapping Needs**: Understand if wrapping is recommended and why
   - **Dependencies**: See what libraries are needed
   - **Recommendations**: Get actionable advice

3. **Choose Your Action**
   - **Preview As-Is**: If code is complete and doesn't need wrapping
   - **Wrap & Preview**: If code needs HTML structure (Three.js/p5.js fragments)
   - **Extract**: Use AI to analyze and extract structured component code

**Understanding Wrapping:**
- **When Needed**: Code fragments (Three.js/p5.js without HTML, JS that manipulates DOM without HTML structure)
- **What It Does**: Adds necessary HTML structure and library script tags
- **Why**: Some code needs a complete HTML page to run properly
- **User Control**: Wrapping is never automatic - you decide!

### Step 3: Extract Component

1. Click the **"Extract Component"** button
2. Wait for AI to analyze and extract (this may take 30-60 seconds)
3. Watch as the code streams in progressively

### Step 4: Preview & Review

1. **Preview Tab** (default)
   - View live preview of extracted component
   - Switch between Vanilla JS and React preview
   - Check console for errors
   - Use zoom and fullscreen controls

2. **Code Browser Tab** (if files uploaded)
   - Browse uploaded files
   - View code with syntax highlighting
   - Search within files

3. **Extracted Code Tab**
   - View extracted HTML, CSS, SCSS, TSX, JS
   - Edit code directly
   - Download individual files
   - View extraction history and diffs

4. **Analysis Tab**
   - Read build approach recommendations
   - Understand code simplifications
   - Learn how the component works
   - See what can be safely edited

### Step 5: Export

**Download Options:**
- **Full .zip**: Complete project package
- **Single .html**: Standalone HTML file
- **Individual Files**: HTML, CSS, SCSS, TSX, JS
- **Data .json**: Export as JSON
- **Export 3D Scene**: For Three.js projects

**Framework-Specific Presets:**
- **Vite React Preset**: Vite-style project structure
- **Next.js Preset**: Next.js-style project structure
- **React Component Preset**: Component + CSS bundle
- **Vanilla Widget Preset**: Standalone widget bundle

---

## Workflows

### Workflow 1: Extracting from HTML/CSS/JS

**Use Case:** You have a standalone HTML file with embedded CSS and JavaScript, and you want to extract it as a clean, modern component.

**Steps:**
1. Prepare your code (copy entire content or upload file)
2. Input the code (paste or import)
3. Optional: Click "Preview" to analyze first
4. Extract the component
5. Review results in Preview, Extracted Code, and Analysis tabs
6. Export your component

**Tips:**
- The AI will automatically modernize your CSS with variables
- JavaScript will be refactored to ES6+ syntax
- React component (TSX) will be generated automatically

### Workflow 2: Extracting from React Components

**Use Case:** You have a React component file (JSX/TSX) and want to extract it as a clean, standalone component.

**Steps:**
1. Input your React code (paste or upload .jsx/.tsx file)
2. Extract the component
3. Review in React Preview mode
4. Use the extracted TSX code

**Tips:**
- The AI removes build-step dependencies
- Props and state management are preserved
- Hooks (useState, useEffect) are maintained

### Workflow 3: Extracting from Three.js Scenes

**Use Case:** You have a Three.js scene and want to extract it as a clean, standalone component.

**Steps:**
1. Input your Three.js code (paste or upload .3js/.js file)
2. Extract the component
3. Preview in Canvas mode
4. Interact with the 3D scene using OrbitControls
5. Export options: Download .js, Export 3D Scene, or Full .zip

**Tips:**
- Three.js is automatically loaded - no imports needed
- OrbitControls are automatically detected and loaded
- The scene is assigned to `window.scene` for export capability

### Workflow 4: Working with Multiple Files

**Use Case:** You have a project with multiple files (HTML, CSS, JS, etc.) and want to extract them as a single component.

**Steps:**
1. Upload multiple files (drag & drop or Import button)
2. Browse your files in Code Browser tab
3. **Understanding Preview vs Extract:**
   - **Preview Button**: Only previews the content currently in the textarea (single file)
   - **Extract Component Button**: Analyzes and extracts from ALL uploaded files together
4. Extract from all files
5. Review combined results

**Tips:**
- Files are automatically categorized (markup, stylesheet, script, data)
- The AI understands file relationships
- You can remove individual files before extraction
- Use Preview for single-file testing, Extract for multi-file projects

### Workflow 5: Using Example Code

**Use Case:** You want to quickly try the extraction feature or learn how it works.

**Steps:**
1. Choose an example from the Example Code section
2. Code loads automatically with preview mode set
3. Extract the component
4. Learn from results in Analysis tab

**Tips:**
- Examples are great for learning the tool
- Use them as templates for your own code
- Modify examples before extraction to see how AI handles changes

### Workflow 6: Extracting from JSON Data

**Use Case:** You have JSON data that represents a component structure, and you want to convert it to code.

**Steps:**
1. Input JSON data (paste or upload .json file)
2. Extract the component
3. Review generated code
4. Modify if needed using the code editor

**Tips:**
- JSON should represent component structure
- The AI can handle various JSON formats
- Complex nested structures are supported

### Workflow 7: Editing Extracted Code

**Use Case:** You want to modify the extracted code before exporting.

**Steps:**
1. Extract your component
2. Navigate to Extracted Code tab
3. Select the code tab you want to edit (HTML, CSS, TSX, JS)
4. Toggle Edit mode
5. Make your changes
6. Preview your changes
7. Export modified code

**Tips:**
- Code editing is available in the Extracted Code tab
- Preview updates automatically
- You can edit multiple code sections
- Code annotations show what's safe to edit

### Workflow 8: Exporting for Different Use Cases

**Use Case:** You want to use the extracted component in a specific project or framework.

**Steps:**
1. Extract your component
2. Choose export format based on your use case:

**For Standalone Use:**
- Click "Single .html" for a complete HTML file

**For React Projects:**
- Click "React component (.tsx + .css)" for component bundle
- Click "Vite React preset" for Vite-style project structure
- Click "Next.js preset" for Next.js-style project structure
- Or click "Download .tsx" for just the component file

**For Vanilla JS / Static Sites:**
- Click "Vanilla widget (index.html + .js + .css)" for widget bundle
- Or download individual .js/.css files

**For Complete Project:**
- Click "Full .zip" for complete project structure with README

**For Data Backup:**
- Click "Data .json" to save complete extraction data

**Tips:**
- Each export format is optimized for its use case
- Presets are the fastest path to framework-specific bundles
- Full ZIP includes all file types and a README
- JSON export allows you to restore later

---

## Export Options

### Individual File Downloads

- **Download .html**: Standalone HTML file
- **Download .css**: Stylesheet file
- **Download .scss**: SCSS version
- **Download .tsx**: React component file
- **Download .js**: JavaScript file
- **Data .json**: Complete extraction data

### Project Bundles

- **Full .zip**: Complete project with all files, README, and structure
- **Single .html**: Standalone HTML file with embedded CSS/JS

### Framework-Specific Presets

- **Vite React Preset**: `src/components/` structure with TSX, CSS, usage examples, and README
- **Next.js Preset**: `components/` structure with TSX, CSS Modules, page examples, and README
- **React Component Preset**: Component + CSS + README bundle
- **Vanilla Widget Preset**: index.html + JS + CSS + README bundle

### Special Exports

- **Export 3D Scene**: Export Three.js scenes as JSON (requires Vanilla JS preview mode)

---

## Settings & Configuration

### AI Provider Settings

- **Provider Selection**: Choose AI service (Ollama, Gemini, OpenAI, Anthropic)
- **API Key Management**: Secure API key storage (encrypted)
- **Model Selection**: Choose specific AI model
- **Ollama URL**: Configure local Ollama URL (default: http://localhost:11434)
- **Interaction Mode**: Choose Extract, Explain, or Review mode

### Settings Persistence

- **Electron Store**: Settings saved locally in desktop app (encrypted)
- **LocalStorage**: Settings saved in browser (web mode)
- **Auto-load**: Settings loaded on app start

### Preview Settings

- **Mode**: Vanilla JS or React
- **Zoom**: Adjust preview size
- **Full Screen**: Toggle full screen

---

## Troubleshooting

### Extraction Fails or Times Out

**Possible Causes:**
- AI provider not configured correctly
- Network connection issues (for API providers)
- Ollama not running (for Ollama provider)
- Input code too large or complex

**Solutions:**
1. Check AI provider settings
2. Verify API keys are correct (for API providers)
3. Check if Ollama is running: `curl http://localhost:11434/api/tags`
4. Try breaking large code into smaller chunks
5. Check console for detailed error messages

### Preview Doesn't Render

**Possible Causes:**
- Code has syntax errors
- Required libraries aren't loading
- Preview mode is incorrect

**Solutions:**
1. Check Console panel for errors
2. Verify preview mode matches your code type
3. For Three.js: Ensure Canvas preview mode
4. For React: Ensure React preview mode
5. Try refreshing the preview

### Exported Code Doesn't Work

**Possible Causes:**
- Missing dependencies
- Incorrect file paths
- Build configuration issues

**Solutions:**
1. Review Analysis tab for build recommendations
2. Check README in ZIP export
3. Verify all dependencies are installed
4. Check file paths in exported code
5. Review "Build Approach" section in Analysis tab

### Three.js Scene Doesn't Export

**Possible Causes:**
- Preview mode set to React
- Scene object not assigned to window.scene

**Solutions:**
1. Switch preview mode to "Vanilla JS" or "Canvas"
2. Export button will become enabled
3. Ensure Three.js code assigns scene: `window.scene = scene;`
4. AI should add this automatically during extraction

### File Upload Doesn't Work

**Possible Causes:**
- File type not supported
- File too large
- Browser/Electron permissions

**Solutions:**
1. Check supported file types
2. Try smaller file
3. Check browser/Electron console for errors
4. Try drag and drop instead of file picker

### Ollama Connection Errors

**Check if Ollama is running:**
```bash
curl http://localhost:11434/api/tags
```

**Start Ollama if needed:**
```bash
ollama serve
```

**Verify model is installed:**
```bash
ollama list
```

**Check Ollama URL in settings:**
- Default: http://localhost:11434
- Make sure it matches your Ollama configuration

---

## Best Practices

### Getting the Best Extraction Results

1. **Provide Complete Code**
   - Include all related HTML, CSS, and JavaScript
   - Don't omit important parts
   - Include comments if they provide context

2. **Use Clear Structure**
   - Well-organized code extracts better
   - Use meaningful class names
   - Separate concerns (HTML, CSS, JS)

3. **Include Context**
   - Add comments explaining complex logic
   - Describe what the component does
   - Note any special requirements

4. **Test Multiple Providers**
   - Different AI providers may give different results
   - Try Ollama (free) first
   - Compare results from different providers

### Optimizing Your Workflow

1. **Start with Examples**
   - Use example code to understand the tool
   - Modify examples to learn
   - Build confidence before extracting your own code

2. **Use Multi-File Upload**
   - Upload all related files together
   - The AI understands file relationships
   - Better results with complete context

3. **Review Analysis Tab**
   - Read the AI's explanations
   - Understand what was changed
   - Learn from the recommendations

4. **Iterate and Refine**
   - Extract, review, modify, re-extract
   - Each iteration improves the result
   - Use the code editor to make quick fixes

### Performance Tips

1. **Use Local AI (Ollama)**
   - Faster for local processing
   - No API rate limits
   - Completely free

2. **Break Large Projects into Components**
   - Extract one component at a time
   - Better results with focused extractions
   - Easier to review and modify

3. **Use Example Code for Quick Tests**
   - Examples load instantly
   - Good for testing the tool
   - No need to prepare code

---

## Quick Reference

### Keyboard Shortcuts

- **Escape**: Close modals
- **Tab**: Navigate between elements
- **Enter**: Submit forms (in modals)
- **Arrow Keys**: Navigate file tree

### Supported File Types

- **Markup**: .html, .htm
- **Stylesheets**: .css, .scss, .sass
- **Scripts**: .js, .mjs, .cjs, .ts, .tsx, .jsx, .3js
- **Data**: .json

### Export Formats

- **Single .html**: Standalone HTML file
- **Full .zip**: Complete project structure
- **Download .tsx**: React component file
- **Download .js**: JavaScript file
- **Download .css**: Stylesheet file
- **Data .json**: Complete extraction data
- **Export 3D Scene**: Three.js scene JSON

### Preview Modes

- **Browser**: HTML-only content
- **Vanilla JS**: Standard JavaScript
- **React**: React components
- **Canvas**: Three.js and p5.js

### Interaction Modes

- **Extract**: Full extraction and refactor (default)
- **Explain**: Emphasis on explanation and analysis
- **Review**: Structured code review with suggestions

---

## Getting Help

If you encounter issues not covered in this guide:

1. Check the **Analysis Tab** for AI-generated explanations
2. Review the **Console Panel** for error messages
3. Consult the **README.md** for general information
4. Check **[docs/testing.md](./docs/testing.md)** for known issues and solutions
5. Review **[docs/USE_CASES.md](./docs/USE_CASES.md)** for use case examples

---

## Next Steps

After mastering these workflows:

1. Try extracting complex components
2. Experiment with different AI providers and interaction modes
3. Build a library of extracted components
4. Explore the 20 use cases in [USE_CASES.md](./docs/USE_CASES.md)
5. Share your results and feedback

Happy extracting! 🚀

