<!-- File: ERRL_SCENE_SYNTH_FX_AND_BEHAVIORS.md -->

# Errl Scene Synth – FX, Weather, and Behavior Presets (v1)

This document defines motion presets, “Errl Weather” systems, special FX overlays, and mystery behaviors used in the Errl Scene Synth app.

---

## 1. Motion Presets

Motion presets are parameterized behaviors that can be applied to any asset instance.  
Each preset defines a minimal set of parameters: `speed`, `intensity`, `phase`, and `easing`.

### 1.1 Float

- ID: `MOTION_FLOAT`
- Behavior: Vertical sine-wave movement with subtle scale modulation.
- Parameters:
  - `speed` (0–1): frequency of movement.
  - `intensity` (0–1): vertical amplitude.
  - `scale_amount` (0–0.1): optional squish/stretch.

### 1.2 Wiggle

- ID: `MOTION_WIGGLE`
- Behavior: Small rotation and scale jitter.
- Parameters:
  - `speed`
  - `intensity` (applied to rotation range)
  - `scale_jitter` (e.g. ±3–5%).

### 1.3 Drip

- ID: `MOTION_DRIP`
- Behavior: Slow downward movement with reset; optional vertical stretch.
- Parameters:
  - `speed`
  - `gravity` (drop speed multiplier)
  - `reset_mode`: loop or ping-pong.

### 1.4 Pulse

- ID: `MOTION_PULSE`
- Behavior: Periodic uniform scale in/out.
- Parameters:
  - `speed`
  - `intensity` (scale delta)
  - `easing`

### 1.5 Orbit

- ID: `MOTION_ORBIT`
- Behavior: Circular or elliptical motion around a pivot point.
- Parameters:
  - `radius_x`
  - `radius_y`
  - `speed`
  - `phase_offset`

---

## 2. Errl Weather Systems

“Weather” systems are global or semi-global effects that spawn and animate small assets across the scene.

### 2.1 Drip Rain

- ID: `WEATHER_DRIP_RAIN`
- Assets used:
  - `ERRL_DRIP_TOP_SMALL_A.svg`
  - `ERRL_DRIP_TOP_MEDIUM_A.svg`
- Behavior:
  - Periodic spawn from the top of the canvas.
  - Each drip falls with `MOTION_DRIP` parameters.
  - Optional splat on bottom using `ERRL_SPLAT_SMALL` or `ERRL_PUDDLE_SMALL`.

Parameters:

- `spawn_rate` (drips per second)
- `fall_speed`
- `max_simultaneous_drips`

### 2.2 Bubble Rise

- ID: `WEATHER_BUBBLES`
- Assets:
  - Small circular orbs (e.g. `ERRL_FX_ORB_SMALL_A.svg`).
- Behavior:
  - Spawn from bottom, drift upward with slight horizontal noise (“bubbly” movement).
- Parameters:
  - `spawn_rate`
  - `rise_speed`
  - `horizontal_noise_amount`

### 2.3 Orb Drift

- ID: `WEATHER_ORB_DRIFT`
- Assets:
  - `ERRL_FX_ORB_MEDIUM_A.svg`
  - `ERRL_FX_ORB_RING.svg`
- Behavior:
  - Orbs appear at random positions and slowly drift.
- Parameters:
  - `spawn_interval`
  - `lifetime`
  - `drift_speed`

---

## 3. Global FX Overlays

Global overlays are drawing passes applied over the entire scene.

### 3.1 Grain

- ID: `FX_GRAIN`
- Asset:
  - `ERRL_FX_GRAIN_SOFT.svg` or shader-based noise.
- Parameters:
  - `strength` (0–1)
  - `scale`
  - `blend_mode` (e.g. `overlay` or `soft-light`)

### 3.2 Vignette

- ID: `FX_VIGNETTE`
- Asset:
  - `ERRL_FX_EDGE_VIGNETTE.svg`
- Parameters:
  - `darkness` (0–1)
  - `radius`
  - `softness`

### 3.3 Glow Pass

- ID: `FX_GLOBAL_GLOW`
- Behavior:
  - Slight duplication and blur of bright elements.
