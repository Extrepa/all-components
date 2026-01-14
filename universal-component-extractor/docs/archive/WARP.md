# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Core Commands

### Installation & Setup
- Install dependencies:
  - `npm install`
- (Optional but recommended) Copy local preview libraries (Three.js, p5.js, Babel, React UMD builds):
  - `npm run copy-libs`

### Development
- Web dev server only (browser preview):
  - `npm run dev`
- Full desktop dev (Electron + Vite, recommended way to work on the app):
  - Terminal 1: `npm run dev`
  - Terminal 2: `npm run electron:dev`
  - `electron:dev` uses `concurrently` and `wait-on` to start Electron after Vite is ready.
- Static preview of a production build:
  - `npm run preview`

### Build
- Build Electron main process + renderer bundle (no installer):
  - `npm run build:electron`
- Full production build + macOS `.dmg` via electron-builder:
  - `npm run build`
- Build output layout:
  - Web bundle: `dist/`
  - Electron main/preload: `dist-electron/`
  - Packaged app / installer: `dist/*.dmg`

### Testing (Vitest)
- Watch mode (default dev test command):
  - `npm test`
- Run full suite once:
  - `npm run test:run`
- Coverage report:
  - `npm run test:coverage`
- Vitest UI:
  - `npm run test:ui`

#### Running a single test / subset of tests
Vitest is wired through the `test` script; use `--` to forward args:
- Run tests from a single file:
  - `npm test -- tests/utils/fileTypeDetector.test.ts`
- Run a single test by name (pattern):
  - `npm test -- -t "should detect HTML files"`

## High-Level Architecture

### Overview
- Desktop-first app built with **Electron + React + Vite + TypeScript**.
- Core responsibilities:
  - Ingest user code (paste or file upload, including multi-file projects).
  - Analyze the code to determine type/completeness and preview strategy.
  - Use a pluggable AI layer to extract/transform into clean components.
  - Render live previews in different modes (browser/vanilla/canvas/react).
  - Export results as standalone HTML, TSX/JS/CSS files, ZIPs, JSON, or 3D scene data.

The repo is intentionally monolithic (no `src/` folder); React UI, utilities, and Electron code live at the top level alongside domain-specific subfolders.

### Directory & Responsibility Map

- `App.tsx`
  - Top-level React component and primary state container.
  - Orchestrates file upload, code analysis, preview state, AI extraction, and export.
- `components/`
  - Presentational and interaction components for the main workflows:
    - **PreviewDisplay** – iframe-based rendering pipeline for browser/vanilla/canvas/react modes, including library loading, Babel compilation for React, console capture, and blob-URL sandboxing.
    - **CodeBrowser / FileTree** – multi-file navigation, syntax-highlighted viewing, search, and per-file metadata.
    - **AnalysisTab / CodeAnalysisPanel** – human-readable AI and static-analysis output, recommendations, and action buttons (Preview As-Is, Wrap & Preview, Extract).
    - **ConsolePanel** – unified console output from previews, with filtering and stack traces.
    - **SettingsModal / Welcome/KeyboardShortcuts/CancelWarning** – AI provider configuration, onboarding, and UX helpers.
- `services/aiService.ts`
  - Single abstraction over all AI providers (Ollama, Gemini, OpenAI, Anthropic).
  - Exposes `extractComponentFromHtml` as the main entrypoint; internally fans out to provider-specific functions that:
    - Stream model output.
    - Parse tagged sections (HTML/CSS/SCSS/TSX/JS + explanation/analysis).
    - Update the `ExtractedCode` structure incrementally.
  - This is the main integration point when adding/changing AI providers or models.
- `utils/`
  - Pure-domain helpers; most logic-heavy code outside React lives here:
    - **fileTypeDetector.ts** – classify files (html/css/scss/js/tsx/json/3js/unknown), choose syntax-highlighting language, group files by category.
    - **contentAggregator.ts** – combine multiple files into a single AI prompt: builds a file-structure description, detects dependencies, and orders scripts.
    - **codeAnalyzer.ts** – static analysis on pasted code to infer type (HTML/React/Three.js/p5.js/etc.), completeness (complete/fragment/snippet), probable errors, dependencies, wrapping needs, and suggested preview mode.
    - **codeWrapper.ts** – generate explicit HTML wrappers for Three.js, p5.js, and vanilla fragments (only when user chooses Wrap & Preview).
    - **exampleCode.ts, performance.ts, errorHandler.ts** – example snippets, perf instrumentation, and shared error-handling utilities.
- `electron/`
  - **main.ts** – Electron main process: window lifecycle, wiring to load the Vite dev server or built app, packaging config entry.
  - **preload.ts** – secure IPC bridge exposing a minimal `window.electronAPI` surface for settings (get/save) and similar operations.
  - `tsconfig.json` – compiled by `tsc` to CommonJS (`dist-electron/*.cjs`); a post-build script renames compiled `.js` to `.cjs` for Electron.
- `public/libs/`
  - Not committed by default; populated by `npm run copy-libs` from `node_modules`.
  - Holds local copies of Three.js, p5.js, Babel Standalone, React/ReactDOM UMD builds, etc., to support offline preview and deterministic versions.
- `tests/`
  - Vitest suite organized by domain:
    - `tests/utils/*` – unit tests for utilities like `fileTypeDetector` and `contentAggregator`.
    - `tests/services/aiService.test.ts` – provider abstraction tests.
    - `tests/integration/extraction.test.ts` – end-to-end extraction workflows.
    - `tests/setup.ts` – shared test config, JSDOM/env setup.

### Core Runtime Flows

