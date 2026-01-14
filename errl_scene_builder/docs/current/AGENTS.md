# Repository Guidelines

## Project Structure & Modules
- Frontend source in `src/` (React + TypeScript). Key areas: `components/` (UI), `renderer/` (SVG renderer), `scene/` (types, store helpers), `hooks/`, `viewer/`, and `export/` utilities. Styling lives in `src/styles.css`. Routes are defined in `src/routes.tsx`.
- Assets and templates: SVGs under `svgs/`, scene templates in `templates/`, shared docs/specs in `docs/`.
- Tests live in `src/__tests__/` and use Vitest + React Testing Library.

## Build, Test, and Development Commands
- `npm run dev` — start Vite dev server.
- `npm run build` — production bundle.
- `npm run lint` — ESLint over `src` (`.ts/.tsx`).
- `npm test` — Vitest in CI mode (`--passWithNoTests`); `npm run test:watch` for local loops.

## Coding Style & Naming
- TypeScript + React functional components; prefer hooks and explicit prop types/interfaces.
- Follow ESLint defaults in the repo; run `npm run lint` before PRs. Keep imports ordered and remove unused symbols.
- Use 2-space indentation, camelCase for variables/functions, PascalCase for components, and SCREAMING_SNAKE_CASE for constants/IDs.
- Keep UI styles in `src/styles.css` utilities; avoid inline magic numbers when shared tokens exist.

## Testing Guidelines
- Framework: Vitest with `jsdom` + React Testing Library. Place tests beside code in `__tests__` or as `*.test.tsx`.
- Prefer interaction tests (render, act, assert) over shallow snapshots. Mock renderer/DOM-heavy bits when needed.
- Aim to cover store actions, renderer-side helpers, and critical components (viewport interactions, panels).

## Commit & PR Guidelines
- Commits: concise, present tense (“Add FX panel toggle”, “Fix renderer clear loop”). Squash locally if noisy.
- PRs should include: summary of changes, testing done (`npm test`/`npm run lint`), and screenshots/GIFs for UI changes. Link related issues or tasks when applicable.

## Asset Library & Tooling
- SVGs live under `svgs/` with curated subsets in `svgs/library/` grouped by domain (env, fest, weather, fx, goo, ui, misc, etc.).
- `svgs/asset_catalog.json` is the generated index of all library assets; `svgs/asset_catalog_fest_icons.json` and `svgs/asset_catalog_minimap.json` are filtered views for fest icons and minimap glyphs.
- Naming conventions for SVGs are described in `svgs/NAMING.md`. New assets should follow the `errl_<domain>_<descriptor>_<variant>.svg` pattern and include a `data-name` or leading comment that matches the filename slug.
- Run `npm run lint:assets` to validate asset names and metadata before committing; this scans `svgs/library` and reports prefix, logical-name, and filename issues.
- Helper scripts:
  - `scripts/lint_assets.cjs` — asset naming/metadata lint.
  - `scripts/derive_minimap_catalog.cjs` — regenerate the minimap-only catalog.
  - `scripts/propose_fest_variants.cjs` — analyze `svgs/library/fest` and propose canonical vs. variant filenames.

## Security & Config Tips
- Avoid hardcoding tokens/keys; keep secrets out of the repo. Use environment variables if backend integration appears.
- PNG/SVG export touches DOM APIs; keep dependencies updated and validate user-provided JSON before loading.
