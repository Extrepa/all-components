# WARP Guide

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

A virtual recreation of 1960s-era liquid light shows featuring interactive fluid simulations and rich UI tooling. Built with React 19, TypeScript, Vite, PIXI.js v8 (WebGL), and a Canvas2D fallback.

The app simulates two-phase fluid dynamics (oil floating above water) with immiscible color mixing, buoyancy, surface tension, and realistic optics.

## Common Commands

All commands are run from the repository root.

```bash
# Install dependencies
npm install

# Development server (Vite)
npm run dev          # http://localhost:5180/?ui=top

# Production build
npm run build        # Output in dist/

# Preview production build
npm run preview      # http://localhost:4321

# Tests (Vitest)
npm run test         # Run all tests once
npm run test:watch   # Run tests in watch mode

# Type checking
npm run typecheck    # tsc --noEmit
```

### Running a single test

Vitest is configured in `vitest.config.ts` with jsdom + a custom setup file in `tests/setup.ts`.

```bash
# Single test file
npm run test -- tests/PresetCycleEngine.test.ts

# Single test in watch mode
npm run test:watch -- tests/PresetCycleEngine.test.ts
```

## High-Level Architecture

### 1. Entry, Shell, and Layout Modes

- `index.html`
  - HTML entry; loads Tailwind via CDN and mounts React at `#root`.
  - Uses a single module entry: `/index.tsx`.
- `index.tsx`
  - React entry point; bootstraps `<App />` in `React.StrictMode`.
  - Logs a small build banner including the active UI mode.
- `App.tsx`
  - Main application shell and orchestrator.
  - Owns the canonical `LiquidConfig` state, undo/redo history, layout mode, and global modals.
  - Coordinates:
    - Canvas engine (`components/LiquidCanvas.tsx`)
    - Control surfaces (classic `Toolbar`+`FlyoutPanel` vs top-left `AppBar`+`TopPanel`)
    - Overlays (welcome screen, restore prompt, onboarding hint, HUD, toasts, dimmer, gesture controls).

**UI layout modes** (switchable by URL and localStorage):
- **Top Panel (default)** — `?ui=top` or `ui:topPanel = '1'`:
  - `ui/AppBar/AppBar.tsx`: Compact top-left app bar with primary actions.
  - `ui/TopPanel/TopPanel.tsx`: Pull-down panel hosting simulation, color, effects, brush, presets, and settings.
  - `ui/Trays/ColorTray.tsx`: Large color swatches + hex input.
  - `ui/Trays/PresetStrip.tsx`: Multi-select presets and cycling controls.
  - `ui/HUD/MiniHUD.tsx`: Shows active preset/mode while painting.
- **Classic** — `?ui=classic` or `ui:topPanel = '0'`:
  - `components/Toolbar.tsx`: Bottom dock with tabs.
  - `components/FlyoutPanel.tsx`: Right-side flyout for panels.

Layout choice is read via `ui/flags.ts` → `isTopPanelEnabled()`.

### 2. Simulation Engines and Rendering Stack

#### LiquidCanvas orchestration

**File**: `components/LiquidCanvas.tsx`

Responsibilities:
- Owns the rendering surface and chooses between WebGL and Canvas2D.
- Holds high-frequency interaction state in refs (pointer, preview, symmetry, dropper, edge runoff).
- Provides callbacks to `App` to wire up snapshot capture, video recording, clearing, and symmetry-origin mode.

Key pieces:
- `Canvas2DFluid(canvas, initialConfig, { performanceMode? })` — legacy particle renderer.
- `LiquidRenderer` from `engines/liquid-pixi/LiquidRenderer.ts` — WebGL fluid solver.
- `useWebGL` state (currently hardcoded to `false` to force Canvas2D while PIXI v8 is being finalized).

Both renderers expose a common interface used throughout `LiquidCanvas`:
- `play()` / `pause()`
- `splat(x, y, radius, color, phase?)`
- `updateConfig(config)`
- `clear()`
- `destroy()`

`LiquidCanvas` also:
- Implements dropper mode, line mode, drip mode.
- Integrates symmetry (radial / mirrored) via `utils/symmetry.ts`.
- Handles “edge runoff” drips as DOM overlays.
- Manages custom dropper cursor art (image following pointer, tinted to active color).

