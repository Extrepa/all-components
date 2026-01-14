# Important Notes

## Development Notes

### Recent Changes (November 2025)

**Workstream 1: Preview-Mode Detection Unification - COMPLETE**
- Simplified `parseCodeForPreview` to only handle code splitting (HTML/CSS/JS/TSX extraction)
- Removed framework detection logic from `parseCodeForPreview` - now defaults to 'vanilla'
- Preview mode decisions now flow through:
  - `codeAnalyzer.suggestedPreviewMode` for preview path (manual paste, examples)
  - `detectPreviewModeFromExtracted` for post-extraction path (AI extraction)
- Example buttons already use `analyzeCode` correctly
- All tests passing (68/68)

**All Improvement Plan Workstreams Complete**
- ✅ Workstream 1: Preview-mode unification
- ✅ Workstream 2: App.tsx refactor into InputPane/OutputPane
- ✅ Workstream 3: Multi-file workflow clarity
- ✅ Workstream 4: Console and error surface improvements

See `IMPROVEMENT_PLAN.md` for full details.

**Phase 3 Workstreams - COMPLETE (November 2025)**
- ✅ **Workstream D: Framework-Specific Export Presets**
  - Vite React preset: exports to `src/components/` with TSX, CSS, and usage examples
  - Next.js preset: exports to `components/` with TSX, CSS Modules, and page examples
  - New functions: `buildViteReactPresetFiles()`, `buildNextJsPresetFiles()` in `utils/exportHelpers.ts`
  - UI buttons added in `OutputPane.tsx` for framework-specific exports
- ✅ **Workstream E: Smarter Diffs & Change History**
  - Extraction history: tracks last 5 extractions in session
  - Improved diff generation: uses `createUnifiedDiff()` utility for line-aware diffs
  - Per-file diff selection: dropdown to select specific files in multi-file projects
  - New utility: `utils/diffUtils.ts` for unified diff generation
  - Updated `DiffView.tsx` and `OutputPane.tsx` with history navigation
- ✅ **Workstream F: Explain/Review Interaction Modes**
  - Three interaction modes: Extract (default), Explain, Review
  - Updated `aiService.ts`: all providers support interaction modes
  - UI controls in `SettingsModal.tsx` for mode selection
  - Model-specific guidance: prompts adapt based on selected model
- ✅ **AI Model Selection UX Improvements**
  - Enhanced model lists: added newer models (GPT-5, Claude 4, Gemini 3, etc.)
  - Visual indicator: `InputPane.tsx` shows provider/model/mode in compact pill
  - Better labels: human-readable model names
  - Model-specific guidance in prompts

See `PHASE_3_PLAN.md` for full details.

### File Organization

**Components** (`components/`)
- All React components are in the `components/` directory
- Each component is self-contained with its own types
- Icons are centralized in `icons.tsx`

**Utilities** (`utils/`)
- Pure utility functions
- No React dependencies
- Reusable across the application

**Services** (`services/`)
- Business logic and API integrations
- AI provider abstractions
- Stream processing

**Types** (`types/` and `types.ts`)
- Shared type definitions in `types.ts`
- Electron-specific types in `types/electron.d.ts`

### Build Process

1. **Copy Libraries**: All library files copied to `public/libs/` via `scripts/copy-libs.js`
   - Three.js: `public/libs/three/`
   - p5.js: `public/libs/p5/`
   - Babel Standalone: `public/libs/babel/`
   - React & ReactDOM: `public/libs/react/` (downloaded UMD builds)
2. **Compile Electron**: TypeScript → CommonJS → `.cjs` files
3. **Build React App**: Vite bundles the React application
4. **Package**: electron-builder creates the DMG (includes `public/libs/` in `extraResources`)

### Key Design Decisions

**Why CommonJS for Electron?**
- Electron's main process requires CommonJS
- ES modules cause issues with `require()` calls
- `.cjs` extension explicitly tells Node.js to use CommonJS

**Why Local Libraries?**
- **All Libraries Local**: Three.js, p5.js, Babel, React/ReactDOM all installed locally
- Avoids CDN dependency issues
- Works completely offline
- Consistent versioning across all users
- Better performance (no network latency)
- More reliable (no CDN outages)
- Better for desktop app

