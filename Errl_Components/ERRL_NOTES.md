# ERRL NOTES
High-level log of the Errl visual/narrative engine, interaction patterns, and current architecture.

## 0. Tooling / Environment
- Go installed via Homebrew and verified:
  - `brew install go`
  - `go version` → e.g. `go1.25.4 darwin/arm64`
- Not directly tied to Errl visuals but available for CLI/backend work.

## 1. Errl Pop System (Particles with Mass)
**Goal:** Explosive particle burst when a semantic `<button>` is clicked, without DOM thrash.

- DOM layer:
  - Bubbles are real `<button>` elements for accessibility.
  - On click:
    - Use `getBoundingClientRect()`.
    - Compute centerX / centerY.
    - Emit a "pop" event (with coordinates) into the interaction store.
    - Perform navigation / state change separately.
- WebGL layer (R3F):
  - One `InstancedMesh` for many bubbles/particles (e.g. 50) → single draw call.
  - Per-particle state in memory only:
    - `time`, `life`, `vel: Vector3`, `scale`, `active`, `position`.
  - Physics loop in `useFrame`:
    - Integrate position by velocity.
    - Apply drag/friction (e.g. multiply velocity by `0.95`) for viscous feel.
    - Shrink particles over lifetime and deactivate when dead.
  - Use a `dummy Object3D` + `setMatrixAt(i, dummy.matrix)` + `instanceMatrix.needsUpdate = true`.

## 2. 2D → 3D Coordinate Mapping
**Goal:** Spawn explosions exactly where the user clicked in the browser.

- Inputs from `useThree()`:
  - `size.width`, `size.height` (canvas pixel size).
  - `viewport.width`, `viewport.height` (world units at z=0).
- Mapping pixel → world:
  - `px = (x / size.width) * viewport.width - viewport.width / 2`
  - `py = -(y / size.height) * viewport.height + viewport.height / 2`
- Use `(px, py, 0)` as emission origin for particles.

## 3. ExplosionSystem (R3F Component)
**Role:** Reusable particle pool that sits in the scene and is triggered by events.

- Initial setup:
  - Allocate N particle structs with random `life`, `vel`, and `scale`.
  - Store `position`, `time`, `active` flags.
- Runtime:
  - On new pop event, reset all particles at `(px, py, 0)` with fresh velocity.
  - Per-frame physics:
    - Update `time`.
    - Move by velocity.
    - Apply drag.
    - Shrink by life fraction.
    - Kill when `time >= life` or scale <= 0.

## 4. Overhead Projector (Scroll-Synced Light Engine)
**Goal:** Narrative revealed by a moving spotlight, like an old overhead projector.

- Fragment shader:
  - Uniforms: `uScrollProgress` (0–1), `uAspectRatio`.
  - UV-based light position: `vec2 lightPos = vec2(0.5, 1.0 - uScrollProgress)`.
  - Aspect-corrected UV for round beam: `uvCorrected.x *= uAspectRatio`.
  - Radial distance + `smoothstep` for soft spotlight.
  - Multiply existing oil/noise color by light intensity.
  - Add small "hotspot" at the center to mimic projector bulb.
- R3F scroll sync using `@react-three/drei`:
  - `<ScrollControls pages={N} damping={4}>` wraps the scene.
  - `useScroll()` gives `scroll.offset` (0–1).
  - `ProjectorRig` mesh:
    - Plane + `shaderMaterial` with `uScrollProgress`.
    - In `useFrame`, set `uScrollProgress = scroll.offset`.
  - `<Scroll html>` wraps the HTML narrative content so text scrolls inside the same logical canvas space.

## 5. ERRL_CONFIG (Content Brain)
**Goal:** Externalize text, layout, and behavioral hints into a typed config.

