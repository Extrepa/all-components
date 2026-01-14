# Errl Scene Synth — Errl Assist UI (v1)

Tiny helper bubble that surfaces contextual hints and one-click actions.

---

## Concept
- A small floating character/bubble anchored in a corner (default bottom-right).
- Shows occasional hints based on scene state (reads `useSceneStore`).
- Hints include one-click actions that call store helpers (add motion, toggle weather, change mood).

---

## UI Anatomy
- **Avatar/Bubble:** 48–64px circle with subtle wobble; click to open/close.
- **Panel:** Floating card with:
  - Hint title (short, playful)
  - Body text (1–2 lines)
  - Up to 2 action buttons (primary + ghost)
  - “Not now” link to dismiss
- **Badge:** Optional unread dot when closed and new hint is available.

---

## Placement & Behavior
- Default: bottom-right of the viewport frame; avoid covering transform handles.
- Draggable within viewport region (optional).
- Auto-idle: collapses to bubble after 6–8 seconds of inactivity.
- Shows at most one hint at a time; queue future hints.

---

## Hint Engine (rules)
Example triggers (poll store on interval or on scene mutations):
- No motion applied: “Add a float?” → action: add MOTION_FLOAT to selected or main entity.
- No FX: “Try a glow?” → action: add FX_GRAIN or glow preset.
- >5 layers unnamed: “Rename layers?” → action: focus LayerPanel rename or apply default names.
- No weather: “Add some orbs?” → action: add WEATHER_ORB_DRIFT.
- Background mood still DEFAULT: “Switch to NIGHT?” → action: set mood to NIGHT.

Hints should be debounced and not spammy: max 1 every ~10s, store dismissed hints by ID for the session.

---

## Actions (store integration)
- Uses existing store functions:
  - `addMotion(entityId, motion)` (wrap via updateEntity)
  - `addFx(fxInstance)`
  - `addWeather(weatherInstance)`
  - `updateSceneMeta` / background mood update
  - `setSelectedEntities`
- Errl Assist never mutates DOM directly; all via store.

---

## Visual Style
- Bubble: dark background, emerald/sky rim glow on hover.
- Panel: same panel style as right rail; header 11px uppercase.
- Buttons: Primary (emerald) + Ghost (outline).
- Microcopy tone: playful but concise, e.g., “This Errl is still. Give it a float?”

---

## Extensibility
- Add rule registry: `hints: { id, predicate(scene), message, actions[] }`.
- Future: plug in analytics to learn popular actions; allow user to mute hints.
