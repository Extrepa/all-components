<!-- File: ERRL_SCENE_SYNTH_SCENE_SCHEMA.md -->

# Errl Scene Synth – Scene Data Model (v1)

This document defines the canonical JSON structure for representing a single Errl Scene Synth composition.

---

## 1. Overview

A **scene** is composed of:

- Global metadata (id, name, author, timestamps).
- Viewport configuration (size, aspect, background).
- Global FX and “weather” settings.
- A list of **layers** (Z-ordered).
- A list of **entities** (placed assets) referencing layers, assets, and motion behaviors.

All scenes should be serializable to and from JSON.

---

## 2. Top-Level Scene Structure

```ts
type ErrlScene = {
  version: string;
  id: string;
  name: string;
  description?: string;
  author?: {
    id?: string;
    name?: string;
  };
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601

  viewport: SceneViewport;
  background: SceneBackgroundConfig;
  fx: SceneFxConfig;
  weather: SceneWeatherConfig[];
  presetIds?: string[]; // applied scene presets

  layers: SceneLayer[];
  entities: SceneEntity[];
};
```

---

## 3. Viewport Configuration

```ts
type SceneViewport = {
  width: number;  // logical units, e.g. 1920
  height: number; // logical units, e.g. 1080
  aspectRatio: "1:1" | "16:9" | "9:16" | "CUSTOM";
  safeMargin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
};
```

---

## 4. Background Configuration

```ts
type SceneBackgroundConfig = {
  sceneId: string; // e.g. "FESTIVAL", "GRANDMAROOM", "LAB", "VOID", "SHRINE"
  moodId?: string; // e.g. "DEFAULT", "NIGHT", "NEON"

  // Background layers (BG/MG/FG) map to asset IDs
  planes: {
    bgAssetId?: string; // e.g. "ERRL_BG_FESTIVAL_BG"
    mgAssetId?: string;
    fgAssetId?: string;
  };

  // Optional additional parameters for BG shaders/filters
  params?: Record<string, number | string | boolean>;
};
```

---

## 5. FX and Weather Configuration

```ts
type SceneFxConfig = {
  globalFx: FxInstance[]; // e.g. grain, vignette, global glow
};

type FxInstance = {
  id: string; // unique instance id
  fxId: string; // e.g. "FX_GRAIN", "FX_VIGNETTE"
  enabled: boolean;
  params: Record<string, number | string | boolean>;
};

type SceneWeatherConfig = {
  id: string;        // unique instance id
  weatherId: string; // e.g. "WEATHER_DRIP_RAIN", "WEATHER_BUBBLES"
  enabled: boolean;
  params: Record<string, number | string | boolean>;
};
```

---

## 6. Layers

Layers represent Z-ordered planes for entity placement.

```ts
type SceneLayer = {
  id: string;
  name: string;
  zIndex: number; // user-facing integer for ordering
  zDepth: number; // -1.0 to +1.0 range, used for parallax
  visible: boolean;
  locked: boolean;
  isBackgroundPlane?: boolean; // true if it corresponds to BG/MG/FG plane
};
```

Notes:
- zIndex is used for sorting within the editor.
- zDepth is used for parallax calculations in the renderer.

---

## 7. Entities (Placed Assets)

Entities are individual objects in the scene: Errls, drips, projectors, orbs, etc.

```ts
type SceneEntity = {
  id: string; // unique per scene
  name?: string;

  assetId: string; // e.g. "ERRL_CHAR_HEAD_OG", "ERRL_DRIP_TOP_MEDIUM_A"
  layerId: string; // references SceneLayer.id

  transform: EntityTransform;
  style: EntityStyle;
  motion: MotionInstance[];
  behaviorTags?: string[]; // e.g. ["PRIMARY_CHARACTER", "SCREEN_SURFACE"]

  metadata?: Record<string, any>;
};
```

### 7.1 Transform

```ts
type EntityTransform = {
  x: number; // position in scene coords
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number; // degrees
  pivotX?: number;  // 0–1 normalized relative to asset bounds
  pivotY?: number;  // 0–1 normalized
};
```

