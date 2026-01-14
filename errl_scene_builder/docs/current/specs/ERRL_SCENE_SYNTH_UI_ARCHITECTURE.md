# Errl Scene Synth — UI Architecture Specification (v1)

This document defines the layout, boundaries, and responsibilities of the Scene Synth Editor UI. Every UI component must follow this structure to ensure extensibility, readability, and consistency.

---

## 1. Global Layout

The app uses a 5-zone professional editor layout:

- **TopBar** → global scene actions and app-level commands
- **AssetPanel (Left)** → all available assets to spawn
- **SceneViewport (Center)** → the live canvas where scenes are composed
- **RightPanel** → layers, entity inspector, FX/weather
- **BottomBar** → playback controls and timeline info

Diagram:

|                TopBar                 |

| AssetPanel |    SceneViewport    | RightPanel |

|               BottomBar               |

All panels are independently scrollable. Panels may collapse into icon-only strips on smaller screens.

---

## 2. Component Responsibilities

### 2.1 TopBar
- Displays / edits scene name
- Holds template / background / preset selectors
- Holds export/import menus
- Optional: “Preview Mode” + “Errl Assist” button
- Never interacts with entity selection or transform logic

### 2.2 AssetPanel (Left)
- Displays assets grouped by category
- Supports click-to-spawn (drag-and-drop later)
- Uses the canonical `assets/registry.json`
- Never modifies layers or scene metadata
- MUST remain dumb: just “here are assets you can place”

### 2.3 SceneViewport (Center)
- Owns renderer mounting (`SvgRenderer`)
- Displays the scene visually
- Handles:
  - selecting entities
  - moving entities
  - drawing transform handles
- Reads from scene state and NOT from registry
- Does NOT decide what UI to show; purely visual

### 2.4 RightPanel
- Split into 3 tabs:
  - **Layers Panel**
  - **Inspector Panel**
  - **FX/Weather Panel**
- Handles:
  - layer ordering
  - layer visibility/locking
  - editing selected entity’s transform/style/motion
  - toggling FX and weather systems

### 2.5 BottomBar
- Playback controls:
  - play / pause / stop
  - speed multiplier
  - current time display
- May later include timeline or keyframes
- Emits only one state: `playbackTimeMs`

---

## 3. State Boundaries

### Global scene state lives in:
`useSceneStore.ts`

SceneViewport, Inspector, LayerPanel, and AssetPanel all read/write through this one store.

### SceneViewport DOES:
- respond to pointer events
- update selection
- update transforms

### SceneViewport does NOT:
- load assets
- reorder layers
- run FX rules
- handle export

### TopBar does NOT:
- modify entities or layers directly
- access renderer logic

---

## 4. Responsive Behavior

### Desktop (default)
- Left panel: 280px
- Right panel: 320px
- SceneViewport expands to fill remaining space

### Medium screens
- Both panels collapsible with chevron buttons
- Collapsed width: 48px icon-only strip

### Small screens (future)
- Editor switches to:
  - canvas top
  - panels bottom as swipeable drawers

---

## 5. Interaction Rules

### Selection
- Click entity → select single
- Shift-click → multi-select (optional future)
- Empty-click → clear selection
- Selecting a layer in LayerPanel:
  - sets active layer
  - optionally filters visible entities

### Spawning assets
- Click asset → spawn in center of viewport
- Default layer = active layer or “Main”

### Transform editing
- Visual handles in the viewport override inspector inputs
- Inspector inputs update entity instantly

### Motion & FX
- Motion applied per-entity
- FX / Weather applied globally or per-layer depending on type

---

## 6. Visual Style

- Dark UI: `#0b0f12`, `#14191f`
- Borders: `rgba(255,255,255,0.08)`
- Accents: emerald (`#2dd4bf`) and sky (`#38bdf8`)
- Typography:
  - panel headers: 10–11px, uppercase, tracking-wide
  - body text: 12–13px
- Canvas frame: soft radius + subtle shadow

---

## 7. Extensibility Principles

- Every panel is modular; adding a new panel should not break existing ones
- Panels must not own scene data—only read/write via store
- Renderer is a black box managed by `useSceneRenderer`
- All asset information comes from `assets/registry.json`
- UI must support future features:
  - AR view
  - VJ live mode
  - Gallery viewer
  - Storyboards
  - Totem exports