- Types:
  - `BubbleNav`:
    - `id: string`
    - `label: string`
    - `action: 'scroll' | 'modal' | 'link'`
    - `target: string` (e.g. `#about` or URL).
  - `ScrollSection`:
    - `id: string`
    - `layout: 'center' | 'split-left' | 'split-right'`
    - `title: string`
    - `text: string`
    - `lightIntensity: number` (0–1, desired projector brightness for section).
- Config shape:
  - `meta`: title, primaryColor, secondaryColor.
  - `hero`: headline, subhead, CTA label.
  - `navigationBubbles: BubbleNav[]`.
  - `sections: ScrollSection[]`.
- Engine usage:
  - Scroll position + section boundaries drive projector shader uniforms (e.g. lerp brightness to `lightIntensity` of the active section).

## 6. Stretchy Wobble (Vertex Shader)
**Goal:** Make bubbles wobble elastically on hover.

- Vertex shader uniforms:
  - `uTime` – animation timeline.
  - `uHover` – 0 (idle) → 1 (fully excited).
  - `uAmplitude` – wobble strength.
  - `uFrequency` – wobble speed.
- Logic:
  - Compute `r = length(uv - 0.5)` for radial distance from center.
  - Phase: `phase = uTime * uFrequency + r * 2π`.
  - Wobble: `wobble = sin(phase) * uAmplitude * uHover * smoothstep(0.0, 0.5, r)`.
  - Displace along normal (for a flat bubble: `transformed.z += wobble`).
- Fragment shader:
  - Radial gradient bubble (e.g. cyan core, soft alpha falloff to edge).

## 7. BubbleMesh (R3F)
**Goal:** One wobbling bubble mesh driven by hover state.

- Mesh:
  - `circleGeometry` or similar with sufficient segments.
  - `shaderMaterial` using wobble vertex + bubble fragment shaders.
- Uniforms:
  - `uTime`, `uHover`, `uAmplitude`, `uFrequency`.
- `useFrame`:
  - Update `uTime` from `clock.getElapsedTime()`.
  - Lerp `uHover` → 1 when hovered, → 0 when not (smooth response).

## 8. Interaction Store (Zustand)
**Goal:** Replace `window.*` globals with a clean bridge between DOM and R3F.

- Store: `useErrlInteractions`.
- State:
  - `hoveredBubbleId: string | null`.
  - `lastPopEvent: { id: string; x: number; y: number; time: number } | null`.
- Actions:
  - `setHoveredBubble(id: string | null)`.
  - `triggerPop(id: string, x: number, y: number)`.
- Behavior:
  - `lastPopEvent.time` used to ignore stale or duplicate events.

## 9. DOM BubbleButton (HTML Layer)
**Goal:** Semantic bubble UI that talks only to the store.

- Props: `id`, `children`.
- On hover:
  - `setHoveredBubble(id)` on mouse enter.
  - `setHoveredBubble(null)` on mouse leave.
- On click:
  - Read `getBoundingClientRect()` and compute centerX / centerY.
  - Call `triggerPop(id, centerX, centerY)`.
  - Then handle navigation / other app logic.

## 10. BubbleMesh ← Store (Hover → Wobble)
**Goal:** Drive wobble with shared hover state.

- Reads `hoveredBubbleId` from `useErrlInteractions`.
- Per frame:
  - `isHovered = hoveredBubbleId === thisBubbleId`.
  - Lerp `uHover` uniform towards 1 or 0 accordingly.

## 11. ExplosionSystem ← Store (Click → Pop)
**Goal:** Trigger explosions via store events instead of globals.

- Reads `lastPopEvent` from `useErrlInteractions`.
- Tracks `lastProcessedTime` locally.
- On new event:
  - Convert `(x, y)` pixel coords to world `(px, py)`.
  - Reset all particles at `(px, py, 0)` with new random velocities.
- Physics loop as described in earlier sections.

## 12. Current Architecture Snapshot

- **Config Brain:** `ERRL_CONFIG` holds narrative, nav bubbles, and section settings.
- **DOM Layer:**
  - `<button>` bubbles emit hover and pop events into `useErrlInteractions`.
  - HTML narrative lives inside `<Scroll html>` so it aligns with projector visuals.