#### Canvas2D fallback renderer

**Location**: top of `components/LiquidCanvas.tsx` (function `Canvas2DFluid`).

Characteristics:
- Stores particles in an array capped at 2000 (500 in performance mode).
- Each particle has position, velocity, radius, color, life, maxLife.
- Lifetimes scale with `diffusion` (can reach ~2 minutes at max diffusion).
- Frame loop:
  - Fades background using `source-over` with a small alpha to create trails; fade speed tied to `diffusion`.
  - Switches to `config.blendMode` for droplet drawing (`lighter`, `screen`, `overlay`, etc.).
  - Updates particle physics (jitter, damping, shrink) and draws radial gradients per particle.
- Supports an `erase(x, y, radius)` API to remove particles in a region (eraser mode).

#### PIXI.js WebGL fluid renderer

**File**: `engines/liquid-pixi/LiquidRenderer.ts`

Purpose:
- 2D fluid simulator for two immiscible phases (oil and water) using multiple passes over render targets.

Core ideas:
- Uses `PIXI.Application` v8 and `GlProgram` to create custom fragment shader–backed `PIXI.Filter`s.
- Maintains ping-pong render targets for:
  - Velocity, pressure, oil field, water field.
  - Single divergence target and a full-res background buffer for refraction.
- Simulation step (called from `loop()`):
  1. Advect velocity.
  2. Apply buoyancy/separation using oil/water density and gravity.
  3. Diffuse velocity (viscosity-driven).
  4. Compute divergence.
  5. Pressure solve (Jacobi iterations, count depends on performance mode).
  6. Subtract pressure gradient to get divergence-free velocity.
  7. Advect oil field and water field.
  8. Apply surface tension to both fields.
- Rendering:
  - Clears a background RT.
  - Runs a final shading pass using `shadeFrag` to sample oil/water fields + background and produce lighting/refraction.
  - Outputs to `outputSprite` displayed on the PIXI stage.

Important implementation details for Warp:
- Shader programs are set up with `GlProgram.from` and uniforms are bound through `filter.resources.*Uniforms.uniforms` (PIXI v8 pattern).
- Gravity and light direction are dynamic, based on config (`gravityAngleDeg`, `lightAngleDeg`).
- Thin-film interference is gated by `performanceMode` (disabled in perf mode).

### 3. Configuration and State Flow

#### Types and defaults

- `types.ts`
  - `LiquidConfig`: central configuration type for simulation, optics, tools, palettes, backgrounds, symmetry, etc.
  - `SavedArtwork`: stored artworks in gallery with config + base64 thumbnail.
- `constants.ts`
  - `DEFAULT_CONFIG`: initial `LiquidConfig` for a new session.
  - `MAX_HISTORY_SIZE`: cap for undo history (30).
  - `PRESET_ERRL_DAY`: special preset with tuned physics, optics, and palettes.
- `constants/presets.ts`
  - Collection of built-in presets (`PRESETS`) used by the preset strip and panel.

#### State ownership (App-level)

`App.tsx` owns the canonical `LiquidConfig` and history via `useHistory(DEFAULT_CONFIG)`:
- `useHistory` (in `hooks/useHistory.ts`) manages:
  - Current `config`.
  - `updateConfig(partialConfig, pushToHistory = true)`.
  - `undo`, `redo`, `getSnapshot`, `setFromSnapshot`, `reset`.
- `updateConfig` is wrapped by `updateConfigWithColorGuard` to keep `activeColorIndex` in range when palettes change.
- `useSessionPersistence` (in `hooks/useSessionPersistence.ts`) serializes session into `localStorage`:
  - Keys include `liquid-art-session` and `liquid-art-prompt-restore`.
  - On startup, optionally prompts the user to restore prior session.
- `useArtworkGallery` manages saved artworks (`liquid-art-gallery` key).
- `useVideoRecording` wraps `MediaRecorder` to capture canvas streams into `.webm` downloads.

Config data flow:
- UI controls (panels, trays, dock) call `updateConfigWithColorGuard`.
- `App` passes `config` down to `LiquidCanvas`, `AfterEffects`, background, and control components.
- `LiquidCanvas` mirrors `config` into a ref and forwards updates to the underlying renderer (`updateConfig`).

### 4. Interaction Model and Tools

#### Dropper mode (primary interaction)

