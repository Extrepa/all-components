# IMPROVEMENT_PLAN.md
This document is a concrete plan to evolve the current Universal Component Extractor implementation according to the recent recommendations. It is written for future AI assistants (Cursor, Warp, etc.) and for humans working on this repo.

We use Warp primarily for interactive discussion, planning, and high-level guidance, and apply the actual code changes in an editor/IDE (such as Cursor) using this plan as the implementation script.

## 1. Goals
- Make preview-mode detection consistent and centralized so that all workflows (manual paste, examples, AI extraction) behave the same.
- Keep App.tsx maintainable by extracting focused subcomponents without changing current behavior.
- Clarify and slightly polish multi-file workflows so users understand how Preview vs Extract works with projects.
- Improve error visibility and developer feedback around preview/runtime issues.
- Keep existing behavior and tests passing throughout; changes should be incremental and easy to roll back.

## 2. Current State (High-Level)
- App.tsx is the main orchestrator. It manages:
  - htmlInput and uploadedFiles
  - extractedCode, previewMode, mainTab, activeTab
  - codeAnalysis, showAnalysisPanel
  - all modals (Settings, Welcome, KeyboardShortcuts, CancelWarning)
  - preview logs and wiring to PreviewDisplay and ConsolePanel
- Static analysis uses utils/codeAnalyzer.ts and CodeAnalysisPanel:
  - handlePreviewClick calls analyzeCode(htmlInput)
  - CodeAnalysisPanel lets the user choose Preview As-Is, Wrap & Preview, or Extract
  - parseCodeForPreview lives in App.tsx and implements its own detection and splitting into ExtractedCode
- AI extraction uses services/aiService.ts and utils/contentAggregator.ts:
  - handleProcessClick chooses between htmlInput and createCombinedInput(uploadedFiles)
  - extractComponentFromHtml streams HTML/CSS/SCSS/TSX/JS/explanation/etc.
  - App.tsx merges streaming partials into extractedCode and auto-adjusts previewMode and tabs based on framework and content
- PreviewDisplay.tsx is a sophisticated preview engine:
  - Debounces HTML/CSS/JS/TSX
  - Generates full HTML documents with CSP, console bridge, React + Babel, Three.js/p5.js loaders, and canvas/vanilla/browser modes
  - Uses blob URLs for ES module compatibility
  - Sends logs and scene export messages back to the parent
- Multi-file support is first-class for extraction but only loosely integrated with the Preview/analysis path (Preview acts only on htmlInput today).

## 3. Workstreams Overview

### 3.0 Completed So Far
- Created `WARP.md` with:
  - Core dev/build/test commands.
  - High-level architecture and runtime flow descriptions (including how Preview vs Extract work today).
  - AI provider configuration notes and documentation entry points.
- Created this `IMPROVEMENT_PLAN.md` to coordinate future structural and behavioral changes.

These documentation steps partially cover the "documentation" items mentioned later in Workstreams 3 and 4; remaining work there is primarily UX and behavior changes plus keeping docs in sync.

### 3.1 Implementation Status

✅ **Workstream 1: Preview-mode logic unification** - **COMPLETE** (November 2025)
  - Removed framework detection from `parseCodeForPreview` - now only splits code
  - All preview mode decisions flow through `codeAnalyzer.suggestedPreviewMode` (preview path) or `detectPreviewModeFromExtracted` (post-extraction path)
  - Example buttons already use `analyzeCode` correctly
  - All tests passing (68/68)

✅ **Workstream 2: App.tsx structural refactor** - **COMPLETE**
  - `InputPane` and `OutputPane` components created and integrated
  - Clean separation between orchestration (App.tsx) and presentation (panes)
  - Business logic remains in App.tsx

✅ **Workstream 3: Multi-file workflow clarity** - **COMPLETE**
  - UI hint added: "Preview shows textarea only; Extract uses all uploaded files."
  - Clear indication when `uploadedFiles.length > 0`

✅ **Workstream 4: Preview console and error-surface** - **COMPLETE**
  - ConsolePanel always visible with empty state
  - Runtime errors surfaced in logs
  - Error badges in multiple places (ConsolePanel, OutputPane, PreviewDisplay)

There are four main improvement workstreams, which can be done largely in order.

1. Preview-mode logic unification and simplification ✅ **COMPLETE**
2. App.tsx structural refactor into focused panes ✅ **COMPLETE**
3. Multi-file workflow clarity and UX tweaks ✅ **COMPLETE**
4. Preview console and error-surface improvements ✅ **COMPLETE**

