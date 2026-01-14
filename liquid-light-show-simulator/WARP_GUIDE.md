# WARP Guide

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project overview

This repository is a browser-based "Liquid Light Show" simulator implemented with **TypeScript**, **Vite**, and the HTML **canvas** API. It aims to evoke the analog overhead-projector liquid light shows of the 1960s using colorful, semi-transparent blobs that drift, wobble, and interact with pointer input.

The experience is intentionally lightweight and self-contained so it can be evolved toward more advanced techniques (e.g., WebGL, shader-based fields, or more physically-inspired motion) without changing the basic project shape.

## Development and build workflow

All commands are run from the repository root.

### Install dependencies (one-time)

```bash
npm install
```

### Run the dev server

Starts a Vite dev server with hot module reload.

```bash
npm run dev
```

### Build for production

Produces a static bundle in `dist/`.

```bash
npm run build
```

### Preview the production build

Serves the built `dist/` bundle locally (uses Vite preview).

```bash
npm run preview
```

### Run tests

Runs the Vitest test suite once.

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

There is currently **no dedicated lint command** configured. If linting/configuration is added (ESLint, Prettier, etc.), update this section with the exact commands.

## High-level architecture

The app is intentionally small and split into two main concerns: **runtime shell + I/O** and **simulation/rendering utilities**.

### Runtime shell and entry point

- `index.html`
  - Minimal HTML shell.
  - Mounts the app into `#app` and loads `src/main.ts` via a module script.
- `src/main.ts`
  - Creates and attaches a `<canvas>` to `#app`.
  - Handles resize events and applies device-pixel-ratio scaling so visuals stay sharp.
  - Tracks pointer input (`pointerdown`, `pointermove`, `pointerup`) and converts it into a simple pointer force.
  - Owns the main animation loop:
    - Computes `dt` between frames.
    - Calls `updateBlobs` with canvas dimensions and optional pointer data.
    - Clears and redraws the frame via `drawBlobs`.

### Simulation and rendering utilities

- `src/simulation/blobs.ts`
  - **Types**
    - `BlobState` – position, velocity, base radius, wobble state, and hue for a single visual blob.
    - `PointerForce` – minimal `{ x, y }` pointer position object.
  - **Creation**
    - `createBlobs(count)` – creates a roughly ring-shaped arrangement of blobs around a notional center, with randomized velocities, radii, wobble parameters, and hues.
  - **Update**
    - `updateBlobs(blobs, dt, width, height, pointer)` – pure function that:
      - Applies a gentle attraction toward the canvas center.
      - Optionally applies a repulsive pointer force when the pointer is down.
      - Integrates velocities and positions with soft bounds near the edges.
      - Applies friction, wobble animation (radius modulation), and slow hue drift.
    - Returns a **new array** of `BlobState` objects (no in-place mutation), which keeps the logic easy to test.
  - **Rendering**
    - `drawBlobs(ctx, blobs, width, height)` – draws the visual frame:
      - Background radial gradient for projector-like glow.
      - Sets `globalCompositeOperation = 'lighter'` for additive blending.
      - For each blob, builds a radial gradient based on its hue and radius and draws a slightly squashed ellipse to enhance the organic feel.

### Tests

- `src/simulation/blobs.test.ts`
  - Uses **Vitest** with the `jsdom` environment.
  - Verifies that `createBlobs` returns the requested count.
  - Verifies that `updateBlobs` changes blob positions over a non-zero timestep, ensuring the simulation evolves.

## Guidance for future agents

- If you add more modules under `src/` (e.g., WebGL shaders, UI controls, audio reactivity), prefer to keep **simulation logic pure** and **side-effectful code** (DOM/canvas wiring, event listeners) in separate files.
- When adding linting or formatting tools, document their exact commands here (e.g., `npm run lint`, `npm run format`) and keep them wired into CI if present.
- If the project is later migrated to a different runtime (e.g., a shader-heavy WebGL implementation), update this file to describe the new entry points and how to run focused tests (e.g., per-module or per-scene test commands).