**File**: `components/LiquidCanvas.tsx`

Modes:
- `dropperEnabled` (default):
  - Pointer down records time and position; splat occurs on pointer up.
  - Radius grows from `dropMinRadius` to `dropMaxRadius` over `dropTimeToMaxMs` using `dropEasing`.
  - An optional preview circle (`dropPreview`) uses a separate lag (`dropPreviewLagMs`) to feel elastic.
  - Drop cancels if held longer than `MAX_DROP_HOLD_MS` or pointer leaves canvas.
- `dripEnabled`:
  - While held, emits micro-drops at `dripIntervalMs` using `performSplat`.
- `lineEnabled`:
  - Immediate continuous splats follow pointer (traditional painting behavior).

Color and phase selection:
- Active phase: `config.activePhase` (`'oil' | 'water'`).
- Phase palettes: `oilPalette` and `waterPalette`; falls back to `colors` if a phase palette is missing.
- Scroll interactions:
  - Plain wheel toggles phase (oil ↔ water) with a short cooldown.
  - Cmd/Meta + wheel cycles the active color index.

#### Symmetry and kaleidoscope

**Files**: `utils/symmetry.ts`, `components/LiquidCanvas.tsx`

- `symmetryEnabled`: master toggle.
- `symmetryCount`: number of copies (2/4/6/8/12).
- `symmetryMirror`: whether each wedge is mirrored for a kaleidoscope effect.
- `symmetryRotationDeg`: rotation offset.
- `symmetryOrigin`: normalized origin `{ x, y }` within canvas.
- A dedicated "set symmetry origin" mode is exposed from `LiquidCanvas` back up to `App` and controls; clicking in this mode sets the origin, ESC cancels.

Implementation pattern:
- Pointer positions are normalized `(x / width, y / height)`.
- `getSymmetryPoints` returns a set of mirrored/rotated points.
- `performSplat` converts each normalized point back to pixel coordinates and dispatches to the renderer.

#### Brush patterns

**Files**: `utils/brushPatterns.ts`, `components/controls/BrushPanel.tsx`

- `LiquidConfig.brushPattern` can be one of:
  - `'single' | 'polkadots' | 'stripes' | 'line' | 'spray' | 'text' | 'stamp'`.
- `generateBrushPattern` computes per-splat point distributions based on brush pattern, `brushSpacing`, prior stroke position, etc.
- Stamp mode samples from `brushStampImage` (a data URL) with `sampleStampImage`.

`LiquidCanvas` uses these utilities to generate a set of `(x, y, radius)` points per stroke and forwards them to the active renderer.

#### Preset cycling engine

**Files**: `features/presets/PresetCycleEngine.ts`, `ui/Trays/PresetStrip.tsx`, `components/LiquidCanvas.tsx`

- `PresetCycleEngine.nextIndex(mode, state, length)` supports:
  - `sequential`, `pingpong`, `random` modes.
- `PresetStrip` UI lets users multi-select presets and toggle cycling (`cycleEnabled`), with:
  - Modes: sequential, ping-pong, random.
  - Cadence: `per-stroke` or `per-splat`.
- `LiquidCanvas` consumes `selectedPresets`, `cycleMode`, `cycleCadence`, and `cycleEnabled` to:
  - Ephemerally apply preset configs while painting (no immediate history commit).
  - Track cycle state in `cycleStateRef`.
  - On stroke end, call `onCommitConfig` once with the last-applied config fragment so history behaves intuitively.

HUD integration:
- `App.tsx` wires global callbacks (`window.__onCycleStep` and `window.__onCycleEnd`) that `LiquidCanvas` invokes.
- `MiniHUD` listens to these events and briefly displays the active preset name/mode while cycling.

### 5. Effects, Backgrounds, and Overlays

- `components/BackgroundGradient.tsx` — animated gradient backdrop.
- `components/BackgroundPattern.tsx` — grid/dot/radial/hexagon patterns controlled by `backgroundPattern`, `backgroundOpacity`, `backgroundScale` in `LiquidConfig`.
- `components/AfterEffects.tsx` — wraps `LiquidCanvas` and applies SVG/CSS-based effects:
  - Chromatic aberration via SVG filter.
  - Grain/noise overlays using SVG data textures and blend modes.