Each workstream is described below with concrete steps and benefits.

## 4. Workstream 1: Unify Preview-Mode Detection (Status: Implemented)

### 4.1 Problem
Preview mode is currently detected in several places:
- `detectAndSetPreviewMode` in App.tsx (for example buttons)
- `parseCodeForPreview` in App.tsx (preview-only path)
- `analyzeCode.suggestedPreviewMode` in `utils/codeAnalyzer.ts`
- Streaming callback in `handleProcessClick` (auto-switching during AI extraction)
- `detectPreviewModeFromExtracted` in `handleProcessClick` (final pass after extraction)

This makes it harder to reason about which behavior is authoritative and increases the chance of inconsistent behavior between workflows.

### 4.2 Desired State
- `codeAnalyzer` is the primary source of truth for preview suggestions when starting from raw code.
- The streaming AI `framework` hint (`ExtractedCode.framework`) plus actual content (`vanillaJs` vs `tsx`, Three.js vs React) remains the authority for post-extraction preview choices.
- Example buttons use the same `analyzeCode` path as manual input, rather than bespoke heuristics.
- `parseCodeForPreview` focuses on splitting HTML/CSS/JS/TSX and leaves preview-mode decisions to analysis results passed in.

### 4.3 Concrete Steps
1. **Example buttons**
   - In `App.tsx`, update the `EXAMPLE_CODES` `onClick` handler.
   - After `setHtmlInput(example.code)`, call `analyzeCode(example.code)` and set `previewMode` from `analysis.suggestedPreviewMode`.
   - Remove direct category-based heuristics from `detectAndSetPreviewMode` or narrow it to only handle the special case where analysis is not available.

2. **`parseCodeForPreview`**
   - Keep its responsibility limited to:
     - Optional wrapping (via `isThreeJsCode` / `isP5JsCode` / `wrapThreeJsCode` / `wrapP5JsCode`).
     - Splitting into HTML/CSS/JS/TSX inside an `ExtractedCode` structure.
   - Stop trying to fully classify framework and `previewMode` here; rely on either:
     - `codeAnalysis.suggestedPreviewMode` for the preview path.
     - `detectPreviewModeFromExtracted` for the post-extraction path.

3. **Static preview path (Preview As-Is / Wrap & Preview)**
   - For `handlePreviewAsIs` and `handleWrapAndPreview`, always use `codeAnalysis.suggestedPreviewMode` for `setPreviewMode` instead of duplicating logic.

4. **Remove or reduce duplicated ad hoc preview detection logic**
   - Where `previewMode` is set based purely on substrings in `App.tsx` outside of analysis or `extractedCode` content, try to replace those calls with:
     - `analyzeCode` for raw-input starting points.
     - `detectPreviewModeFromExtracted` or framework/content checks for post-extraction cases.

### 4.4 Benefits
- Single authoritative set of rules for initial classification (`codeAnalyzer`) and for post-extraction preview logic.
- Less fragile substring checks scattered through `App.tsx`.
- Easier to add new code types or preview modes in the future by updating one place instead of several.

## 5. Workstream 2: Refactor App.tsx into Focused Panes (Status: Implemented)

### 5.1 Problem
`App.tsx` is very long and owns many responsibilities:
- Input area and drag/drop
- File upload management
- Example code insertion
- Static analysis and analysis panel control flow
- AI extraction orchestration and streaming state updates
- Preview wiring and `previewMode` switching
- Export actions (ZIP, HTML, JSON, TSX, JS, scene export)
- Multiple modals and keyboard shortcuts

This makes the file hard to navigate and increases the accidental coupling between unrelated concerns.

### 5.2 Desired State
- `App.tsx` remains the main state owner and coordinator but delegates UI regions to smaller components.
- Two main visual regions:
  - `InputPane` (left side)
  - `OutputPane` (right side)
- Shared state is passed down explicitly as props and callbacks.
- No change in external behavior or keyboard shortcuts.

### 5.3 Proposed New Components

1. **InputPane**
   - Encapsulates:
     - Textarea
     - Drag-and-drop area and file input trigger
     - Example code buttons
     - Preview / Extract / Clear controls
     - Error banner
     - `CodeAnalysisPanel` mounting and callbacks
     - Explanation modal surface (or a dedicated small subcomponent)
   - Receives from `App.tsx`:
     - `htmlInput`, `setHtmlInput`
     - `isLoading`, `error`, `setError`
     - `uploadedFiles`, `importedFileName`, `fileInputRef`
     - `codeAnalysis`, `showAnalysisPanel` flags and handlers
     - Preview-related callbacks: `handlePreviewClick`, `handlePreviewAsIs`, `handleWrapAndPreview`, `handleExtractFromAnalysis`
     - Example code data or at least `EXAMPLE_CODES`

