# Selection and Drag Behavior

This document explains how selection and drag interactions work in the Scene Viewport.

## Selection

- Click on an entity to select it (single-selection).
- Click on empty space to clear selection.
- Multi-select/shift-click is not implemented yet (future).

Selection updates are routed through the scene store:
- `setSelectedEntities([id])` to select a single entity.
- `setSelectedEntities([])` to clear.
- `setSelectedLayer(id?)` can be used to focus a layer (not required for selection).

## Dragging

- Pointer down on an entity starts a drag session.
- Scene coordinates are derived from the SVG viewBox (0–1024) using the element’s bounding rect.
- Pointer move computes deltas relative to drag start and updates `entity.transform.x/y` via `updateEntity`.
- Pointer up ends the drag session.
- Only translation is handled; rotation/scale handles are not implemented yet.

## Future Enhancements

- Multi-select + box-select.
- Drag constraints (snap to grid, limit to layer bounds).
- Rotation/scale handles and pivot presets.
- Keyboard shortcuts (arrow nudging, delete, duplicate).
