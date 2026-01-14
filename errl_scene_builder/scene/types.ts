export type AspectRatio = "1:1" | "16:9" | "9:16" | "CUSTOM";

export type SceneViewport = {
  width: number;
  height: number;
  aspectRatio: AspectRatio;
  safeMargin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
};

export type SceneBackgroundConfig = {
  sceneId: "FESTIVAL" | "GRANDMAROOM" | "LAB" | "VOID" | "SHRINE" | string;
  moodId?: "DEFAULT" | "NIGHT" | "NEON" | "WARM_COZY" | "HIGH_CONTRAST" | string;
  planes: {
    bgAssetId?: string;
    mgAssetId?: string;
    fgAssetId?: string;
  };
  params?: Record<string, number | string | boolean>;
};

export type FxInstance = {
  id: string;
  fxId: "FX_GRAIN" | "FX_VIGNETTE" | "FX_GLOBAL_GLOW" | string;
  enabled: boolean;
  params: Record<string, number | string | boolean>;
};

export type SceneFxConfig = {
  globalFx: FxInstance[];
};

export type SceneWeatherConfig = {
  id: string;
  weatherId: "WEATHER_DRIP_RAIN" | "WEATHER_BUBBLES" | "WEATHER_ORB_DRIFT" | string;
  enabled: boolean;
  params: Record<string, number | string | boolean>;
};

export type SceneLayer = {
  id: string;
  name: string;
  zIndex: number;
  zDepth: number;
  visible: boolean;
  locked: boolean;
  isBackgroundPlane?: boolean;
};

export type EntityTransform = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  pivotX?: number;
  pivotY?: number;
};

export type BlendMode = "normal" | "add" | "multiply" | "screen" | "overlay";

export type EntityStyle = {
  opacity: number;
  tintHex?: string;
  fillHex?: string;
  strokeHex?: string;
  strokeWidth?: number;
  blendMode?: BlendMode;
  paletteVariantId?: string;
  custom?: Record<string, number | string | boolean>;
};

export type MotionInstance = {
  id: string;
  motionId:
    | "MOTION_FLOAT"
    | "MOTION_WIGGLE"
    | "MOTION_DRIP"
    | "MOTION_PULSE"
    | "MOTION_ORBIT"
    | string;
  enabled: boolean;
  params: {
    speed?: number;
    intensity?: number;
    scaleAmount?: number;
    gravity?: number;
    radiusX?: number;
    radiusY?: number;
    phaseOffset?: number;
    [key: string]: number | string | boolean | undefined;
  };
};

export type SceneEntity = {
  id: string;
  name?: string;
  assetId: string;
  layerId: string;
  transform: EntityTransform;
  style: EntityStyle;
  motion: MotionInstance[];
  behaviorTags?: string[];
  metadata?: Record<string, unknown>;
};

export type ErrlScene = {
  version: string;
  id: string;
  name: string;
  description?: string;
  isTemplate?: boolean;
  author?: {
    id?: string;
    name?: string;
  };
  createdAt: string;
  updatedAt: string;

  viewport: SceneViewport;
  background: SceneBackgroundConfig;
  fx: SceneFxConfig;
  weather: SceneWeatherConfig[];
  presetIds?: string[];

  layers: SceneLayer[];
  entities: SceneEntity[];
};

export type ScenePresetRef = {
  presetId: string;
  appliedAt: string;
};

export const DEFAULT_VIEWPORT: SceneViewport = {
  width: 1920,
  height: 1080,
  aspectRatio: "16:9",
};

export const DEFAULT_STYLE: EntityStyle = {
  opacity: 1,
  blendMode: "normal",
};

export const createBaseScene = (partial?: Partial<ErrlScene>): ErrlScene => {
  const now = new Date().toISOString();
  return {
    version: "1.0.0",
    id: "scene_" + Math.random().toString(36).slice(2, 8),
    name: "Untitled Errl Scene",
    isTemplate: false,
    createdAt: now,
    updatedAt: now,
    viewport: DEFAULT_VIEWPORT,
    background: {
      sceneId: "LAB",
      moodId: "DEFAULT",
      planes: {
        bgAssetId: "ERRL_BG_LAB_BG",
        mgAssetId: "ERRL_BG_LAB_MG",
        fgAssetId: "ERRL_BG_LAB_FG",
      },
    },
    fx: { globalFx: [] },
    weather: [],
    layers: [
      {
        id: "layer_bg",
        name: "Background",
        zIndex: 0,
        zDepth: -1,
        visible: true,
        locked: true,
        isBackgroundPlane: true,
      },
      {
        id: "layer_main",
        name: "Main",
        zIndex: 1,
        zDepth: 0,
        visible: true,
        locked: false,
      },
      {
        id: "layer_fg",
        name: "Foreground",
        zIndex: 2,
        zDepth: 0.5,
        visible: true,
        locked: false,
      },
    ],
    entities: [],
    ...partial,
  };
};

export const exportScene = (scene: ErrlScene): string =>
  JSON.stringify(scene, null, 2);

export const importScene = (json: string): ErrlScene => {
  const parsed = JSON.parse(json);
  return parsed as ErrlScene;
};
