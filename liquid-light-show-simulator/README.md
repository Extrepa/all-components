# Liquid Light Show Simulator

**STATUS: ARCHIVED** - This project has been superseded by [`psychedelic-liquid-light-show`](../psychedelic-liquid-light-show/), which includes all features of this simple version plus advanced physics, AI-powered palettes, and many more features.

This implementation is a **browser-based canvas app** built with TypeScript and Vite. It renders colorful, overlapping "blobs" that wobble, drift, and react to pointer input to evoke the feel of analog liquid light shows.

**For new projects, use:** [`psychedelic-liquid-light-show`](../psychedelic-liquid-light-show/)

## High-Level Concept

The simulator mimics an overhead projector shining through swirling, semi-transparent liquids:
- Multiple soft blobs drift around a virtual dish.
- Additive blending and gradients produce intense color blooms where blobs overlap.
- Blobs wobble in size and slowly shift hue over time.
- Pointer interaction pushes blobs around, like nudging fluid on a glass plate.

## Getting Started

Install dependencies (one-time):

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Code structure

- `index.html` – HTML entry point; mounts the app into `#app` and loads `src/main.ts`.
- `src/main.ts` – application entry point. Creates the canvas, handles resize and pointer input, runs the animation loop, and delegates simulation + rendering.
- `src/simulation/blobs.ts` – pure utilities for the blob simulation:
  - `createBlobs(count)` – initializes a ring of colorful blobs.
  - `updateBlobs(blobs, dt, width, height, pointer)` – updates blob positions, wobble, and hue over time, with gentle center attraction and pointer forces.
  - `drawBlobs(ctx, blobs, width, height)` – draws the background glow and all blobs with additive blending and radial gradients.
- `src/simulation/blobs.test.ts` – Vitest unit tests covering basic blob creation and motion over time.

## Notes

The current implementation focuses on **visual feel and interaction**, not physically-accurate fluid simulation. It is intentionally small and self-contained so it can be evolved toward more complex behavior (e.g., grid-based fields, shaders, or WebGL) without changing the basic project structure.

## Documentation

- [INDEX.md](INDEX.md) - Workspace index
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - Current status
- [Documentation Index](docs/index.md) - Detailed docs with links to all documentation

### Specification

- [WARP Guide](WARP_GUIDE.md) - WARP (warp.dev) AI assistant guide for working with this codebase

### Technical Documentation

- [Architecture](docs/architecture.md) - Technical architecture and design
- [Project Structure](docs/project-structure.md) - File organization and structure

## Note

**STATUS: ARCHIVED** - This project has been superseded by [`psychedelic-liquid-light-show`](../psychedelic-liquid-light-show/), which includes all features of this simple version plus advanced physics, AI-powered palettes, and many more features.

**For new projects, use:** [`psychedelic-liquid-light-show`](../psychedelic-liquid-light-show/)