**Why Unified Copy Script?**
- Single script (`copy-libs.js`) manages all libraries
- Automated library setup during build
- Handles both npm packages and downloaded files
- Easy to extend for new libraries

**Why Babel Standalone?**
- Client-side TSX compilation
- No build step required
- Works in browser/iframe
- Supports React JSX transform
- Now loaded locally with CDN fallback

### AI Provider Abstraction

The `aiService.ts` provides a unified interface for all AI providers:
- Consistent API across providers
- Streaming support
- Error handling
- Progress updates

Each provider has its own implementation but follows the same interface.

### Code Analysis System

**Workflow:**
1. User pastes code → `htmlInput` state
2. User clicks Preview → `handlePreviewClick()` triggers `analyzeCode()`
3. Code analyzed for type, completeness, errors, wrapping needs
4. `CodeAnalysisPanel` displays results
5. User chooses action:
   - **Preview As-Is**: Code previewed without modifications
   - **Wrap & Preview**: Code wrapped in HTML structure, then previewed
   - **Extract**: AI extraction triggered

**Key Principles:**
- **No Automatic Wrapping**: Users must explicitly choose to wrap code
- **Informed Decisions**: Analysis explains why wrapping might be needed
- **Code Type Detection**: Automatically identifies HTML, React, Three.js, p5.js, etc.
- **Error Detection**: Finds syntax errors and missing dependencies before preview

**Wrapping Analysis:**
- Three.js/p5.js fragments need HTML structure
- JavaScript with DOM manipulation needs HTML container
- Complete HTML documents don't need wrapping
- React code is automatically compiled (no wrapping needed)

### State Management

Currently using React `useState` and `useCallback`:
- Simple and sufficient for current needs
- No external state management library
- Easy to understand and maintain

**State Flow:**
- `htmlInput`: Raw user input
- `codeAnalysis`: Analysis results from `analyzeCode()`
- `extractedCode`: Parsed/processed code for preview/extract
- `previewMode`: Determines how PreviewDisplay renders (vanilla/react/browser/canvas)

Consider Redux or Zustand if state becomes more complex.

## Important Files

### `App.tsx`
- Main application component
- Contains all top-level state
- Handles file uploads and extraction
- Manages tab navigation

### `PreviewDisplay.tsx`
- Complex component handling iframe preview
- Babel compilation for React
- Console capture
- Three.js integration

### `codeAnalyzer.ts`
- Code analysis and identification system
- Detects code type (HTML, React, Three.js, p5.js, etc.)
- Checks completeness (complete, fragment, snippet)
- Detects syntax errors and missing dependencies
- Analyzes wrapping needs
- Suggests preview mode
- Generates recommendations

### `CodeAnalysisPanel.tsx`
- Displays code analysis results
- Shows code type, completeness, errors, warnings
- Explains wrapping needs
- Provides action buttons (Preview As-Is, Wrap & Preview, Extract)

### `codeWrapper.ts`
- Code wrapping utilities (user-initiated only)
- Analyzes wrapping needs
- Wraps Three.js/p5.js code in HTML structure
- Never automatic - always user-controlled

### `aiService.ts`
- Core AI abstraction
- Stream processing
- Tag extraction
- Provider routing
- Interaction modes (Extract, Explain, Review)
- Model-specific guidance for all providers

### `electron/main.ts`
- Electron main process
- Window management
- Settings persistence
- IPC handlers

### `utils/diffUtils.ts`
- Unified diff generation utility
- Line-aware diff creation for better comparison
- Used by `DiffView.tsx` for extraction diffs

### `utils/exportHelpers.ts`
- Export file map builders for different presets
- Framework-specific exports (Vite React, Next.js)
- React component preset, vanilla widget preset
- Full project ZIP builder
- CDN fallback handling for libraries

### `components/OutputPane.tsx`
- Output display and export controls
- Extraction history navigation (last 5 extractions)
- Per-file diff selection for multi-file projects
- Framework-specific export buttons
- Tab management for Preview, Code, Diff, Analysis