- Parameters:
  - `radius`
  - `intensity`

---

## 4. Projector/Screen Behaviors

These behaviors apply to projector and TV props and any “screen” regions.

### 4.1 Screen Flicker

- ID: `SCREEN_FLICKER`
- Behavior:
  - Subtle brightness and color shift over time.
- Parameters:
  - `speed`
  - `intensity`
  - `grain_mix`

### 4.2 Projection Cone Light

- ID: `PROJECTOR_BEAM`
- Asset:
  - `ERRL_PROP_OVERHEAD_PROJECTOR_V1.svg` with `group_glow_cone`.
- Behavior:
  - Animate cone opacity and noise to simulate a “dusty light” beam.
- Parameters:
  - `pulse_speed`
  - `opacity_min`
  - `opacity_max`
  - `grain_amount`

---

## 5. Mystery Button Behaviors

Mystery behaviors are intentionally playful and slightly unpredictable.

### 5.1 Spawn Tiny Errls

- ID: `MYSTERY_TINY_ERRLS`
- Assets:
  - `ERRL_CHAR_HEAD_TINY_SINGLE_A.svg`
  - `ERRL_CHAR_HEAD_TINY_SCATTER_A.svg`
- Behavior:
  - A random number of tiny Errls appear scattered at random positions.
  - Each tiny Errl uses `MOTION_FLOAT` or `MOTION_WIGGLE`.
- Parameters:
  - `count_min`, `count_max`
  - `lifetime` (if auto-despawn is used)

### 5.2 Surprise Color Shift

- ID: `MYSTERY_COLOR_SHIFT`
- Behavior:
  - Temporarily remaps the palette for selected layers or entire scene.
- Parameters:
  - `duration`
  - `palette_variant` (e.g. NEON, WARM, COOL)
  - `target_scope` (single layer, characters only, global)

### 5.3 Portal Pulse

- ID: `MYSTERY_PORTAL_PULSE`
- Assets:
  - `ERRL_FX_MYSTERY_PORTAL_A.svg`
- Behavior:
  - Spawns a portal-like FX near center or behind Errl.
  - Uses `MOTION_PULSE` and `FX_GLOBAL_GLOW` locally.
- Parameters:
  - `scale_min`, `scale_max`
  - `pulse_speed`
  - `opacity`

---

## 6. Preset Combinations (“Scenes in a Box”)

These combinations are ready-made configurations of FX, weather, and behaviors that can be applied as a single preset.

### 6.1 “Calm Lab Drift”

- ID: `PRESET_CALM_LAB_DRIFT`
- Components:
  - `MOTION_FLOAT` applied to main Errl and key props.
  - `WEATHER_ORB_DRIFT` with low spawn rate.
  - `FX_GRAIN` with low strength.
  - No mystery behaviors by default.

### 6.2 “Festival Glow Mode”

- ID: `PRESET_FESTIVAL_GLOW`
- Components:
  - `MOTION_FLOAT` on foreground orbs.
  - `WEATHER_BUBBLES` for atmosphere.
  - `FX_GLOBAL_GLOW` medium strength.
  - Optional `MYSTERY_COLOR_SHIFT` on toggle.

### 6.3 “Shrine Ceremony”

- ID: `PRESET_SHRINE_CEREMONY`
- Components:
  - `MOTION_PULSE` on shrine halo and central Errl.
  - `WEATHER_ORB_DRIFT` with slower speed.
  - `FX_VIGNETTE` medium intensity.
  - Optional `MYSTERY_PORTAL_PULSE` on trigger.

---

## 7. Parameter Ranges (Suggested Defaults)

To keep behavior consistent, use the following recommended ranges:

- `speed`: 0.1–1.0
- `intensity`: 0.1–1.0
- `scale_amount`: 0.01–0.2
- `spawn_rate`: 0–20 per second (depending on effect)
- `opacity`: 0–1
- `radius` (for glow/vignette): scene-size dependent; use normalized 0–1 where possible.

These ranges can be exposed to the UI as normalized sliders, mapped internally to specific effect values.

---