2. **OutputPane**
   - Encapsulates:
     - MainTab switching (Code Browser / Extracted Code / Analysis)
     - `CodeBrowser` rendering based on `uploadedFiles`
     - Extracted code card including:
       - Live Preview section (`PreviewDisplay` and its controls)
       - Export buttons
       - Code tabs and `CodeDisplay`
       - `CodeAnnotations`
       - `AnalysisTab`
   - Receives from `App.tsx`:
     - `extractedCode`, `previewMode`, `setPreviewMode`
     - `componentName`, `setComponentName`
     - `mainTab`, `setMainTab`, `activeTab`, `setActiveTab`
     - `previewLogs`, `setPreviewLogs`
     - `uploadedFiles`, `activeFileId`, `setActiveFileId`
     - All download helpers (or a small export helper object)

### 5.4 Migration Strategy
1. Introduce `InputPane` and `OutputPane` side by side while keeping `App.tsx` exports intact.
2. Move JSX for each column into the new components, pass required props from `App.tsx`.
3. Keep business logic (`handleProcessClick`, `handleSaveSettings`, `parseCodeForPreview`, `handleDownloadX`) in `App.tsx` initially.
4. After tests pass and manual QA looks good, consider moving very UI-specific handlers down into the panes for cleanliness if desired.

### 5.5 Benefits
- `App.tsx` becomes easier to reason about, with a clear separation between orchestration and presentation.
- Local changes to input or output UI become safer and require touching fewer lines.
- AI-assisted tools like Cursor can more safely operate on narrower components without accidentally affecting centralized orchestration logic.

## 6. Workstream 3: Multi-File Workflow Clarity (Status: Implemented)

### 6.1 Problem
- Multi-file projects are well supported during extraction via `createCombinedInput` and `contentAggregator`.
- Preview (and analysis) currently focus only on `htmlInput` and ignore `uploadedFiles`.
- The UX could confuse users who upload multiple files and expect Preview to act on the whole project.

### 6.2 Options

1. **Documented behavior (simpler)**
   - Keep Preview scoped to `htmlInput` and treat multi-file support as an Extract-only feature.
   - Add subtle UI hints when `uploadedFiles.length > 0` (e.g., a short label near the Preview button) to clarify that Extract will use all uploaded files, but Preview will only show the current textarea contents.

2. **Project-level preview (heavier change)**
   - Create a new utility (e.g., `buildPreviewContentFromFiles`) that:
     - Uses `contentAggregator` or a similar mechanism to construct runnable HTML/CSS/JS for preview.
     - Feeds that combined content into `analyzeCode` for the analysis panel and `parseCodeForPreview` for `ExtractedCode`.
   - Adjust `handlePreviewClick` to branch when `uploadedFiles.length > 0`.

### 6.3 Recommended Approach
- Start with Option 1 (documented behavior and small UI nudge) to avoid conflating extraction prompts with preview execution.
- If demand grows for true project-level preview, introduce Option 2 in a separate iteration.

### 6.4 Concrete Steps (for Option 1)
1. In the input control strip near Preview, conditionally render a short hint when `uploadedFiles.length > 0`, such as:
   - “Preview shows textarea only; Extract uses all uploaded files.”
2. Optionally, disable Wrap & Preview or show an info tooltip when multi-file projects are present to avoid confusion about what exactly is being wrapped.
3. Ensure `WORKFLOW_USER.md` and related docs mention this behavior explicitly.
   - Note: `WARP.md` already documents that Preview analyzes `htmlInput` only and Extract uses multi-file input; keep it in sync with any UX changes here.

### 6.5 Benefits
- Users understand which features are project-aware vs single-snippet.
- No risk of breaking existing extraction behavior.
- Leaves room for a more advanced project preview later without committing to it immediately.

## 7. Workstream 4: Preview Console and Error Surface (Status: Implemented)

### 7.1 Problem
- Runtime errors are shown nicely in the preview overlay inside the iframe, but the left-side `ConsolePanel` appears only when there are logs, and the user might not always notice new errors without looking at the preview area.
- There is no persistent indicator in the main UI that the preview has a current error state.

### 7.2 Desired State
- `ConsolePanel` presence is predictable (always visible or easily discoverable).
- Runtime errors in the preview clearly surface in both the preview overlay and the external console.
- A subtle but visible error indicator in the main layout makes it obvious when previewed code is failing.

