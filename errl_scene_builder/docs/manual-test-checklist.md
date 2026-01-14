# Manual Test Checklist (current feature set)

## Editor Basics
- [ ] Load app: Guided Setup appears.
- [ ] Choose a template (Lab/Grandma/Festival/Void/Shrine) and scene loads without errors.
- [ ] Add an asset from the AssetPanel: entity appears at center; selection state updates.
- [ ] Click an entity to select; click empty space to deselect.
- [ ] Drag an entity: position updates and stays in place after mouse up.

## Transform Handles
- [ ] With an entity selected, scale handle (bottom-right) scales up/down; rotation handle adjusts rotation.
- [ ] Transform updates reflect in the Inspector.

## Motion / Playback
- [ ] Play/Pause/Stop updates motion playback; animated motions (FLOAT/WIGGLE/etc.) visibly move.
- [ ] Adjust speed slider and see faster/slower animation.
- [ ] Inspector: add/remove motion; edit speed/intensity; orbit params; drip gravity; changes reflect in playback.

## Background / Mood / Templates
- [ ] TopBar mood selector updates background mood (asset swap/recolor where applicable).
- [ ] TopBar template dropdown loads a different template; scene swaps cleanly.
- [ ] Landing template grid routes to /editor after selection.
- [ ] /view/:shareId loads shared scene (localStorage fallback if backend absent).

## Export
- [ ] Export PNG (Screen preset) downloads a file.
- [ ] Export SVG downloads a valid SVG.

## Selection/Layer
- [ ] LayerPanel visibility toggle hides/shows entities on that layer.
- [ ] Selecting a layer highlights it; entities remain selectable.

## Error/Regression Checks
- [ ] No console errors during the above flows.
- [ ] Renderer still displays scene after template swaps and playback toggles.