- **Interaction Store:**
  - Single source of truth for hover and pop interactions.
- **WebGL / R3F Layer:**
  - `ProjectorRig`: scroll-synced spotlight over fluid/oil shader.
  - `BubbleMesh`: per-bubble wobble using vertex shader deformation.
  - `ExplosionSystem`: instanced particle bursts triggered by `lastPopEvent`.

## 13. Next Possible Milestones

- **Instanced wobble bubbles:**
  - One InstancedMesh for all bubbles, with per-instance attributes for position and hover strength.
  - Store holds bubble list + hover state; shader reads attributes to wobble many bubbles cheaply.
- **Config-driven layout binding:**
  - Generate DOM BubbleButtons + WebGL bubble instances from `ERRL_CONFIG.navigationBubbles`.
- **Refined shader aesthetics:**
  - Integrate actual Errl color language, edge glows, refractions, etc.
- **Testing / performance:**
  - FPS / perf checks with many bubbles and frequent pops.

---

## Errl Landing Prototype: DOM → Store → WebGL (Red Pill Path)

Goal: Prove the "scream in unison" pipeline where an HTML control mutates shared state and the WebGL mesh reacts inside the RAF loop without React re-renders.

### Stack Snapshot
- Vite + React + TypeScript.
- @react-three/fiber + @react-three/drei for the scene.
- zustand for the shared interaction store (no React Context).

### Wiring
- Entry: `src/main.tsx` → `<Landing />` (`src/landing.tsx`).
- Layout: split hero.
  - Left: DOM copy + `<TriggerButton />`.
  - Right: `<TrippyScene />` (Canvas).

#### Store (Hypno Brain)
- File: `src/store/useHypnoStore.ts`.
- Shape:
  - `isHovered: boolean` – whether the forbidden button is currently hot.
  - `setHovered(hovered: boolean)` – write-only action used by DOM.
- Access patterns:
  - DOM uses the hook selector: `useHypnoStore((s) => s.setHovered)`.
  - WebGL uses `useHypnoStore.getState()` *inside* `useFrame` to avoid React renders.

#### DOM Trigger ("Don’t Touch" Button)
- File: `src/components/TriggerButton.tsx`.
- Behavior:
  - `onMouseEnter` → `setHovered(true)`.
  - `onMouseLeave` → `setHovered(false)`.
- Styling: `.trigger-button` in `src/styles.css` (pill CTA, gradients, etc.).
- Design intent: completely decoupled from graphics; it only mutates store state.

#### WebGL Hallucination (Melting Icosahedron)
- File: `src/components/TrippyScene.tsx`.
- Components:
  - `<TrippyScene />` sets up the Canvas, camera, background color, lights.
  - `<MeltingMesh />` is a single `icosahedronGeometry` + `meshNormalMaterial`.
- Animation loop (`useFrame`):
  - Reads `currentHover = useHypnoStore.getState().isHovered` each frame.
  - Chooses targets:
    - `targetScale`: `1.0 → 2.1` when hovered.
    - `targetSpeed`: `0.6 → 4.5` when hovered.
  - Uses `MathUtils.lerp` on scale XYZ toward `targetScale` (gooey ramp-up / decay).
  - Increments rotation based on `targetSpeed` (calm idle vs. manic spin).
- Key rule: Canvas never re-renders on hover; only the store and the mesh’s transform mutate.

### Effect
- User hovers the DOM button.
- Store flips `isHovered`.
- Each RAF tick, the mesh samples that state directly and eases into a new orbit/scale regime.
- Result: HTML and WebGL feel locked together, but React stays mostly static.

### How This Fits in the Bigger Errl Brain
- This is the minimal pattern for **DOM → zustand → R3F**:
  - Same pattern scales to: bubbles, projector controls, section-based mood shifts, etc.
- This landing is an isolated playground: safe place to prototype hypno interactions before merging into the full portal stack.