### 7.3 Concrete Steps
1. **ConsolePanel visibility**
   - Adjust `App.tsx` so that `ConsolePanel` is always rendered but can show an “empty” state when there are no logs.
   - For example, render a small header with a log count, and show an empty message when `previewLogs.length === 0`.

2. **Error badges**
   - When `runtimeError` is set in `PreviewDisplay`, include a dedicated error-level `LogEntry` such as “Runtime Error in Preview” with the error message.
   - `App.tsx` already gets logs via `onLogsChange`; use these to:
     - Show a small badge or color indicator near the `ConsolePanel` header when there is at least one recent error.
     - Optionally mirror that badge near the “Live Preview” heading in the Extracted tab.

3. **Documentation alignment**
   - Keep `WARP.md` and other docs in sync with any new console/error-surface behavior (e.g., always-visible ConsolePanel, error badges).

### 7.4 Benefits
- Faster debugging of user code issues (quicker feedback loop).
- Less chance that users miss silent failures when only looking at rendered output.
- Clearer separation between AI extraction errors and runtime preview errors.

## 8. Testing and Safety Practices
- Always run at least the following before and after structural changes:
  - `npm run test:run`
  - `npm run build:electron`
- For preview- and extraction-related changes, it is especially useful to run:
  - `tests/utils/fileTypeDetector.test.ts`
  - `tests/utils/contentAggregator.test.ts`
  - `tests/services/aiService.test.ts`
  - `tests/integration/extraction.test.ts`
- After modifying `PreviewDisplay` or `App.tsx` preview logic, manually verify at least:
  - One simple HTML snippet in Browser mode
  - One vanilla JS component in Vanilla mode
  - One React TSX component in React mode
  - One Three.js or p5.js example in Canvas mode, including scene export.

## 9. Suggested Execution Order (Game Plan)
1. **Preview-mode unification (Workstream 1)**
   - Start with example buttons using `analyzeCode.suggestedPreviewMode`.
   - Simplify `parseCodeForPreview` so that it only splits code and relies on external analysis for `previewMode`.
   - Keep detection functions like `detectPreviewModeFromExtracted`, but ensure they are the only place doing post-extraction classification.
   - Run tests and manually verify example workflows.

2. **Console and error-surface improvements (Workstream 4)**
   - Make `ConsolePanel` always visible with an empty state.
   - Ensure `runtimeError` in `PreviewDisplay` mirrors into `previewLogs` with a clear error entry.
   - Add subtle error badges based on logs.
   - Re-run preview-related manual tests and confirm errors are obvious.

3. **App.tsx refactor into InputPane and OutputPane (Workstream 2)**
   - Introduce new components and move JSX into them while leaving logic in `App.tsx`.
   - Carefully pass props and callbacks; use TypeScript types to enforce correct wiring.
   - Run full test suite and perform manual smoke tests.

4. **Multi-file UX clarity (Workstream 3)**
   - Add on-screen hints about Preview vs Extract behavior when `uploadedFiles.length > 0`.
   - Update `WORKFLOW_USER.md` and `WARP.md` accordingly.
   - Optionally, in a later phase, explore a true project-level preview mode if needed.

Executing in this order ensures that behavioral changes to preview detection and error visibility happen before structural refactors, which minimizes the risk of chasing bugs across multiple moving parts at once.

## 10. How Future AI Assistants Should Use This Plan

### 10.1 Warp (terminal / discussion agents)
- Use this plan to structure conversations and decide which workstream to tackle next.
- Stay mostly in “discussion and planning” mode: explain tradeoffs, outline diffs, and suggest concrete steps, but avoid making large, speculative edits without the user’s confirmation.
- When invoking tools that change files, keep changes narrowly scoped to the current workstream and clearly describe what was done so that an editor like Cursor can pick up from there.

### 10.2 Cursor or Editor-Integrated AIs
- Treat this plan as an execution script: implement one workstream at a time (or one subsection) and verify tests between steps.
- When asked to “improve preview behavior” or “refactor App.tsx”, first locate the relevant workstream and follow its Concrete Steps verbatim unless the user explicitly wants a deviation.
- Avoid mixing workstreams in a single large change; prefer small, reviewable PR-sized chunks.
- After behavioral changes (especially around preview modes and extraction flows), run the recommended tests in section 8 and update `WARP.md` / docs where the plan calls for it.
- Keep any new detection or classification logic centralized (in `codeAnalyzer` or a dedicated helper) rather than scattering heuristics across multiple components.
