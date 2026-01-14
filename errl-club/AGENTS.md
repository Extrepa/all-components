# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds the entry points (`main.js`, `style.css`) plus domain folders such as `avatar/`, `audio/`, `camera/`, `effects/`, `network/`, `scene/`, and `systems/`.
- `docs/` stores specifications and testing artifacts (see `docs/testing/` for QA writeups), `scripts/` contains build helpers, and `dist/` is the generated Vite bundle that should not be edited directly.
- Keep shared constants under `src/config/` and cataloged assets in `src/assets/` (e.g., `src/assets/avatars/ASSET_CATALOG.md`).

## Build, Test, and Development Commands
- `npm install`: install Vite, Three.js, and Prettier before any local work.
- `npm run dev`: launch the Vite dev server (`localhost:5173`) with fast reloads for anything in `src/`.
- `npm run build`: produce production bundles in `dist/` so preview/hosting tests can run reliably.
- `npm run preview`: serve the last build to verify asset paths, shaders, and sizing before merging.
- `npm run format`: run Prettier over `src/**/*.js` and `src/**/*.css` to enforce the shared formatting baseline.

## Coding Style & Naming Conventions
- Use ES modules and camelCase exports; organize new files into the nearest domain folder (e.g., add camera helpers under `src/camera/`).
- Rely on Prettier for spacing, semicolons, and quotes—run the format script after major edits or renames.
- Keep UI components in `src/ui/`, input mappings in `src/input/`, and state-heavy code in `src/core/` or `src/systems/` so readers find logic where they expect it.

## Testing Guidelines
- No automated test suite exists yet; manual scenarios are documented under `docs/testing/` (plan, report, checklist, phase notes).
- When you validate behavior, log the steps, expected outcome, and actual result in the relevant testing doc for future reviewers.
- Name manual-test notes after the subsystem you touched (e.g., `docs/testing/avatar-movement-check.md`) to make regressions easy to locate.

## Commit & Pull Request Guidelines
- Follow the `type: short-description` pattern from history (`feat:`, `fix:`, `chore:`) so automation and reviewers understand scope.
- PRs should summarize changes, mention linked roadmap steps or issues, and state how you manually verified the change; include before/after screenshots for any visual tweaks.
- Keep the PR title aligned with the commit summary and tag teammates when the change touches networking, shaders, or other shared contracts.

## Environment & Configuration Tips
- Use Node.js v25.2.1 (or another 25.x release) to keep Vite, Three.js, and Prettier behavior consistent.
- Only modify `dist/` when you are preparing a release branch; otherwise, leave it as generated output and keep `package-lock.json` synchronized with dependencies.
