# Developer Guide - Universal Component Extractor

This comprehensive guide covers everything developers need to know about contributing to, maintaining, and understanding the Universal Component Extractor project.

## Table of Contents

1. [Development Setup](#development-setup)
2. [Architecture Overview](#architecture-overview)
3. [Build Process](#build-process)
4. [Testing Workflow](#testing-workflow)
5. [Code Contribution Guidelines](#code-contribution-guidelines)
6. [Release Process](#release-process)
7. [Debugging Guide](#debugging-guide)
8. [Quick Reference](#quick-reference)

---

## Development Setup

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **Git**: For version control
- **Electron**: Will be installed via npm
- **Ollama** (Optional): For local AI testing

### Initial Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd universal-component-extractor
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Copy Required Libraries**
   ```bash
   npm run copy-libs
   ```
   This copies Three.js, p5.js, Babel, React, and ReactDOM to `public/libs/`

4. **Verify Setup**
   ```bash
   npm run test:run
   ```
   All tests should pass.

### Development Environment

**Start Development Server:**
```bash
npm run dev
```
This starts the Vite dev server on `http://localhost:3000`

**Start Electron in Development:**
```bash
npm run electron:dev
```
This starts both the Vite dev server and Electron app.

**Note:** The `electron:dev` script uses `concurrently` to run both processes. Make sure both are running for full functionality.

---

## Architecture Overview

### Project Structure

```
universal-component-extractor/
├── electron/              # Electron main process
│   ├── main.ts           # Main process entry point
│   ├── preload.ts        # Preload script for IPC
│   └── tsconfig.json     # TypeScript config for Electron
├── components/           # React components
│   ├── AnalysisTab.tsx   # Analysis display component
│   ├── CodeAnalysisPanel.tsx # Code analysis results panel
│   ├── CodeBrowser.tsx   # File browser component
│   ├── CodeDisplay.tsx   # Code display/editor
│   ├── ConsolePanel.tsx  # Console log display
│   ├── FileTree.tsx      # File tree navigation
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
│   ├── copy-libs.js      # Copy libraries to public/libs/
│   └── rename-electron.js # Rename .js to .cjs
├── public/               # Static assets
│   └── libs/             # Local libraries (Three.js, p5.js, Babel, React)
├── App.tsx               # Main application component
├── index.tsx             # React entry point
├── types.ts              # Shared type definitions
└── vite.config.ts        # Vite configuration
```

### Technology Stack

**Frontend:**
- **React 19**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling (via className)
- **react-syntax-highlighter**: Code syntax highlighting

**Desktop:**
- **Electron 30**: Desktop app framework
- **electron-store**: Settings persistence
- **electron-builder**: App packaging

**AI Integration:**
- **@google/genai**: Gemini API
- **openai**: OpenAI API
- **@anthropic-ai/sdk**: Anthropic API
- **Ollama**: Local AI (via HTTP)

**Utilities:**
- **jszip**: ZIP file creation
- **three**: Three.js library (local)
- **p5.js**: p5.js library (local)

### Component Architecture

#### App.tsx (Main Component)

**Responsibilities:**
- Application state management
- File upload handling
- AI extraction orchestration
- Tab navigation
- Settings management

**Key Functions:**
- `handlePreviewClick`: Analyzes code and shows analysis panel
- `handlePreviewAsIs`: Previews code without wrapping
- `handleWrapAndPreview`: Wraps code then previews
- `handleProcessClick`: Triggers AI extraction
- `processFiles`: Handles file uploads
- `handleDownloadZip`: Creates ZIP export

#### PreviewDisplay Component

**Responsibilities:**
- Live preview rendering
- Iframe management
- Console log capture
- Babel compilation (for React)
- Three.js/p5.js integration

**Preview Modes:**
- `browser`: HTML-only preview, no JavaScript execution
- `vanilla`: Full HTML/CSS/JS with light theme, centered layout
- `canvas`: Full HTML/CSS/JS with dark theme, full viewport (optimized for Three.js/p5.js)
- `react`: React/TSX compilation and rendering

**Technical Details:**
- Uses blob URLs for iframe content (supports ES modules) for canvas/react modes
- Uses srcdoc attribute for browser/vanilla modes (simpler, no size limits for small content)
- Injects console capture script for debugging
- Compiles TSX with Babel Standalone for React preview mode
- Handles Three.js, p5.js, and OrbitControls loading asynchronously
- Waits for library dependencies before executing user code
- Library inlining: For canvas mode with wrapped HTML (complete HTML documents), automatically inlines library scripts from `/libs/` for blob URL compatibility
- Library caching: Caches fetched library content to avoid repeated network requests
- Error handling: Gracefully handles library fetch failures by keeping original script tags as fallback

### Service Layer

#### aiService.ts

**Purpose:** Abstract AI provider interface

**Functions:**
- `extractComponentFromHtml`: Main extraction function
- `extractWithGemini`: Gemini extraction
- `extractWithOpenAI`: OpenAI extraction
- `extractWithAnthropic`: Anthropic extraction
- `extractWithOllama`: Ollama extraction

**Stream Processing:**
- Parses XML-like tags from AI output
- Updates UI progressively
- Handles errors gracefully
- Extracts: HTML, CSS, SCSS, TSX, JS, Explanation, Analysis

### Utility Functions

#### codeAnalyzer.ts

**Purpose:** Analyze pasted code to identify type, completeness, errors, and wrapping needs

**Functions:**
- `analyzeCode`: Main analysis function
- `detectCodeType`: Identify code type (HTML, React, Three.js, p5.js, etc.)
- `checkCompleteness`: Determine if code is complete, fragment, or snippet
- `detectErrors`: Find syntax errors and missing dependencies
- `analyzeWrappingNeeds`: Determine if wrapping is needed and why
- `suggestPreviewMode`: Recommend appropriate preview mode

#### codeWrapper.ts

**Purpose:** Wrap code fragments in HTML structure (user-initiated only)

**Important:** Wrapping is never automatic - users must explicitly choose to wrap code.

#### contentAggregator.ts

**Purpose:** Combine multiple files for AI extraction

**Features:**
- Groups by category
- Sorts scripts by dependencies
- Detects npm packages
- Generates file structure

### Library Management

**Local Storage:**
- All libraries stored in `public/libs/` directory
- Copied from `node_modules` during build
- Ensures offline support

**Libraries Included:**
- Three.js (three.min.js, three.module.js, OrbitControls.js)
- p5.js (p5.min.js)
- Babel Standalone (babel.min.js)
- React/ReactDOM (react.development.js, react-dom.development.js)

**Benefits:**
- Offline support
- Faster loading (no CDN latency)
- Version control
- No external dependencies

---

## Build Process

### Development Build

**Web Build:**
```bash
npm run dev
```
Output: Served by Vite dev server (no files written)

**Electron Development Build:**
```bash
npm run build:electron
```
This:
1. Copies libraries to `public/libs/`
2. Compiles TypeScript in `electron/` directory
3. Renames `.js` files to `.cjs` for Electron compatibility
4. Builds the Vite bundle to `dist/`

Output: `dist/` and `dist-electron/` directories

### Production Build

**Full Production Build:**
```bash
npm run build
```

This:
1. Runs `build:electron` (see above)
2. Packages the Electron app using `electron-builder`
3. Creates a `.dmg` file (on Mac) in `dist/`

**Output:**
- `dist/` - Web build
- `dist-electron/` - Electron main process files
- `dist/*.dmg` - Installer package (Mac)

### Build Scripts Breakdown

- `copy-libs.js` - Copies all required libraries to `public/libs/`
- `rename-electron.js` - Renames Electron `.js` files to `.cjs`
- `build:electron` - Complete Electron build process
- `build` - Full production build with packaging

---

## Testing Workflow

### Running Tests

**Watch Mode (Development):**
```bash
npm test
```
Runs Vitest in watch mode - tests re-run on file changes.

**Run Once:**
```bash
npm run test:run
```
Runs all tests once and exits.

**Test UI:**
```bash
npm run test:ui
```
Opens Vitest UI in browser for interactive testing.

**Coverage Report:**
```bash
npm run test:coverage
```
Runs tests and generates coverage report in `coverage/` directory.

### Test Structure

```
tests/
├── setup.ts              # Test configuration and mocks
├── utils/
│   ├── fileTypeDetector.test.ts
│   ├── contentAggregator.test.ts
│   └── exampleCode.test.ts
├── services/
│   └── aiService.test.ts
└── integration/
    └── extraction.test.ts
```

### Writing Tests

**Unit Tests:**
- Test individual functions in isolation
- Mock external dependencies
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

**Test Coverage Goals:**
- **Minimum**: 70% coverage for utility functions
- **Target**: 80%+ coverage for critical paths
- **Focus Areas**: File processing, content aggregation, AI service

---

## Code Contribution Guidelines

### Code Style

- **TypeScript**: Use strict mode, avoid `any` types
- **React**: Functional components with hooks
- **Formatting**: Use consistent indentation (2 spaces)
- **Naming**: camelCase for variables/functions, PascalCase for components

### Commit Guidelines

**Commit Message Format:**
```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build process, dependencies

### Pull Request Process

1. Create feature branch
2. Make changes (write code, add tests, update documentation)
3. Run tests: `npm run test:run` and `npm run build:electron`
4. Commit changes with descriptive messages
5. Push and create PR
6. Fill out PR template and request review

### Code Review Checklist

- [ ] Code follows project style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console.logs or debug code
- [ ] TypeScript types are correct
- [ ] No breaking changes (or documented)
- [ ] Build process completes successfully

---

## Release Process

### Version Numbering

Follows [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Release Steps

1. **Update Version**
   ```bash
   npm version patch|minor|major
   ```

2. **Update CHANGELOG.md**
   - Add new version section
   - Document all changes
   - Include breaking changes if any

3. **Run Full Test Suite**
   ```bash
   npm run test:run
   npm run test:coverage
   ```

4. **Build and Test**
   ```bash
   npm run build
   # Test the built app
   ```

5. **Create Release Commit**
   ```bash
   git add .
   git commit -m "chore: Release v2.0.X"
   git tag v2.0.X
   ```

6. **Push to Repository**
   ```bash
   git push origin main
   git push origin v2.0.X
   ```

7. **Create GitHub Release**
   - Go to GitHub releases
   - Create new release from tag
   - Copy changelog content
   - Attach build artifacts

### Pre-Release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version number updated
- [ ] Build succeeds
- [ ] Manual testing completed
- [ ] No known critical bugs

---

## Debugging Guide

### Development Tools

**Browser DevTools (Web Mode):**
- Open DevTools (F12 or Cmd+Option+I)
- Check Console for errors
- Use React DevTools extension
- Network tab for API calls

**Electron DevTools:**
- Automatically opens in dev mode
- Same as browser DevTools
- Additional Electron-specific tools

**Vite Dev Server:**
- Hot Module Replacement (HMR)
- Fast refresh for React
- Error overlay in browser

### Common Issues

**Issue: Libraries Not Loading**
```bash
# Solution: Run copy-libs script
npm run copy-libs
```

**Issue: TypeScript Errors**
```bash
# Check tsconfig.json
# Ensure all types are installed
npm install --save-dev @types/node
```

**Issue: Electron Not Starting**
```bash
# Check if Vite dev server is running
# Check port 3000 is available
# Verify electron files are built
npm run build:electron
```

**Issue: Tests Failing**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm run test:run
```

### Debugging AI Service

**Enable Logging:**
```typescript
// In aiService.ts, add console.logs
console.log('Provider:', settings.provider);
console.log('Model:', settings.model);
```

**Test Individual Providers:**
- Use test API keys
- Check network requests
- Verify response format

---

## Quick Reference

### Common Commands

```bash
# Development
npm run dev              # Start Vite dev server
npm run electron:dev     # Start Electron in dev mode

# Building
npm run build:electron  # Build Electron app
npm run build           # Full production build

# Testing
npm test                # Run tests in watch mode
npm run test:run        # Run tests once
npm run test:coverage   # Generate coverage report

# Utilities
npm run copy-libs       # Copy libraries to public/libs/
```

### File Paths

- Source: Root directory (components/, services/, utils/, etc.)
- Build Output: `dist/`
- Electron: `electron/` and `dist-electron/`
- Tests: `tests/`
- Libraries: `public/libs/`

### Architecture Decisions

**Technology Choices:**
- **React**: Mature ecosystem, component-based architecture
- **Vite**: Fast development server, optimized production builds
- **Electron**: Cross-platform support, native app experience
- **Vitest**: Fast test runner, Vite-compatible
- **Unified AI Service**: Single abstraction layer for multiple providers

**Code Organization Principles:**
1. **Separation of Concerns**: Components handle UI, Services handle business logic, Utils handle pure functions
2. **Single Responsibility**: Each file has one clear purpose
3. **DRY**: Reusable utility functions, shared components
4. **Type Safety**: TypeScript strict mode, proper type definitions

---

## Additional Resources

- **[Testing Documentation](./testing.md)** - Comprehensive testing guides
- **[Build Tools](./build-tools.md)** - Build system information
- **[Project Status](./project-status.md)** - Version history and status
- **[User Guide](./USER_GUIDE.md)** - User-facing documentation
- **[Documentation Index](./README.md)** - Complete documentation index

### External Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Electron Documentation](https://www.electronjs.org)
- [Vitest Documentation](https://vitest.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)

---

**Last Updated:** November 2025  
**Version:** 2.0.6

