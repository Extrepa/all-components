<!-- File: ERRL_SCENE_SYNTH_BACKGROUNDS.md -->

# Errl Scene Synth – Background Packs (v1)

This document defines the background scenes used in Errl Scene Synth.  
Each background is composed of one or more layered SVG files that support parallax (Z-depth) and optional mood variations.

---

## 1. General Background Requirements

- **Format:** SVG preferred; raster (PNG/WebP) acceptable for complex textures.
- **Aspect Ratios Supported:**
  - 1:1 (square)
  - 16:9 (landscape)
  - 9:16 (portrait / story)
- **Layer Structure:**
  - Background scenes should be split into logical planes:
    - `BG` – far background (sky, distant walls)
    - `MG` – midground (furniture, tents, stage elements)
    - `FG` – foreground (plants, frames, curtains, drips)
- **Naming:**
  - `ERRL_BG_<SCENE>_<PLANE>.svg`
  - Example: `ERRL_BG_GRANDMAROOM_BG.svg`

---

## 2. Scene: Projector Lab

A hybrid between studio, lab, and visualist workstation.

### 2.1 Plane Definitions

1. `ERRL_BG_LAB_BG.svg`
   - Elements:
     - Back wall with subtle panel lines
     - Distant shelves indicated with simplified shapes
     - Soft gradient wash on wall

2. `ERRL_BG_LAB_MG.svg`
   - Elements:
     - Workbench / table surface
     - Light cables, simple racks, minimal clutter
     - Space on bench reserved for projectors/TVs (props are separate assets)

3. `ERRL_BG_LAB_FG.svg`
   - Elements:
     - A few foreground cables or stands
     - Edge-of-frame drips or shadows

---

## 3. Scene: Grandma’s Living Room

A cozy, nostalgic TV shrine environment.

### 3.1 Plane Definitions

1. `ERRL_BG_GRANDMAROOM_BG.svg`
   - Elements:
     - Wallpaper pattern (simple repeating motif)
     - Baseboard
     - Corner of room if applicable

2. `ERRL_BG_GRANDMAROOM_MG.svg`
   - Elements:
     - TV stand area
     - Side table and picture frames (empty or lightly detailed)
     - Shelf silhouettes

3. `ERRL_BG_GRANDMAROOM_FG.svg`
   - Elements:
     - Lampshade edge near the camera
     - Plant leaves intruding into frame
     - Rug edge

---

## 4. Scene: Festival Field

Outdoor Errl festival / gathering vibe.

### 4.1 Plane Definitions

1. `ERRL_BG_FESTIVAL_BG.svg`
   - Elements:
     - Sky gradient (day or dusk variants)
     - Distant hills or abstract shapes
     - Optional subtle crowd silhouettes

2. `ERRL_BG_FESTIVAL_MG.svg`
   - Elements:
     - Stage or riser hint
     - Tent tops and flags
     - Poles and lines for banners

3. `ERRL_BG_FESTIVAL_FG.svg`
   - Elements:
     - Grass or ground shapes near camera
     - Fence, cables, or fabric elements at frame edges

---

## 5. Scene: Void with Orbs

Minimal, abstract scene useful as a neutral playground.

### 5.1 Plane Definitions

1. `ERRL_BG_VOID_BG.svg`
   - Elements:
     - Simple gradient or radial background
     - Low-contrast noise or grain if desired

2. `ERRL_BG_VOID_MG.svg`
   - Elements:
     - A handful of large, soft orbs
     - Subtle overlaps to imply depth

3. `ERRL_BG_VOID_FG.svg`
   - Elements:
     - Smaller orbs and sparkles
     - Optional frame-like drips at top/bottom

---

## 6. Scene: Errl Shrine / Altar

A dedicated “Errl shrine” with pedestals and lighting.

### 6.1 Plane Definitions

1. `ERRL_BG_SHRINE_BG.svg`
   - Elements:
     - Wall or cosmic backdrop
     - Circular motif or halo behind center

2. `ERRL_BG_SHRINE_MG.svg`
   - Elements:
     - Central pedestal
     - Side pillars or small stands
     - Simple floor plane

3. `ERRL_BG_SHRINE_FG.svg`
   - Elements:
     - Candles, vials, or small props on the near plane
     - Occasional dangling drips or chains

---

## 7. Mood Variants

For each scene, the system may support multiple mood variants using either color swaps or separate assets.

Recommended moods per scene:

- `DEFAULT`
- `NIGHT`
- `NEON`
- `WARM_COZY`
- `HIGH_CONTRAST`

Implementation options:

1. Separate SVG files per mood:
   - `ERRL_BG_FESTIVAL_BG_NIGHT.svg`
2. Or color palettes applied via CSS/filters where feasible.

---

## 8. Background-Embedded Guides (Optional)

Each BG scene may optionally provide:

- A “guide” variant with faint lines or shapes showing recommended placement zones for:
  - Main Errl
  - Primary prop (projector/TV)
  - Supporting props

Naming:

- `ERRL_BG_<SCENE>_GUIDE.svg` (used only in editor mode, not in final render).

---