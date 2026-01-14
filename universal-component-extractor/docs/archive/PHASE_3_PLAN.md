# PHASE_3_PLAN.md

This document outlines a potential Phase 3 for the Universal Component Extractor, building on the stabilized Phase 1 and completed Phase 2 (extraction styles, diff view, and export presets).

## 1. Goals
- Deepen integration with real-world app frameworks and build systems.
- Make diffs and history more powerful and trustworthy.
- Provide richer analysis/explain modes beyond extraction, while keeping the UX simple.
- Maintain stability and performance as features grow.

## 2. Workstream D – Framework-Specific Export Presets (Status: Implemented)

### D.1 Problem / Opportunity
- Current presets (React component, vanilla widget, full ZIP) are framework-agnostic.
- Many users work in specific stacks (e.g., Vite React, Next.js, CRA, plain HTML/JS) and would benefit from opinionated exports.

### D.2 Desired State
- One-click exports that match common targets, for example:
  - **Vite React component preset** – component + CSS + minimal usage stub in a Vite-style folder.
  - **Next.js page or route preset** – page component + CSS Module + simple route wiring notes.
  - **Design system stub** – component + Storybook story or MDX doc scaffold.

### D.3 Concrete Steps
1. **Research target frameworks**
   - Decide which 1–2 stacks to support first (e.g., Vite React + Next.js).
   - Capture minimal file/folder layouts and conventions for those stacks.
2. **Design file maps per framework**
   - For each preset, specify exact paths and filenames, e.g.:
     - `src/components/MyComponent.tsx`
     - `src/components/MyComponent.css`
     - `src/App.tsx` snippet or usage example.
3. **Extend export helpers**
   - Add new helper functions in `utils/exportHelpers.ts` that return framework-specific file maps.
   - Reuse existing `ensureCdns` or introduce minimal framework-aware variants as needed.
4. **Wire new presets into UI**
   - Add buttons under **Export presets** for framework-specific bundles.
   - Gate advanced presets behind a small "More presets" expander if needed to avoid clutter.
5. **Tests & examples**
   - Add unit tests to `tests/utils/exportHelpers.test.ts` for new presets.
   - Create small example projects (or snippets in docs) showing how to drop in the exported bundles.

### D.4 Benefits
- Faster drop-in to real projects with less manual wiring.
- Clearer expectations about where files belong in common stacks.
- Extensible pattern for future presets (e.g., Svelte, Vue, Astro) without reworking core export flow.

## 3. Workstream E – Smarter Diffs & Change History (Status: Implemented)

### E.1 Problem / Opportunity
- Current diff view is a simple before/after comparison for textarea-based runs.
- Multi-file projects and repeated extractions dont have great diff visibility or history.

### E.2 Desired State
- More granular and informative diffs:
  - Optional **per-file diffs** when multi-file inputs are used.
  - Better line matching (not just whole-file add/remove).
- Basic **extraction history** within a session:
  - Ability to step through previous extractions and see their diffs.

### E.3 Concrete Steps
1. **Refine diff generation**
   - Replace the current "all old lines removed, all new lines added" approach with a line-aware diff (leveraging `react-diff-view` more fully).
   - Extract diff generation into a small utility with unit tests.
2. **Add per-file diff support (MVP)**
   - For multi-file extractions, allow the user to choose a file from a dropdown in the Diff tab.
   - Store original content by file key when aggregating inputs.
3. **Introduce simple history model**
   - Keep a bounded list of the last N `ExtractedCode` results.
   - Allow selecting a previous extraction in the UI to re-open its diff and analysis.
4. **UX polish**
   - Show clear labels (e.g., "Before (original textarea)", "After (extracted TSX)").
   - Handle missing data gracefully (e.g., no original source for imported-only projects).
5. **Tests & manual checks**
   - Unit tests for diff utility and history reducer/state.
   - Manual runs on HTML, React, and multi-file projects to validate behavior.

### E.4 Benefits
- Better transparency and trust in transformations.
- Easier debugging of regressions or unexpected refactors.
- A foundation for more advanced history features later (e.g., export change logs).

## 4. Workstream F – Deeper Analysis & Explain Modes (Status: Implemented)

### F.1 Problem / Opportunity
- Phase 2 introduced extraction styles (Minimal vs Refactor) but still focuses primarily on transforming code.
- Some users may want an "explain first" or "review my code" mode without immediately refactoring.

### F.2 Desired State
- Additional, clearly separated AI modes, for example:
  - **Explain** – high-level explanation of what the code does, risks, and improvement suggestions.
  - **Review** – structured feedback akin to a code review (style, architecture, performance hints).
- These modes should reuse as much of the existing `aiService` and `codeAnalyzer` infrastructure as possible.

### F.3 Concrete Steps
1. **Define new modes and prompts**
   - Extend AI settings to include a primary "interaction mode" (Extract, Explain, Review).
   - Design prompt fragments for Explain/Review that still emit structured, parseable sections.
2. **Update `aiService.ts`**
   - Add new entrypoints or options to steer the provider-specific calls for non-extraction modes.
   - Ensure streaming and error handling match the existing extract flow.
3. **UI wiring**
   - Add lightweight toggles or buttons (e.g., tabs or radio buttons near "Extract Component") to pick the mode.
   - Make it obvious which mode is active to avoid surprises.
4. **Results surface**
   - Reuse the Analysis tab to show Explain/Review output.
   - Optionally add a compact summary banner (e.g., key risks, complexity, recommended next steps).
5. **Tests & manual checks**
   - Extend `tests/services/aiService.test.ts` with cases for new modes.
   - Manual smoke tests across HTML, React, and Three.js inputs.

### F.4 Benefits
- Non-destructive workflows for learning and review.
- More educational value from the tool without always changing the code.
- Clear separation between "analyze" and "transform" behaviors.

## 5. Execution Notes
- Phase 3 has begun with Workstreams D (framework presets), E (diffs & history), and F (explain/review modes) implemented and shipped.
- Remaining Phase 3 work is incremental polish and optional extensions (additional presets, richer history, more granular modes).
- Treat Phase 3 as a menu of enhancements rather than a strict sequence; pick small, testable slices for further improvements.
- Keep each workstream broken into small, testable steps.
- Update `PHASE_2_PLAN.md`, `PHASE_3_PLAN.md`, and relevant docs (user and developer guides) as features land so documentation stays aligned with behavior.
