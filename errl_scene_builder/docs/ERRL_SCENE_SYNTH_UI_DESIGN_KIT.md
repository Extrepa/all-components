# Errl Scene Synth — UI Design Kit (v1)

This document defines the visual system, component hierarchy, and interaction patterns for the Errl Scene Synth editor. It pairs with `ERRL_SCENE_SYNTH_UI_ARCHITECTURE.md`.

---

## 1. Design Goals

- **Obvious** — users should instantly understand where to click.
- **Playful, not intimidating** — closer to a toy or DAW than a 3D/CAD app.
- **Extensible** — new panels and modes can be added without redesigning everything.
- **Errl-centric** — the content (goo, projectors, scenes) should be loud; the UI is calm.

---

## 2. Design Tokens

These map 1:1 to `src/styles.css` (or equivalent).

### 2.1 Colors

```ts
// semantic tokens
--color-bg-app:        #060712;
--color-bg-panel:      #0b0d1a;
--color-bg-card:       #0e1022;
--color-border-subtle: rgba(255, 255, 255, 0.08);
--color-border-strong: rgba(255, 255, 255, 0.16);

--color-text-main:     #f4f0ff;
--color-text-muted:    #9aa2c0;

--color-accent-1:      #5be0ff;  // cyan – primary accent
--color-accent-2:      #ff7ad1;  // pink – secondary accent
--color-accent-3:      #ffd166;  // highlight / warning

--color-bg-topbar:     rgba(255, 255, 255, 0.03);
--color-bg-playback:   rgba(255, 255, 255, 0.03);
```

### 2.2 Radii, Shadow, Typography

```
--radius-lg: 12px;
--radius-md: 10px;
--radius-sm: 6px;

--shadow-elevated: 0 18px 50px rgba(0, 0, 0, 0.35);

--font-sans: "Space Grotesk", "Inter", system-ui, -apple-system, sans-serif;
```

Typographic rules:
- Panel headers: 10–11px, uppercase, tracking 0.08em, muted color.
- Body text: 13px for primary UI, 12px for secondary notes.
- Avoid more than 2 font sizes inside any single panel.

---

## 3. Global Layout Components

### 3.1 `<AppShell />`

Responsibility: Frame the entire app, supply background and global font.
- Uses `.app-shell`.
- Fills viewport vertically.
- Contains AppRouter.

### 3.2 `<MainLayout />`

Responsibility: The 5-zone “DAW style” skeleton.

Children:
- left → AssetPanel
- children → SceneViewport + any viewport controls
- right → RightPanel (Layers/Inspector/FX)
- bottom → BottomBar (Playback)

Visually:
- Uses `.main-layout`.
- left and right use `.side-panel` and `.side-panel.right`.
- bottom uses `.playback-bar`.

---

## 4. Top-Level Component Tree

### 4.1 Routing

```
<AppShell>
  <AppRouter> // React Router
    "/"          → <TemplateGrid />
    "/editor"    → <ErrlEditor />
    "/view/:id"  → <Viewer />
  </AppRouter>
</AppShell>
```

### 4.2 Editor Screen

```
<ErrlEditor>
  <TopBar />

  <MainLayout
    left={<AssetPanel />}
    right={<RightPanel />}     // tabs: Layers / Inspector / FX-Weather
    bottom={<BottomBar />}     // wraps PlaybackControls + status
  >
    <SceneViewport />          // central canvas
  </MainLayout>
</ErrlEditor>
```

### 4.3 Viewer Screen

```
<Viewer>
  <TopBarViewer />             // minimal: title + back to editor
  <SceneViewport />            // same renderer, no side panels
  <BottomBar>
    <PlaybackControls />       // play-only view
  </BottomBar>
</Viewer>
```

### 4.4 RightPanel Tabs

```
<RightPanel>
  <Tabs>                       // "Layers" | "Inspector" | "FX / Weather"
    Layers    → <LayerPanel />
    Inspector → <EntityInspector />
    FX/Weather→ <FxWeatherPanel />
  </Tabs>
</RightPanel>
```

---

## 5. Core UI Components & Styling

### 5.1 TemplateGrid (Landing)

Purpose: First screen people see; choose a starting point.

Style:
- Uses `.grid-templates` for layout.
- Each card uses `.template-card`.

Content per card:
- Title (bold, 14px)
- Short description (muted)
- Optional tiny tag (e.g. “Lab”, “Grandma TV”, “Festival”)

Behavior:
- Click → setScene(templateScene) → navigate("/editor").

### 5.2 TopBar (Editor)

Purpose: “Scene brain” – global controls.

Layout:
- Root: `.topbar`
- Left: Scene name (editable)
- Middle: Template select, Background Mood select
- Right: Apply Preset button, Share Scene, Export JSON, Import JSON

Style:
- Buttons use `.button` and `.button-primary` where needed.
- Inputs use `.input`.

Microcopy ideas:
- Empty scene name placeholder: "Untitled Errl Scene"
- Share success message: "Link copied!"
- Share fail (not found): "Scene not found"

### 5.3 AssetPanel (Left)

Purpose: Asset dock / toy box.

