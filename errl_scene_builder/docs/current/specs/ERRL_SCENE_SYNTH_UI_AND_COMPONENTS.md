<!-- File: ERRL_SCENE_SYNTH_UI_AND_COMPONENTS.md -->

# Errl Scene Synth – UI & Component Architecture (v1)

This document describes the high-level UI flow and React/TypeScript component structure for the Errl Scene Synth web application.

---

## 1. Tech Stack (Recommended)

- Framework: React + TypeScript
- State: Zustand, Jotai, or Redux Toolkit (any predictable global store)
- Renderer:
  - Option A: SVG-based scene graph
  - Option B: Canvas/WebGL (e.g. PixiJS) with SVG-to-texture pipeline
- Styling: Tailwind CSS
- Routing: Next.js or React Router (optional)

---

## 2. High-Level UI Layout

The main **Scene Editor** view is composed of:

- **Top Bar:** project name, background selector, preset buttons, export/import.
- **Left Panel:** asset browser (“Asset Dock”).
- **Center:** main scene canvas / viewport.
- **Right Panel:** layer stack + inspector (transform, style, motion).
- **Bottom (optional):** tiny timeline strip for playback controls.

---

## 3. Route Structure

```
/               -> Landing / Template picker
/editor         -> Scene editor (blank or from default template)
/editor/:id     -> Load specific saved scene
/gallery        -> Public gallery (future)
/about          -> Optional info page
```

---

## 4. Component Tree (Editor)

```
<ErrlApp>
  <AppShell>
    <TopBar />
    <MainLayout>
      <AssetPanel />
      <SceneViewport />
      <RightPanel>
        <LayerPanel />
        <InspectorPanel />
      </RightPanel>
    </MainLayout>
    <BottomBar /> (optional)
  </AppShell>
</ErrlApp>
```

---

## 5. Key Components and Responsibilities

### 5.1 <TopBar />
- Shows scene title and basic actions.
- Responsibilities:
  - Rename scene
  - Select background scene + mood
  - Apply scene presets (e.g. “Calm Lab Drift”)
  - Export / import scene JSON
- Inputs:
  - Current ErrlScene state.
- Outputs:
  - Dispatch actions: setBackground, applyPreset, exportScene, importScene.

### 5.2 <AssetPanel />
- Shows asset categories and thumbnails.
- Categories:
  - Characters
  - Drips & Goo
  - Projectors & TVs
  - Environment
  - FX & Orbs
  - “Mystery” assets
- Interactions:
  - Click to spawn asset at center.
  - Drag-and-drop into SceneViewport if supported.
- Data:
  - Reads from canonical asset registry (e.g. assets/registry.json).

### 5.3 <SceneViewport />
- Central canvas where user manipulates entities.
- Responsibilities:
  - Render background planes (BG/MG/FG).
  - Render entities ordered by layer zIndex.
  - Show selection bounding boxes and transform handles.
- Support:
  - Click to select entity.
  - Drag to move.
  - Shift-drag to multi-select (optional).
  - Mouse wheel / gesture to zoom/pan (optional).
  - Parallax preview:
    - On mouse move, adjust rendering using layer.zDepth.
- Implementation:
  - Use either SVG or PixiJS.
  - Subscribe to global scene state.

### 5.4 <LayerPanel />
- Right-side list of SceneLayer rows.
- Each row:
  - Layer name editable.
  - Eye icon (visible toggle).
  - Lock icon (locked toggle).
  - Drag handle to reorder by zIndex.
  - Z-depth slider or numeric input.
- Actions:
  - Add new layer.
  - Delete layer (if empty or after confirmation).
  - Select layer to filter entities in viewport.

### 5.5 <InspectorPanel />
- Context-sensitive inspector for the selected entity (or multiple entities).

Tabs:
1. Transform
   - X, Y position inputs
   - Scale X/Y
   - Rotation
   - Pivot (dropdown presets: center, bottom-center, etc.)
2. Style
   - Opacity slider
   - Blend mode dropdown
   - Tint color picker
   - Palette variant dropdown