- Various HUD/overlay components coordinate z-index and pointer events carefully so the canvas remains interactive while UI floats above.

## Testing and Tooling

### Vitest configuration

**File**: `vitest.config.ts`
- `environment: 'jsdom'`.
- `setupFiles: ['./tests/setup.ts']`.
- `globals: true`, `css: false`.
- jsdom URL set to `http://localhost`.

### Test setup

**File**: `tests/setup.ts`
- Provides robust `localStorage` mock.
- Stubs `URL.createObjectURL` and `URL.revokeObjectURL`.
- Mocks `MediaRecorder` and `MediaStream` for video recording hooks.

### Example tested areas

- `tests/PresetCycleEngine.test.ts`
  - Verifies index progression for sequential, pingpong, and random modes in `PresetCycleEngine`.
- Additional tests (if present in `tests/`) cover hooks like `useHistory`, `useArtworkGallery`, `useSessionPersistence`, and `useVideoRecording`.

When extending behavior, prefer adding unit tests in `tests/` for:
- Pure engines (e.g., preset cycling, symmetry math, brush patterns).
- Hooks interacting with localStorage or MediaRecorder.

## Build, Type System, and Paths

### Vite configuration

**File**: `vite.config.ts`

Key points:
- Uses `@vitejs/plugin-react` and `vite-plugin-glsl`.
- Dev server:
  - `port: 3000` in config, but `npm run dev` script overrides to `--port 5180`.
  - `host: '0.0.0.0'` for LAN access.
- Env variables:
  - `loadEnv(mode, '.', '')` pulls `GEMINI_API_KEY` from `.env.local` or similar.
  - `define` maps:
    - `process.env.API_KEY` → `env.GEMINI_API_KEY`.
    - `process.env.GEMINI_API_KEY` → `env.GEMINI_API_KEY`.
- Alias:
  - `@` → project root (`path.resolve(__dirname, '.')`).

### TypeScript configuration

**File**: `tsconfig.json`

Important options:
- `target: "ES2022"`.
- `module: "ESNext"`, `moduleResolution: "bundler"`.
- `jsx: "react-jsx"` (no need to import React in TSX files).
- `paths`: `"@/*": ["./*"]` — alias aligns with Vite config.
- `types: ["node"]` for Node-style globals in config/tests.
- `noEmit: true` — TypeScript is used for type checking only.

## Environment and AI Integration

While the README mentions Google Gemini and AI Studio, the current palette/vibe generation is **local-only**:
- `services/paletteService.ts`
  - Maps text prompts heuristically to predefined palette themes (lava, ocean, neon, forest, pastel).
  - Fallback path generates random hex palettes.
  - `generateVibe` combines heuristic simulation parameters (velocity, viscosity, density, pressure) with a palette.

If you re-enable direct Gemini integration, look for any older `geminiService` implementations (e.g., in `services/`) and wire them into `ColorPanel` / `App` in place of `paletteService`.

## Documentation to Consult

The `docs/` directory contains detailed reference material. The most important for future Warp agents are:
- `docs/overview.md` — high-level product explanation.
- `docs/structure.md` — repository layout and roles of key files.
- `docs/architecture.md` — full rendering pipeline, lifecycle, state diagrams.
- `docs/development.md` — dev setup, environment variables, debugging tips.
- `docs/performance.md` — performance characteristics and profiling guidance.
- `docs/troubleshooting.md` — common runtime/build issues.
- `docs/refactoring.md` and `docs/roadmap.md` — future plans and suggested reorgs.

## Things to Keep in Mind When Editing

- The **source of truth** for config is `LiquidConfig` in `types.ts` and `DEFAULT_CONFIG` in `constants.ts`. Keep them in sync when adding new parameters.
- Many interactive behaviors (dropper, symmetry, brushes, preset cycling) rely on refs and high-frequency `requestAnimationFrame` loops; avoid introducing React state changes into these hot paths unless necessary.
- When you touch shaders or `LiquidRenderer`, treat **Canvas2D** as the safety net; WebGL is allowed to fail and fall back to Canvas2D.
- If you alter palette handling, ensure `activeColorIndex` remains valid; use the existing `updateConfigWithColorGuard` pattern.
- When changing layout or z-indices, consider that `LiquidCanvas` must remain pointer-interactive under glass panels and HUDs.