Layout:

```
<aside className="side-panel">
  <div className="panel-header">Assets</div>
  <div className="asset-list">
    {/* One button per asset or grouped by category */}
  </div>
</aside>
```

Styling:
- Buttons use `.template-card` for consistency:
  - top line: category (`.label-muted`, uppercase)
  - second line: `asset.label`
  - third line: small `asset.id` in `.label-muted`

Future enhancement:
- Chips or toggles to filter by category: CHAR / DRIP / PROP / ENV / FX / MYSTERY.
- Tiny emoji per category: CHAR → 😮, DRIP → 💧, PROP → 📽️, FX → ✨.

### 5.4 SceneViewport (Center)

Purpose: Main stage + overlay.

Shell structure:

```
<div className="viewport-shell">
  <div className="viewport-frame" ref={containerRef}>
    {/* SVG renderer mounts inside */}
    <ExportDialog />
    <TransformOverlay />  // selection box + handles
  </div>
</div>
```

Style:
- `.viewport-shell`: centers content on a subtle gradient.
- `.viewport-frame`: card-like frame with radius and border.

Overlays:
- Selection box:
  - thin cyan border
  - small handles:
    - bottom-right: scale
    - top-center: rotation
  - Transform rules:
    - drag to move
    - shift-drag to snap to 10px grid
    - rotation snaps to 5°

### 5.5 RightPanel (Layers / Inspector / FX)

Panel shell:

```
<aside className="side-panel right">
  <TabsHeader />  // simple horizontal tab buttons
  <TabBody />     // scrollable, panel content
</aside>
```

#### 5.5.1 Layers Panel

Each layer row:
- Eye icon (visible toggle)
- Lock icon (locked toggle)
- Label (editable name)
- Drag handle for reordering (future)

Visual:
- Slightly darker background for active layer.
- Muted label for inactive ones.

#### 5.5.2 Entity Inspector

Sections:
1. Selection summary
   - If none: “No entity selected.”
   - If one: show asset.label and ID.
2. Transform
   - Inputs for X, Y, Scale, Rotation.
3. Style
   - Opacity slider
   - Blend mode dropdown
   - Tint color picker (future)
4. Motion
   - List of motions: motion type tag (FLOAT, ORBIT, DRIP, etc.)
   - Sliders: speed, intensity, etc.
   - “Add motion” dropdown.

Each section:
- Title: `.panel-header` + maybe a tiny icon.
- Content: stacked rows, 8–12px spacing.

#### 5.5.3 FX / Weather Panel

Controls:
- Toggles: Grain, Glow, Vignette, Weather systems (Drip Rain, Orbs, Bubbles)
- Sliders: Intensity, Spawn rate, Blur/softness

Goal: a “make it more magical” control panel that never feels technical.

### 5.6 BottomBar (Playback / Status)

Structure:

```
<div className="playback-bar">
  <PlaybackControls />       // main controls
  <div className="status-region">
    {/* selected entity name, active layer, etc */}
  </div>
</div>
```

PlaybackControls contents:
- Transport: Stop, Play/Pause
- Slider: Playback speed (0.25x–2x)
- Time display: `t = 1.2s` or `1.2s / 5.0s`

Status region:
- Show: Layer: Foreground; Entity: ERRL_CHAR_HEAD_OG; Parallax: On (future)

---

## 6. Interaction Patterns

### 6.1 Keyboard

Future-friendly suggestions (not required now):
- Delete → delete selected entity
- Cmd/Ctrl + Z → undo
- Arrow keys → nudge selected entity (1px; with Shift: 10px)

### 6.2 Mouse / Pointer

- Click entity → select.
- Drag entity → move (with snapping when Shift).
- Drag scale handle → uniform scale.
- Drag rotate handle → rotate (snapping to 5°).
- Double-click entity → open Inspector tab automatically (optional).

---

## 7. Microcopy / Vibes

Use tiny bits of Errl personality without drowning the UI.

Examples:
- No selection: "Click an Errl piece to inspect it."
- No motion applied: "Add some motion — Errl hates sitting still."
- Empty layer list: "No layers yet. New scenes start with a 'Main' layer by default."
- FX panel with everything off: "Everything is calm. Turn on some FX to weird it up."

Tone: light, encouraging, not snarky.

---

## 8. Future Extension Hooks

The design must support:
- Live Mode / VJ Mode (button in TopBar or BottomBar toggling a different overlay)
- Stories / Timelines (extra tab in RightPanel: “Story”)
- Gallery (route: `/gallery` with cards similar to TemplateGrid)

All new features should be built as panels or overlays inside this existing layout, not as one-off screens.

---

If you toss this into your repo as `ERRL_SCENE_SYNTH_UI_DESIGN_KIT.md` and pair it with the architecture doc, Codex basically has:
- What to build
- Where to put it
- How it should look
- How it should behave

From here, you can start giving Codex super-specific tasks like:
- “Implement `RightPanel` exactly according to sections 5.5.1–5.5.3 of the UI design kit.”
- “Style `SceneViewport` + `TransformOverlay` to match section 5.4.”
