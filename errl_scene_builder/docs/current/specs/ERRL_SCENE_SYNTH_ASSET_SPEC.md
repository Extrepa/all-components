<!-- File: ERRL_SCENE_SYNTH_ASSET_SPEC.md -->

# Errl Scene Synth – Asset Specification (v1)

This document defines the visual asset requirements for the Errl Scene Synth web application.  
All identifiers and naming conventions in this document should be treated as canonical for v1.

---

## 1. General Requirements

- **Primary format:** SVG (vector), with clean, minimal path counts and grouping.
- **Secondary formats (optional):** PNG/WebP raster exports for thumbnails or previews.
- **Coordinate system:** 0,0 at top-left; design around 1024×1024 or 2048×2048 artboards for consistency.
- **Styling:**
  - Prefer `fill` and `stroke` attributes over embedded styles whenever possible.
  - Use consistent layer names and `id` attributes (e.g. `errl_face_base`, `drip_outline`, `projector_glow`).
- **Color:**
  - Use a brand palette defined later (to be implemented as CSS variables or design tokens).
  - Avoid baked-in lighting unless explicitly required (FX assets may contain lighting).
- **Z-layer usage:**
  - Foreground, midground, background variants should be clearly separated (suffixes `_FG`, `_MG`, `_BG`).

---

## 2. Naming Conventions

**File Naming:**

- `ERRL_<CATEGORY>_<DESCRIPTOR>[_VARIANT].svg`
- Examples:
  - `ERRL_CHAR_HEAD_OG.svg`
  - `ERRL_DRIP_SPLAT_BIG_A.svg`
  - `ERRL_PROP_OVERHEAD_PROJECTOR_V1.svg`

**IDs and Groups:**

- Group IDs use lowercase with underscores.
- Examples:
  - `group_face`
  - `group_body`
  - `group_glow`
  - `group_shadow`
  - `group_projector_head`

---

## 3. Core Character Assets

These are the primary Errl character assets users will place as focal points in scenes.

### 3.1 Head-Only Assets

**Purpose:** Simple, iconic Errl face for quick compositions and stickers.

Required assets:

1. `ERRL_CHAR_HEAD_OG.svg`
   - Description: Original Errl head shape and face, neutral “wow” expression.
   - Layers:
     - `group_head_base`
     - `group_face_circle`
     - `group_eyes`
     - `group_mouth`
     - `group_highlights`
     - `group_outline`
     - Optional: `group_glow`

2. `ERRL_CHAR_HEAD_HAPPY.svg`
   - Description: Same head geometry as OG; joyful expression.
   - Layers as above; only facial features change.

3. `ERRL_CHAR_HEAD_MELTY.svg`
   - Description: Slightly drippier / melted lower edge; same face circle.
   - Additional layers:
     - `group_lower_drips`
     - `group_shadow_drips`

4. `ERRL_CHAR_HEAD_TINY.svg`
   - Description: Miniature version with simplified paths for use as a repeatable motif.
   - Single group: `group_head_tiny`

### 3.2 Head + Body Variants

**Purpose:** Scenes where Errl is interacting with props (projectors, TVs, etc.).

Required assets:

1. `ERRL_CHAR_FULL_STANDING.svg`
   - Pose: Neutral standing position.
   - Layers:
     - `group_head`
     - `group_body`
     - `group_arms`
     - `group_legs`
     - `group_shadow`

2. `ERRL_CHAR_FULL_LEANING_PROJECTOR.svg`
   - Pose: Leaning on projector or console.
   - Layers:
     - `group_head`
     - `group_body`
     - `group_arm_left_on_prop`
     - `group_prop_placeholder` (optional bounding box for alignment)

3. `ERRL_CHAR_FULL_FLOATING.svg`
   - Pose: Slight hover, small squish/stretch.
   - Designed to work well with “float” animation.

---

## 4. Drips, Goo, and Fluid Assets

These assets define the “goo” language of Errl’s universe.

### 4.1 Top Drips

1. `ERRL_DRIP_TOP_SMALL_A.svg`
2. `ERRL_DRIP_TOP_MEDIUM_A.svg`
3. `ERRL_DRIP_TOP_WIDE_A.svg`

- Layers:
  - `group_fill`
  - `group_outline`
  - Optional: `group_highlight`, `group_shadow`

### 4.2 Side Drips

1. `ERRL_DRIP_SIDE_LEFT_A.svg`
2. `ERRL_DRIP_SIDE_RIGHT_A.svg`
3. `ERRL_DRIP_SIDE_CHAIN.svg` (multiple connected drips)

### 4.3 Puddles and Splats

1. `ERRL_PUDDLE_SMALL.svg`
2. `ERRL_PUDDLE_LARGE.svg`
3. `ERRL_SPLAT_BIG_A.svg`
4. `ERRL_SPLAT_DIRECTIONAL_LEFT.svg`
5. `ERRL_SPLAT_DIRECTIONAL_RIGHT.svg`

Each puddle/splat should contain:

- `group_fill`
- `group_outline`
- `group_inner_highlights`
- `group_shadow`

---

## 5. Projectors, TVs, and Tech Props

These props anchor the “Errl as visualist” theme.

### 5.1 Overhead Projectors

1. `ERRL_PROP_OVERHEAD_PROJECTOR_V1.svg`
   - Layers:
     - `group_base`
     - `group_arm`
     - `group_head`
     - `group_glass`
     - `group_glow_cone` (projection cone; separate for blending)

2. `ERRL_PROP_OVERHEAD_PROJECTOR_TOPDOWN.svg`
   - Top-down stylized projector for background use.

### 5.2 Old TVs

1. `ERRL_PROP_TV_GRANDMA_V1.svg`
2. `ERRL_PROP_TV_GRANDMA_V2_ROUNDED.svg`

- Layers:
  - `group_cabinet`
  - `group_screen_mask`
  - `group_knobs`
  - `group_speaker_grill`
  - `group_glass_reflection`

### 5.3 Consoles and Racks

1. `ERRL_PROP_RACK_SIMPLE.svg`
2. `ERRL_PROP_MIXER_CONSOLE_V1.svg`

- Designed as horizontal surfaces for Errl to lean on or sit behind.

---

## 6. Environmental Props

### 6.1 Festival / Stage Elements

1. `ERRL_ENV_STAGE_RISER.svg`
2. `ERRL_ENV_TRUSS_SIMPLE.svg`
3. `ERRL_ENV_TENT_EDGE.svg`
4. `ERRL_ENV_FLAG_SMALL.svg` (can repeat along ropes)

### 6.2 Cozy / “Grandma” Elements

1. `ERRL_ENV_COZY_RUG_ROUND.svg`
2. `ERRL_ENV_SIDE_TABLE.svg`
3. `ERRL_ENV_LAMP_SHADE.svg`
4. `ERRL_ENV_PICTURE_FRAME_EMPTY.svg`

### 6.3 Plants & Natural Elements

1. `ERRL_ENV_PLANT_POTTED_A.svg`
2. `ERRL_ENV_PLANT_VINE_TOP.svg`
3. `ERRL_ENV_CLOUD_POOF_A.svg`
4. `ERRL_ENV_STAR_SIMPLE.svg`

---

## 7. FX, Orbs, and Overlays

### 7.1 Orbs and Glows

1. `ERRL_FX_ORB_SMALL_A.svg`
2. `ERRL_FX_ORB_MEDIUM_A.svg`
3. `ERRL_FX_ORB_RING.svg`

- Layers:
  - `group_core`
  - `group_soft_glow`
  - Optional `group_inner_noise`

### 7.2 Sparkles & Particles

1. `ERRL_FX_SPARKLE_FOURPOINT.svg`
2. `ERRL_FX_SPARKLE_EIGHTPOINT.svg`
3. `ERRL_FX_PARTICLE_CLUSTER_A.svg`

### 7.3 Grain & Texture Overlays

1. `ERRL_FX_GRAIN_SOFT.svg`
2. `ERRL_FX_GRAIN_STRONG.svg`
3. `ERRL_FX_EDGE_VIGNETTE.svg`

These are intended as full-frame overlays with transparent/mask regions.

---

## 8. Parallax/Depth Helper Elements

These assets are intended specifically for Z-layer differentiation.

1. `ERRL_DEPTH_FG_PLANTS_A.svg`
2. `ERRL_DEPTH_FG_DRIPS_FRAME.svg`
3. `ERRL_DEPTH_MG_ORBS_FIELD.svg`
4. `ERRL_DEPTH_BG_STARS_FIELD.svg`

Each should be visually lightweight but suggest clear depth layers.

---

## 9. UI and Editor Icon Assets

Small icons for the interface, if not drawn via pure CSS.

1. `ERRL_UI_ICON_DRAG_HANDLE.svg`
2. `ERRL_UI_ICON_LAYER_VISIBLE.svg`
3. `ERRL_UI_ICON_LAYER_HIDDEN.svg`
4. `ERRL_UI_ICON_LOCK.svg`
5. `ERRL_UI_ICON_UNLOCK.svg`
6. `ERRL_UI_ICON_RANDOMIZE.svg`
7. `ERRL_UI_ICON_PLAY.svg`
8. `ERRL_UI_ICON_PAUSE.svg`
9. `ERRL_UI_ICON_RESET.svg`

---

## 10. Tiny Errls and Mystery Assets

These support “mystery button” and easter-egg features.

1. `ERRL_CHAR_HEAD_TINY_SCATTER_A.svg` (cluster of small heads)
2. `ERRL_CHAR_HEAD_TINY_SINGLE_A.svg`
3. `ERRL_FX_MYSTERY_GLYPH_A.svg` (abstract symbol)
4. `ERRL_FX_MYSTERY_PORTAL_A.svg` (subtle portal motif)

These should be recognizably “Errl” but visually low-noise to avoid clutter.

---