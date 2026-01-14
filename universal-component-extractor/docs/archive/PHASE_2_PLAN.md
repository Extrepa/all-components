# PHASE_2_PLAN.md

This document outlines Phase 2 improvements for the Universal Component Extractor now that the core preview/extraction UX and console surface are in a good state.

## 1. Goals
- Improve **extraction quality** and make AI behavior more controllable.
- Add a **Before vs After Diff View** so users can see what changed.
- Polish **export ergonomics** and presets so common downstream use cases are one click away.
- Keep the system stable: small, reviewable changes with tests between each chunk.

## 2. Workstream A – Extraction Quality & Prompt Tuning

### A.1 Problem / Opportunity
- `services/aiService.ts` already abstracts multiple providers, but:
  - Prompts are not yet tailored per provider and per use case (simple HTML vs React vs Three.js, etc.).
  - Users have little control over extraction “style” (e.g., very opinionated refactor vs minimal cleanup).

### A.2 Desired State
- Clear, documented prompting strategy per provider:
  - Ollama: default, cost-free local developer mode.
  - OpenAI / Anthropic / Gemini: tuned for richer explanations and more advanced refactors.
- Optional extraction “modes” in Settings or a small toggle near Extract:
  - **Minimal** – keep structure, fix obvious issues, light cleanup.
  - **Refactor** – modernize code (TSX, hooks, CSS variables, etc.).
  - (Optional later) **Explain** – more analysis, less transformation.

### A.3 Concrete Steps
1. **Audit current prompts**
   - Read `services/aiService.ts` and the existing provider-specific prompt templates.
   - Summarize how each provider is currently asked to produce HTML/CSS/TSX/JS/explanation.

2. **Define prompt variants per mode**
   - For each provider, design small prompt fragments for:
     - Minimal vs Refactor mode.
   - Keep the existing tag format (`<html>...</html>`, etc.) to avoid breaking the stream parser.

3. **Wire modes into Settings / UI**
   - Add an “Extraction Style” field in `SettingsModal` (or a smaller per-extract toggle if you prefer):
     - Minimal | Refactor (default: Refactor).
   - Pass this option through `AISettings` into `aiService.ts`.

4. **Adjust `aiService.ts` to branch on mode**
   - In `extractComponentFromHtml`, include the style hint in the prompt.
   - For example: "Mode: Minimal" vs "Mode: Refactor" plus short bullet points of expectations.

5. **Tests & manual checks**
   - Update `tests/services/aiService.test.ts` to cover both modes at least at the prompt-construction level.
   - Manual smoke tests:
     - Extract the same snippet in Minimal vs Refactor and confirm behavior differences are visible.

### A.4 Benefits
- More predictable and controllable AI output.
- Easier to add new styles later (e.g., “teaching”, “optimize for performance”).
- Per-provider tuning without losing the single abstraction.

## 3. Workstream B – Before/After Diff View

### B.1 Problem / Opportunity
- Users can see the original code (textarea / uploads) and the extracted code, but not a direct diff.
- `react-diff-view` is already in dependencies but not fully leveraged.

### B.2 Desired State
- A **Diff tab** that shows a side-by-side or inline diff between:
  - Original source (for the main file or aggregated input).
  - Extracted TSX or HTML/CSS/JS.
- Clear indication of what was added, removed, and changed.

### B.3 Concrete Steps
1. **Choose a diff target**
   - Start with a simple, focused default:
     - Compare textarea input vs extracted TSX when `codeType` is React.
     - Compare textarea input vs extracted HTML/CSS/JS for HTML/vanilla cases (can start with HTML-only).

2. **Add a Diff tab to the Extracted section**
   - In `OutputPane`, add a tab (e.g., “Diff”) alongside HTML/CSS/TSX/JS tabs or as a sibling to the “Analysis” tab.
   - Use `react-diff-view` to render diffs (inline view is fine as a first step).

3. **Source selection logic**
   - Store the original textarea content used for the current extraction (e.g., in `extractedCode.originalSource` or separate state).
   - For multi-file uploads, start with a simple behavior:
     - Either disable Diff, or show diff for the “primary” file only (later you can expand to per-file diffs).

4. **Minimal UX polish**
   - Show a short note when diff is unavailable (e.g., user loaded only JSON, or we don’t have a source snapshot).
   - Keep the diff performance-conservative; truncate extremely large diffs or show a warning.

5. **Tests & manual checks**
   - Add unit tests for any helper utilities used to prepare diff inputs.
   - Manual smoke test on:
     - Simple HTML card.
     - React component.
     - Three.js example (even if Diff is disabled or limited there, confirm behavior).

### B.4 Benefits
- Transparency: users see exactly what the AI changed.
- Trust-building: easier to adopt the tool in serious workflows.
- Debuggability: easier to spot incorrect refactors.

## 4. Workstream C – Export Ergonomics & Presets (Status: Implemented)

### C.1 Problem / Opportunity
- Export is powerful but generic:
  - ZIP contains multiple files with basic naming.
  - Users often want common target shapes (React-only, vanilla widget, etc.).

### C.2 Desired State
- A small set of export “presets” tailored to typical destinations:
  - **React Component** – just `.tsx` + minimal CSS.
  - **Vanilla Widget** – HTML + JS + CSS ready to drop into a static site.
  - **Full Project ZIP** – what you already have today.
- Clear naming and structure for files in ZIPs.

### C.3 Concrete Steps (Implemented)
1. **Audit current exports**
   - Review `handleDownloadZip`, `handleDownloadSingleHtml`, `handleDownloadJson` in `App.tsx` (and their wiring in `OutputPane`).
   - Document the current ZIP structure and naming.

2. **Define presets**
   - Decide on 2–3 presets to expose in the UI, for example:
     - "React Component (.tsx + CSS)"
     - "Vanilla Widget (index.html + JS + CSS)"
     - "Full Project (.zip, current behavior)"

3. **Add preset controls to the UI**
   - Under the existing export buttons in `OutputPane`, add a small “Presets” dropdown or segmented control.
   - Wire each preset to a helper function that assembles the right files/names.

4. **Refactor export helpers**
   - Extract helper functions from `App.tsx` into a small export utility (e.g., `utils/exportHelpers.ts`) to:
     - Build ZIP contents for each preset.
     - Keep the main component lean.

5. **Tests & manual checks**
   - Add unit tests around the new export helpers: given an `ExtractedCode`, confirm the ZIP file list / HTML structure.
   - Manual QA: download each preset and drop it into a tiny test project (React app, static HTML, etc.).

### C.4 Benefits
- Faster hand-off from extraction to real projects.
- Less friction for common workflows (copying into a React app vs static HTML page).
- Cleaner, more predictable exported structures.

## 5. Suggested Execution Order for Phase 2 (Status: Implemented)
1. **Stabilize Phase 1 (already in progress)**
   - Ensure all tests and builds pass.
   - Run a small manual matrix over preview modes and multi-file workflows.

2. **Implement Workstream A (Extraction Quality & Modes)**
   - Start with prompt auditing and a simple two-mode toggle (Minimal/Refactor).
   - Verify prompts and settings wiring, then add tests.

3. **Implement Workstream B (Diff View)**
   - Start with textarea vs TSX diff for React, then expand as needed.
   - Keep performance and UX simple for the first iteration.

4. **Implement Workstream C (Export Presets)**
   - Start with 2–3 presets wired to helper functions.
   - Once stable, refine ZIP layout and naming if needed.

Throughout Phase 2, keep changes small and test between each unit of work so Cursor/Warp can iterate safely without breaking the app.