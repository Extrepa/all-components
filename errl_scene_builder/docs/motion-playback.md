# Motion Playback Pipeline

This document explains how time-based motion is wired through the Errl Scene Builder.

## Overview

The motion system is driven by a single source of truth: `playbackTimeMs` in the global scene store. No entity transforms are mutated for animation; motion is applied at render time as offsets.

## Data Flow

1. **PlaybackControls**
   - Holds local `playing` state.
   - On each animation frame, computes elapsed time and calls `setPlaybackTime(elapsedMs)` in the scene store.
2. **Scene Store**
   - Fields: `playbackTimeMs: number` and `setPlaybackTime(ms)`.
   - Any component can subscribe to `playbackTimeMs`.
3. **SceneViewport**
   - Subscribes to `playbackTimeMs`.
   - Gets the mounted renderer instance via `containerRef.__rendererInstance`.
   - On `playbackTimeMs` change: calls `renderer.setPlaybackTime(playbackTimeMs)` then `renderer.render(scene)`.
4. **SvgRenderer**
   - Implements `setPlaybackTime(ms)` and stores it internally.
   - In `render(scene)`, derives `timeSec = playbackTimeMs / 1000`.
   - For each entity:
     - Reads base `entity.transform`.
     - Calls `applyMotionOffsets(entity, timeSec)` to get `dx`, `dy`, `dRot`, `dScale`.
     - Composes base transform + offsets into the final SVG transform.

## Motion Presets

Each entity has `motion: MotionInstance[]` with:

- `motionId`: e.g., `MOTION_FLOAT`, `MOTION_WIGGLE`, `MOTION_PULSE`, `MOTION_ORBIT`, `MOTION_DRIP`
- `enabled`: boolean
- `params`: normalized controls (e.g., `speed`, `intensity`, `radiusX/Y`, `gravity`, `phaseOffset`)

Renderer interpretation:

- **MOTION_FLOAT**: vertical sine using `speed`, `intensity`
- **MOTION_WIGGLE**: rotation wiggle using `speed`, `intensity`
- **MOTION_PULSE**: scale in/out using `speed`, `intensity`
- **MOTION_ORBIT**: elliptical motion using `speed`, `radiusX`, `radiusY`, `phaseOffset`
- **MOTION_DRIP**: looping downward drift using `speed`, `gravity`

Multiple motions accumulate offsets on a single entity.

## Adding New Motion Types

1. Extend motion docs/UI to expose the new `motionId`.
2. Add a `case` in `applyMotionOffsets` (svgRenderer.ts) reading params and adjusting dx/dy/rotation/scale.
3. Optionally expose in the UI motion dropdowns.