### 7.2 Style

```ts
type EntityStyle = {
  opacity: number; // 0–1
  tintHex?: string; // optional hex color tint, e.g. "#FF00FF"
  blendMode?: "normal" | "add" | "multiply" | "screen" | "overlay";

  // Optional palette remap or variant
  paletteVariantId?: string; // e.g. "NEON", "WARM_COZY"

  // Arbitrary style params for shaders or filters
  custom?: Record<string, number | string | boolean>;
};
```

---

## 8. Motion Instances

Each motion instance is a parameterized application of a MOTION_* preset to an entity.

```ts
type MotionInstance = {
  id: string;      // unique per entity
  motionId: string; // e.g. "MOTION_FLOAT", "MOTION_WIGGLE"
  enabled: boolean;

  // Normalized parameter set; resolved by motion system
  params: {
    speed?: number;     // 0–1
    intensity?: number; // 0–1
    scaleAmount?: number;
    gravity?: number;
    radiusX?: number;
    radiusY?: number;
    phaseOffset?: number;
    [key: string]: number | string | boolean | undefined;
  };
};
```

---

## 9. Preset References

Scenes may reference applied presets from ERRL_SCENE_SYNTH_FX_AND_BEHAVIORS.md.

```ts
type ScenePresetRef = {
  presetId: string; // e.g. "PRESET_CALM_LAB_DRIFT"
  appliedAt: string; // ISO timestamp
};
```

(The top-level presetIds array may be replaced with a more detailed structure above if needed.)

---

## 10. Minimal Example Scene (JSON)

```json
{
  "version": "1.0.0",
  "id": "scene_001",
  "name": "First Errl Lab Test",
  "createdAt": "2025-11-22T00:00:00.000Z",
  "updatedAt": "2025-11-22T00:00:00.000Z",
  "viewport": {
    "width": 1920,
    "height": 1080,
    "aspectRatio": "16:9"
  },
  "background": {
    "sceneId": "LAB",
    "moodId": "DEFAULT",
    "planes": {
      "bgAssetId": "ERRL_BG_LAB_BG",
      "mgAssetId": "ERRL_BG_LAB_MG",
      "fgAssetId": "ERRL_BG_LAB_FG"
    }
  },
  "fx": {
    "globalFx": [
      {
        "id": "fx1",
        "fxId": "FX_GRAIN",
        "enabled": true,
        "params": {
          "strength": 0.3
        }
      }
    ]
  },
  "weather": [
    {
      "id": "weather1",
      "weatherId": "WEATHER_ORB_DRIFT",
      "enabled": true,
      "params": {
        "spawn_interval": 3,
        "drift_speed": 0.2
      }
    }
  ],
  "layers": [
    {
      "id": "layer_bg",
      "name": "Background",
      "zIndex": 0,
      "zDepth": -1,
      "visible": true,
      "locked": true,
      "isBackgroundPlane": true
    },
    {
      "id": "layer_main",
      "name": "Main",
      "zIndex": 1,
      "zDepth": 0,
      "visible": true,
      "locked": false
    },
    {
      "id": "layer_fg",
      "name": "Foreground",
      "zIndex": 2,
      "zDepth": 0.5,
      "visible": true,
      "locked": false
    }
  ],
  "entities": [
    {
      "id": "entity_errl_main",
      "assetId": "ERRL_CHAR_HEAD_OG",
      "layerId": "layer_main",
      "transform": {
        "x": 960,
        "y": 540,
        "scaleX": 1,
        "scaleY": 1,
        "rotation": 0
      },
      "style": {
        "opacity": 1,
        "blendMode": "normal"
      },
      "motion": [
        {
          "id": "motion_float_1",
          "motionId": "MOTION_FLOAT",
          "enabled": true,
          "params": {
            "speed": 0.4,
            "intensity": 0.6
          }
        }
      ]
    }
  ]
}
```

---

## 11. Next Steps

- Generate TS types/interfaces from this schema.
- Build the scene loader/saver.
- Seed test scenes.
- Wire this into localStorage, Supabase, or similar storage.