3. Motion
   - List of active MotionInstances.
   - Add motion: dropdown of MOTION_* IDs.
   - Each motion:
     - Enabled toggle
     - Speed/intensity sliders
     - Remove button
4. Metadata / Tags
   - PRIMARY_CHARACTER, SCREEN_SURFACE, etc.

### 5.6 <BottomBar /> (Optional / Future)
- Playback controls:
  - Play / pause
  - Preview duration selector (2s / 5s / 10s)
  - “Parallax demo” toggle

---

## 6. Global State Structure

Use a global store (e.g. Zustand) structured around the ErrlScene model.

```ts
type SceneStore = {
  scene: ErrlScene;
  selectedEntityIds: string[];
  selectedLayerId?: string;

  // Scene operations
  setScene: (scene: ErrlScene) => void;
  updateSceneMeta: (partial: Partial<ErrlScene>) => void;

  // Entity operations
  addEntity: (entity: SceneEntity) => void;
  updateEntity: (id: string, patch: Partial<SceneEntity>) => void;
  removeEntity: (id: string) => void;

  // Layer operations
  addLayer: (layer: SceneLayer) => void;
  updateLayer: (id: string, patch: Partial<SceneLayer>) => void;
  removeLayer: (id: string) => void;
  reorderLayers: (orderedIds: string[]) => void;

  // Selection
  setSelectedEntities: (ids: string[]) => void;
  setSelectedLayer: (id?: string) => void;

  // FX/Weather
  addFx: (fx: FxInstance) => void;
  updateFx: (id: string, patch: Partial<FxInstance>) => void;
  removeFx: (id: string) => void;

  addWeather: (config: SceneWeatherConfig) => void;
  updateWeather: (id: string, patch: Partial<SceneWeatherConfig>) => void;
  removeWeather: (id: string) => void;
};
```

---

## 7. Asset Registry

Define a static or generated registry mapping assetId to metadata.

```ts
type AssetDefinition = {
  id: string; // e.g. "ERRL_CHAR_HEAD_OG"
  category: "CHARACTER" | "DRIP" | "PROP" | "ENV" | "FX" | "MYSTERY" | "UI";
  label: string;
  description?: string;
  filePath: string; // e.g. "/assets/svg/ERRL_CHAR_HEAD_OG.svg"
  defaultStyle?: Partial<EntityStyle>;
  defaultMotion?: MotionInstance[];
};
```

Store as:
- assets/registry.json
- Or a TS module that exports an array/map of AssetDefinition.

<AssetPanel /> and the renderer both read from this registry.

---

## 8. Renderer Abstraction

Create a rendering abstraction so behavior is decoupled from React DOM:

```ts
interface ISceneRenderer {
  mount(container: HTMLElement): void;
  unmount(): void;
  render(scene: ErrlScene): void;
  setParallaxEnabled(enabled: boolean): void;
  handlePointerEvent(evt: PointerEvent): void;
}
```

React components interact with this renderer via a hook:

```ts
const { rendererRef } = useSceneRenderer();
```

This allows future migration from SVG to Canvas/WebGL with minimal UI changes.

---

## 9. Export / Import

Implement simple helpers:

```ts
function exportScene(scene: ErrlScene): string {
  return JSON.stringify(scene, null, 2);
}

function importScene(json: string): ErrlScene {
  const parsed = JSON.parse(json);
  // TODO: validate against schema, apply migrations if needed
  return parsed as ErrlScene;
}
```

Expose these via:
- Buttons in <TopBar />
- Optional download/upload as .errlscene.json

---

## 10. MVP Feature Checklist

- Load default scene on /editor
- Add asset from AssetPanel to center of SceneViewport
- Select and move entity
- Edit transform in InspectorPanel
- Change layer order in LayerPanel and see updated Z-order
- Add a simple motion (MOTION_FLOAT) and play preview
- Export/import scene JSON
- Toggle at least one global FX and one weather system

---

## 11. Next Actions

- Generate TS types/interfaces.
- Build the scene store.
- Scaffold the component tree and connect to the renderer abstraction.
- Implement the golden path: load default scene → add Errl head → move it → add MOTION_FLOAT → play → export JSON.