#### 1. Code Analysis & Preview (no AI)
1. User pastes code or uploads files; `App.tsx` stores these in `htmlInput` / `uploadedFiles`.
2. User clicks **Preview**:
   - `handlePreviewClick` calls `analyzeCode` (from `codeAnalyzer.ts`) on `htmlInput` only.
   - **Note**: Preview only analyzes the textarea content (`htmlInput`), not `uploadedFiles`. This is by design: Preview is for quick single-file testing, while Extract handles multi-file projects.
   - Result (`CodeAnalysis`) feeds **CodeAnalysisPanel**, which surfaces:
     - Detected code type and completeness.
     - Errors/warnings and missing dependencies.
     - Whether wrapping is recommended and why.
     - Recommended preview mode.
3. Based on user choice:
   - **Preview As-Is** → `parseCodeForPreview` builds an `ExtractedCode`-like structure without modification.
   - **Wrap & Preview** → `codeWrapper` constructs an HTML shell (Three.js/p5.js/vanilla) before passing to preview.
4. **PreviewDisplay** renders via an iframe with a blob URL:
   - Injects local library scripts or ES modules from `public/libs`.
   - For React/TSX, runs Babel Standalone to compile and then mounts via ReactDOM.
   - Captures `console` output and errors into **ConsolePanel**.

This flow is the best place to hook into if you need to change preview behavior, CSP, or sandboxing.

#### 2. AI Extraction Flow
1. Input is either a single pasted snippet or aggregated multi-file project:
   - If `uploadedFiles.length > 0`, `createCombinedInput` aggregates all files via `contentAggregator`.
   - Otherwise, uses `htmlInput` directly.
   - `contentAggregator` groups files, detects npm-style dependencies, and emits a structured prompt body.
2. `App.tsx` calls `extractComponentFromHtml` in `aiService.ts` with:
   - Aggregated content (all files if multi-file, or single textarea content).
   - Current AI settings (provider, model, options) from **SettingsModal**.
3. `aiService` selects the provider-specific path (Gemini/OpenAI/Anthropic/Ollama):
   - Initiates a streaming request.
   - Parses tagged sections from the stream to progressively build an `ExtractedCode` object (HTML/CSS/SCSS/TSX/vanilla JS + explanation/analysis metadata).
4. `App.tsx` keeps `extractedCode` in state and passes it to:
   - **PreviewDisplay** – to show the live component.
   - **CodeDisplay / AnalysisTab** – to show code and AI explanations.
5. Export controls (single HTML, ZIP, JSON, TSX/JS/CSS, 3D scene JSON) read from `extractedCode` and synthesized metadata.

When modifying extraction behavior or adding new output formats, prefer updating `aiService` and the export helpers rather than scattering provider-specific logic through components.

### Electron Integration
- Development:
  - `npm run dev` serves the React app with Vite.
  - `npm run electron:dev` ensures libraries are copied, waits for `http://localhost:3000`, then launches Electron pointing at the dev server.
- Production:
  - `npm run build:electron` compiles Electron TypeScript to CommonJS (`dist-electron/*.cjs`), copies libs, and runs `vite build`.
  - `electron-builder` (via `npm run build`) packages both `dist/` and `dist-electron/` into a macOS `.dmg`, bundling `public/libs` into the app via `extraResources`.
- IPC surface is intentionally small; when adding new native capabilities, extend the preload bridge and associated type definitions in `types/electron.d.ts`.

### AI Provider Configuration
- All provider settings live in the **SettingsModal** (⚙️ in the UI), wired through `App.tsx` into `services/aiService.ts`.
- Providers supported via `aiService.ts`:
  - **Ollama** (local, no API key; default recommended provider).
  - **Gemini**, **OpenAI**, **Anthropic** (require API keys and model selection).
- In Electron builds, settings (including API keys) are persisted via `electron-store` from the main process; in web mode, they are stored in `localStorage`.
- When changing how settings are stored or adding providers/models, update both `SettingsModal.tsx` and `aiService.ts`, and keep tests in `tests/services/aiService.test.ts` in sync.

## Key Documentation Entry Points
- `README.md` – project overview, feature list, high-level install/build instructions.
- `ARCHITECTURE.md` – detailed architecture, technology stack, and runtime flows.
- `WORKFLOW_USER.md` – end-user workflows and feature walkthroughs.
- `WORKFLOW_DEVELOPER.md` – developer workflow, build/test commands, and release process.
- `docs/getting-started.md` – step-by-step setup, including Ollama and API provider configuration.
- `docs/testing.md` – exhaustive manual and automated testing matrices (preview modes, providers, exports).
- `docs/build-tools.md` – rationale for Vite/Electron/Vitest and build-tool comparisons.
- `docs/README.md` – index of the above and other auxiliary docs.

## How Future Warp Agents Should Work Here

- Prefer editing **React components and utilities** rather than inlining logic into `App.tsx`; keep `App.tsx` as coordinator, not a dumping ground for business logic.
- For AI-related changes, centralize behavior in `services/aiService.ts` and reuse the streaming/tag-parsing conventions already in place.
- For anything related to preview behavior, sandboxing, or library loading, start with `PreviewDisplay.tsx` and the helpers it uses in `utils/`.
- Use Vitest tests under `tests/` as executable documentation of expected behavior, especially for file detection, aggregation, and AI extraction flows; when changing these areas, update or add tests in the matching subfolder.
- When build or packaging changes are needed, respect the existing flow encoded in `scripts/copy-libs.js`, `scripts/rename-electron.js`, `vite.config.ts`, and `package.json`'s `build`/`build:electron` definitions instead of introducing parallel build paths.
