# Sharing and Viewer

This document outlines a simple sharing and read-only viewer model for Errl scenes.

## Shared Scenes

```ts
type SharedScene = {
  shareId: string;   // e.g. "errl-6x3f"
  scene: ErrlScene;  // full scene JSON
  createdAt: string; // ISO timestamp
};
```

Shared scenes can be persisted in a backend or static JSON map:
- Current implementation: localStorage map (save/load by `shareId`).
- Future: API endpoint `/api/share/:shareId` if/when a backend is added.

## Routes (suggested)

- `/view/:shareId` – read-only viewer
  - Loads scene by shareId
  - Renders with play/pause + parallax hover
  - No editor UI
  - Button: “Remix in Editor” -> clones scene into `/editor/:newId`

- `/gallery` – grid of shared scenes
  - Thumbnails (pre-rendered PNG or live render)
  - Filters: Latest, Most remixed, Mood tags

## Minimal Viewer Component (concept)

```tsx
const Viewer: React.FC<{ scene: ErrlScene }> = ({ scene }) => {
  return (
    <div className="viewer">
      <SceneViewport readOnly scene={scene} />
      <PlaybackControls />
      <button onClick={() => remix(scene)}>Remix in Editor</button>
    </div>
  );
};
```

## Remix Flow

- Fetch shared scene by shareId
- Clone with a new id and `isTemplate: false`
- Push into the editor route/state

## Sharing Button (editor)

- “Share Scene”:
  - Saves scene JSON
  - Generates shareId (e.g., `errl-${random}`)
  - Displays shareable URL: `/view/${shareId}`

## Security/Validation

- Validate incoming scene JSON against schema before rendering.
- Sanitize asset IDs to match registry to avoid missing assets.