## Common Issues & Solutions

### Preview Not Loading
- Check console for errors
- Verify Babel is loaded (for React preview)
- Check iframe sandbox permissions
- Ensure code is valid JavaScript
- Use code analysis to identify issues before preview
- Check if wrapping is needed (Three.js/p5.js fragments)

### AI Extraction Fails
- Verify API key
- Check network connection
- Try different model
- Check provider status

### Build Errors
- Ensure all dependencies installed
- Check TypeScript errors
- Verify Node.js version (18+)
- Clear `node_modules` and reinstall

### Electron Issues
- Check `dist-electron/` exists
- Verify `.cjs` files are present
- Check main process logs
- Ensure preload script loads

## Testing Checklist

Before releasing:
- [x] Test file upload (single and multiple)
- [x] Test code analysis system
- [x] Test preview modes (Browser/Vanilla/Canvas/React)
- [x] Test wrapping functionality (Three.js/p5.js)
- [x] Test all AI providers
- [x] Test all export formats
- [x] Test console functionality
- [x] Test code editing
- [x] Test file browser
- [x] Test analysis tab
- [x] Test settings persistence
- [x] Test keyboard navigation
- [x] Test responsive design
- [x] Test error handling

## Performance Considerations

### Large Files
- Files are loaded into memory
- Consider streaming for very large files
- Add file size limits if needed

### Multiple Files
- All files loaded into memory
- Consider lazy loading
- Optimize file tree rendering

### AI Streaming
- Stream processing is efficient
- UI updates progressively
- No blocking operations

## Security Notes

### API Keys
- Stored in electron-store (encrypted)
- Never exposed in code
- Not sent to external services (except API)

### Preview Isolation
- Runs in sandboxed iframe
- Limited permissions
- No access to main window
- All libraries loaded from local files (no external requests)

### Content Security
- CSP headers in preview
- Input validation
- Error sanitization

## Future Improvements

### Short Term
- Better error messages
- Performance optimizations
- More file type support
- Additional framework presets (Svelte, Vue, Astro)

### Long Term
- Project templates
- Component library integration
- Version control integration
- Collaborative features
- Richer extraction history features

## Dependencies

### Critical
- `react` - UI framework
- `electron` - Desktop app
- `vite` - Build tool
- `typescript` - Type safety

### Important
- `react-syntax-highlighter` - Code display
- `electron-store` - Settings
- `jszip` - ZIP export
- `three` - 3D graphics (bundled locally)
- `p5` - Creative coding library (bundled locally)
- `@babel/standalone` - Client-side TSX compilation (bundled locally)

### Optional
- `react-diff-view` - Diff visualization (now actively used)
- `prismjs` - Syntax highlighting engine

### Local Library Files
All libraries are copied to `public/libs/` during build:
- `public/libs/three/` - Three.js files
- `public/libs/p5/` - p5.js library
- `public/libs/babel/` - Babel Standalone
- `public/libs/react/` - React & ReactDOM UMD builds

## Browser Compatibility

### Desktop App
- Mac OS (Intel & Apple Silicon)
- Electron 30
- Chromium-based

### Web Mode (if used)
- Modern browsers only
- Chrome, Firefox, Safari, Edge
- ES6+ support required

## Known Limitations

1. **File Size**: Large files may cause performance issues
2. **AI Models**: Some models may not support all features
3. **Preview**: Complex Three.js scenes may not render perfectly
4. **Offline**: Preview works offline (all libraries local), requires internet for AI providers (except Ollama)
5. **Platform**: Currently Mac-only (can be extended)

## Contributing

When adding features:
1. Follow existing code style
2. Add TypeScript types
3. Update documentation
4. Test thoroughly
5. Update CHANGELOG.md

## License

MIT License - See LICENSE file for details

---

For user instructions, see [INSTRUCTIONS.md](./INSTRUCTIONS.md)  
For technical details, see [ARCHITECTURE.md](./ARCHITECTURE.md)  
For getting started, see [docs/getting-started.md](./docs/getting-started.md)

