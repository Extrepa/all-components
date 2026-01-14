# Developer Workflow Guide

This guide is for developers contributing to or maintaining the Universal Component Extractor project.

## Table of Contents

1. [Development Setup](#development-setup)
2. [Build Process](#build-process)
3. [Testing Workflow](#testing-workflow)
4. [Code Contribution Guidelines](#code-contribution-guidelines)
5. [Release Process](#release-process)
6. [Architecture Decisions](#architecture-decisions)
7. [Debugging Guide](#debugging-guide)

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

**Integration Tests:**
- Test multiple components working together
- Test real workflows
- Use realistic data

**Example:**
```typescript
import { describe, it, expect } from 'vitest';
import { detectFileType } from '../../utils/fileTypeDetector';

describe('detectFileType', () => {
  it('should detect HTML files', () => {
    expect(detectFileType('index.html')).toBe('html');
  });
});
```

### Test Coverage Goals

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

### File Organization

```
src/
├── components/      # React components
├── services/       # Business logic (AI, etc.)
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
└── App.tsx         # Main application component
```

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

**Examples:**
```
feat: Add welcome modal for first-time users

fix: Resolve Three.js loading issue in preview

docs: Update user workflow guide
```

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make Changes**
   - Write code
   - Add tests
   - Update documentation

3. **Run Tests**
   ```bash
   npm run test:run
   npm run build:electron
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: Add new feature"
   ```

5. **Push and Create PR**
   - Push to your fork
   - Create pull request
   - Fill out PR template
   - Request review

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
   # Update package.json version
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
   git commit -m "chore: Release v2.0.4"
   git tag v2.0.4
   ```

6. **Push to Repository**
   ```bash
   git push origin main
   git push origin v2.0.4
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

## Code Analysis System

### Overview

The code analysis system provides intelligent code identification and recommendations before preview or extraction. It helps users understand their code and make informed decisions.

### Components

**codeAnalyzer.ts:**
- `analyzeCode()`: Main analysis function
- Detects code type (HTML, React, Three.js, p5.js, vanilla, CSS, JSON, mixed, unknown)
- Checks completeness (complete, fragment, snippet, unknown)
- Detects syntax errors and missing dependencies
- Analyzes wrapping needs
- Suggests preview mode
- Generates recommendations

**CodeAnalysisPanel.tsx:**
- Displays analysis results
- Shows code type, completeness, errors, warnings
- Explains wrapping needs
- Provides action buttons (Preview As-Is, Wrap & Preview, Extract)

### Workflow

1. User pastes code → `htmlInput` state
2. User clicks Preview → `handlePreviewClick()`
3. `analyzeCode()` runs → returns `CodeAnalysis`
4. `CodeAnalysisPanel` displays results
5. User chooses action:
   - Preview As-Is → `handlePreviewAsIs()` → `parseCodeForPreview(false)`
   - Wrap & Preview → `handleWrapAndPreview()` → `parseCodeForPreview(true)`
   - Extract → `handleExtractFromAnalysis()` → `handleProcessClick()`

### Code Type Detection

Detection priority:
1. React: Checks for React imports, hooks, JSX syntax
2. Three.js: Checks for THREE.*, Scene, WebGLRenderer, etc.
3. p5.js: Checks for setup/draw functions, p5.*, createCanvas
4. JSON: Validates JSON structure
5. HTML: Checks for HTML tags
6. CSS: Checks for CSS rules
7. Vanilla JS: Checks for JavaScript syntax
8. Mixed: HTML with embedded CSS/JS
9. Unknown: Fallback

### Wrapping Analysis

Wrapping is determined by:
- Code type (Three.js/p5.js fragments need wrapping)
- Completeness (fragments need HTML structure)
- DOM manipulation (JS that uses document.* needs HTML)

Wrapping is **never automatic** - users must explicitly choose to wrap.

### Preview Mode Selection

Preview modes are suggested based on code type:
- React → `react` mode
- Three.js/p5.js → `canvas` mode
- HTML-only → `browser` mode
- Everything else → `vanilla` mode

### Architecture Decisions

#### Export System & Presets
- Core export assembly lives in `utils/exportHelpers.ts`:
  - `buildFullProjectFiles` – builds the legacy "Full .zip" structure.
  - `buildReactComponentPresetFiles` – builds the React preset ZIP (TSX + CSS + README).
  - `buildVanillaWidgetPresetFiles` – builds the vanilla widget ZIP (index.html + JS + CSS + README).
  - `buildViteReactPresetFiles` – builds a Vite-style preset under `src/components/`.
  - `buildNextJsPresetFiles` – builds a Next.js-style preset under `components/`.
- UI wiring for exports lives in `App.tsx` and `components/OutputPane.tsx`:
  - `App.tsx` owns the handlers that call these helpers and hand results to JSZip.
  - `OutputPane` renders the export buttons, including the **Export presets** section.
- When adding a new preset (e.g., Next.js page, framework-specific template):
  1. Add a new helper in `utils/exportHelpers.ts` that returns a `Record<string, string>` of file paths to content.
  2. Add a handler in `App.tsx` that calls the helper, builds a ZIP via JSZip, and triggers a download.
  3. Add a button in `OutputPane` that invokes the new handler and label it clearly.
  4. Add unit tests under `tests/utils/exportHelpers.test.ts` to lock in file names and basic contents.

### Technology Choices

**Frontend Framework: React**
- Mature ecosystem
- Component-based architecture
- Good TypeScript support

**Build Tool: Vite**
- Fast development server
- Optimized production builds
- Native ES modules support

**Desktop Framework: Electron**
- Cross-platform support
- Native app experience
- Access to Node.js APIs

**Testing: Vitest**
- Fast test runner
- Vite-compatible
- Good TypeScript support

**AI Providers:**
- Unified abstraction layer (`aiService.ts`)
- Support for multiple providers
- Streaming response handling

### Code Organization Principles

1. **Separation of Concerns**
   - Components handle UI
   - Services handle business logic
   - Utils handle pure functions

2. **Single Responsibility**
   - Each file has one clear purpose
   - Functions do one thing well

3. **DRY (Don't Repeat Yourself)**
   - Reusable utility functions
   - Shared components
   - Common patterns

4. **Type Safety**
   - TypeScript strict mode
   - Proper type definitions
   - Avoid `any` types

### Key Design Patterns

**Service Abstraction:**
- `aiService.ts` provides unified interface
- Provider-specific implementations
- Easy to add new providers

**Component Composition:**
- Small, focused components
- Props-based communication
- Reusable UI elements

**State Management:**
- React hooks (useState, useCallback)
- Local component state
- Props drilling (acceptable for this app size)

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

**Mock AI Responses:**
```typescript
// In tests, mock the AI service
vi.mock('../../services/aiService', () => ({
  extractComponentFromHtml: vi.fn().mockResolvedValue(mockResult),
}));
```

### Performance Debugging

**Measure Load Times:**
```typescript
console.time('extraction');
await extractComponentFromHtml(...);
console.timeEnd('extraction');
```

**Check Bundle Size:**
```bash
npm run build
# Check dist/ directory sizes
```

**Profile React Components:**
- Use React DevTools Profiler
- Identify slow renders
- Optimize re-renders

---

## Additional Resources

For testing documentation, see [docs/testing.md](./docs/testing.md)  
For build tools information, see [docs/build-tools.md](./docs/build-tools.md)  
For complete documentation index, see [docs/README.md](./docs/README.md)

### Documentation Files

- `README.md` - Project overview
- `ARCHITECTURE.md` - Technical architecture
- `FEATURES.md` - Feature documentation
- `WORKFLOW_USER.md` - User workflows
- [docs/testing.md](./docs/testing.md) - Testing guide
- `CHANGELOG.md` - Version history

### External Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Electron Documentation](https://www.electronjs.org)
- [Vitest Documentation](https://vitest.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)

### Getting Help

1. Check existing documentation
2. Search existing issues
3. Review code comments
4. Ask in project discussions
5. Create detailed issue report

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

- Source: `src/` (or root for this project)
- Build Output: `dist/`
- Electron: `electron/` and `dist-electron/`
- Tests: `tests/`
- Libraries: `public/libs/`

---

Happy coding! 🚀

