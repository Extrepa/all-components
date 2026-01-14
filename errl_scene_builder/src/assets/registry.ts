import { EntityStyle, MotionInstance } from "../scene/types";
import { libraryAssets } from "./library.generated";
import { variantAssets } from "./errlVariants";

export type AssetCategory =
  | "ERRL_CREW"
  | "WEARABLES"
  | "PROPS"
  | "STRUCTURES"
  | "FLORA"
  | "DECOR"
  | "LIGHTING"
  | "FX"
  | "GOO"
  | "UI"
  | "BACKGROUNDS"
  | "TREATS_MISC";

export type AssetDefinition = {
  id: string;
  category: AssetCategory;
  label: string;
  description?: string;
  filePath: string;
  defaultStyle?: Partial<EntityStyle>;
  defaultMotion?: MotionInstance[];
  tags?: string[];
};

export type AssetVariantGroup = {
  id: string;
  category: AssetCategory;
  label: string;
  description?: string;
  folderPath: string;
  variantCount: number;
  hasFaces: boolean;
  variantAssetIds: string[]; // Array of asset IDs for each variant
  tags?: string[];
};

const coreAssets: AssetDefinition[] = [
  // Characters
  { id: "ERRL_CHAR_HEAD_OG", category: "ERRL_CREW", label: "Errl Head OG", filePath: "/svgs/library/ERRL_CHAR_HEAD_OG.svg", tags: ["errl", "character"] },
  { id: "ERRL_CHAR_HEAD_HAPPY", category: "ERRL_CREW", label: "Errl Head Happy", filePath: "/svgs/library/ERRL_CHAR_HEAD_HAPPY.svg", tags: ["errl", "character"] },
  { id: "ERRL_CHAR_HEAD_MELTY", category: "ERRL_CREW", label: "Errl Head Melty", filePath: "/svgs/library/ERRL_CHAR_HEAD_MELTY.svg", tags: ["errl", "character"] },
  { id: "ERRL_CHAR_HEAD_TINY", category: "ERRL_CREW", label: "Errl Head Tiny", filePath: "/svgs/library/ERRL_CHAR_HEAD_TINY.svg", tags: ["errl", "character"] },
  { id: "ERRL_CHAR_FULL_STANDING", category: "ERRL_CREW", label: "Errl Full Standing", filePath: "/svgs/library/ERRL_CHAR_FULL_STANDING.svg", tags: ["errl", "character"] },
  { id: "ERRL_CHAR_FULL_LEANING_PROJECTOR", category: "ERRL_CREW", label: "Errl Leaning", filePath: "/svgs/library/ERRL_CHAR_FULL_LEANING_PROJECTOR.svg", tags: ["errl", "character"] },
  { id: "ERRL_CHAR_FULL_FLOATING", category: "ERRL_CREW", label: "Errl Floating", filePath: "/svgs/library/ERRL_CHAR_FULL_FLOATING.svg", tags: ["errl", "character"] },

  // Drips / Goo
  { id: "ERRL_DRIP_TOP_SMALL_A", category: "GOO", label: "Drip Top Small", filePath: "/svgs/library/ERRL_DRIP_TOP_SMALL_A.svg", tags: ["goo", "blob"] },
  { id: "ERRL_DRIP_TOP_MEDIUM_A", category: "GOO", label: "Drip Top Medium", filePath: "/svgs/library/ERRL_DRIP_TOP_MEDIUM_A.svg", tags: ["goo", "blob"] },
  { id: "ERRL_DRIP_TOP_WIDE_A", category: "GOO", label: "Drip Top Wide", filePath: "/svgs/library/ERRL_DRIP_TOP_WIDE_A.svg", tags: ["goo", "blob"] },
  { id: "ERRL_DRIP_SIDE_LEFT_A", category: "GOO", label: "Drip Side Left", filePath: "/svgs/library/ERRL_DRIP_SIDE_LEFT_A.svg", tags: ["goo", "blob"] },
  { id: "ERRL_DRIP_SIDE_RIGHT_A", category: "GOO", label: "Drip Side Right", filePath: "/svgs/library/ERRL_DRIP_SIDE_RIGHT_A.svg", tags: ["goo", "blob"] },
  { id: "ERRL_DRIP_SIDE_CHAIN", category: "GOO", label: "Drip Chain", filePath: "/svgs/library/ERRL_DRIP_SIDE_CHAIN.svg", tags: ["goo", "blob"] },
  { id: "ERRL_PUDDLE_SMALL", category: "GOO", label: "Puddle Small", filePath: "/svgs/library/ERRL_PUDDLE_SMALL.svg", tags: ["goo", "fluid"] },
  { id: "ERRL_PUDDLE_LARGE", category: "GOO", label: "Puddle Large", filePath: "/svgs/library/ERRL_PUDDLE_LARGE.svg", tags: ["goo", "fluid"] },
  { id: "ERRL_SPLAT_BIG_A", category: "GOO", label: "Splat Big", filePath: "/svgs/library/ERRL_SPLAT_BIG_A.svg", tags: ["goo", "blob"] },
  { id: "ERRL_SPLAT_DIRECTIONAL_LEFT", category: "GOO", label: "Splat Left", filePath: "/svgs/library/ERRL_SPLAT_DIRECTIONAL_LEFT.svg", tags: ["goo", "blob"] },
  { id: "ERRL_SPLAT_DIRECTIONAL_RIGHT", category: "GOO", label: "Splat Right", filePath: "/svgs/library/ERRL_SPLAT_DIRECTIONAL_RIGHT.svg", tags: ["goo", "blob"] },

  // Props / Tech
  { id: "ERRL_PROP_OVERHEAD_PROJECTOR_V1", category: "LIGHTING", label: "Overhead Projector V1", filePath: "/svgs/library/ERRL_PROP_OVERHEAD_PROJECTOR_V1.svg", tags: ["technology", "light"] },
  { id: "ERRL_PROP_OVERHEAD_PROJECTOR_TOPDOWN", category: "LIGHTING", label: "Overhead Projector Topdown", filePath: "/svgs/library/ERRL_PROP_OVERHEAD_PROJECTOR_TOPDOWN.svg", tags: ["technology", "light"] },
  { id: "ERRL_PROP_TV_GRANDMA_V1", category: "LIGHTING", label: "TV Grandma V1", filePath: "/svgs/library/ERRL_PROP_TV_GRANDMA_V1.svg", tags: ["technology", "screen"] },
  { id: "ERRL_PROP_TV_GRANDMA_V2_ROUNDED", category: "LIGHTING", label: "TV Grandma Rounded", filePath: "/svgs/library/ERRL_PROP_TV_GRANDMA_V2_ROUNDED.svg", tags: ["technology", "screen"] },
  { id: "ERRL_PROP_RACK_SIMPLE", category: "PROPS", label: "Rack Simple", filePath: "/svgs/library/ERRL_PROP_RACK_SIMPLE.svg", tags: ["object", "technology"] },
  { id: "ERRL_PROP_MIXER_CONSOLE_V1", category: "PROPS", label: "Mixer Console", filePath: "/svgs/library/ERRL_PROP_MIXER_CONSOLE_V1.svg", tags: ["technology", "music"] },

  // Environment
  { id: "ERRL_ENV_STAGE_RISER", category: "STRUCTURES", label: "Stage Riser", filePath: "/svgs/library/ERRL_ENV_STAGE_RISER.svg", tags: ["structure", "festival"] },
  { id: "ERRL_ENV_TRUSS_SIMPLE", category: "STRUCTURES", label: "Truss Simple", filePath: "/svgs/library/ERRL_ENV_TRUSS_SIMPLE.svg", tags: ["structure", "festival"] },
  { id: "ERRL_ENV_TENT_EDGE", category: "DECOR", label: "Tent Edge", filePath: "/svgs/library/ERRL_ENV_TENT_EDGE.svg", tags: ["decor", "festival"] },
  { id: "ERRL_ENV_FLAG_SMALL", category: "DECOR", label: "Flag Small", filePath: "/svgs/library/ERRL_ENV_FLAG_SMALL.svg", tags: ["flag", "decor"] },
  { id: "ERRL_ENV_COZY_RUG_ROUND", category: "DECOR", label: "Cozy Rug Round", filePath: "/svgs/library/ERRL_ENV_COZY_RUG_ROUND.svg", tags: ["decor"] },
  { id: "ERRL_ENV_SIDE_TABLE", category: "PROPS", label: "Side Table", filePath: "/svgs/library/ERRL_ENV_SIDE_TABLE.svg", tags: ["furniture", "object"] },
  { id: "ERRL_ENV_LAMP_SHADE", category: "LIGHTING", label: "Lamp Shade", filePath: "/svgs/library/ERRL_ENV_LAMP_SHADE.svg", tags: ["light", "decor"] },
  { id: "ERRL_ENV_PICTURE_FRAME_EMPTY", category: "DECOR", label: "Picture Frame", filePath: "/svgs/library/ERRL_ENV_PICTURE_FRAME_EMPTY.svg", tags: ["decor"] },
  { id: "ERRL_ENV_PLANT_POTTED_A", category: "FLORA", label: "Plant Potted", filePath: "/svgs/library/ERRL_ENV_PLANT_POTTED_A.svg", tags: ["plant", "nature"] },
  { id: "ERRL_ENV_PLANT_VINE_TOP", category: "FLORA", label: "Plant Vine Top", filePath: "/svgs/library/ERRL_ENV_PLANT_VINE_TOP.svg", tags: ["plant", "nature"] },
  { id: "ERRL_ENV_CLOUD_POOF_A", category: "FX", label: "Cloud Poof", filePath: "/svgs/library/ERRL_ENV_CLOUD_POOF_A.svg", tags: ["weather", "fx"] },
  { id: "ERRL_ENV_STAR_SIMPLE", category: "FX", label: "Star Simple", filePath: "/svgs/library/ERRL_ENV_STAR_SIMPLE.svg", tags: ["fx", "shape"] },

  // FX / Depth
  { id: "ERRL_FX_ORB_SMALL_A", category: "FX", label: "Orb Small", filePath: "/svgs/library/ERRL_FX_ORB_SMALL_A.svg", tags: ["orb", "fx"] },
  { id: "ERRL_FX_ORB_MEDIUM_A", category: "FX", label: "Orb Medium", filePath: "/svgs/library/ERRL_FX_ORB_MEDIUM_A.svg", tags: ["orb", "fx"] },
  { id: "ERRL_FX_ORB_RING", category: "FX", label: "Orb Ring", filePath: "/svgs/library/ERRL_FX_ORB_RING.svg", tags: ["orb", "fx"] },
  { id: "ERRL_FX_SPARKLE_FOURPOINT", category: "FX", label: "Sparkle Four Point", filePath: "/svgs/library/ERRL_FX_SPARKLE_FOURPOINT.svg", tags: ["fx", "light"] },
  { id: "ERRL_FX_SPARKLE_EIGHTPOINT", category: "FX", label: "Sparkle Eight Point", filePath: "/svgs/library/ERRL_FX_SPARKLE_EIGHTPOINT.svg", tags: ["fx", "light"] },
  { id: "ERRL_FX_PARTICLE_CLUSTER_A", category: "FX", label: "Particle Cluster", filePath: "/svgs/library/ERRL_FX_PARTICLE_CLUSTER_A.svg", tags: ["fx", "weather"] },
  { id: "ERRL_FX_GRAIN_SOFT", category: "FX", label: "Grain Soft", filePath: "/svgs/library/ERRL_FX_GRAIN_SOFT.svg", tags: ["fx"] },
  { id: "ERRL_FX_GRAIN_STRONG", category: "FX", label: "Grain Strong", filePath: "/svgs/library/ERRL_FX_GRAIN_STRONG.svg", tags: ["fx"] },
  { id: "ERRL_FX_EDGE_VIGNETTE", category: "FX", label: "Edge Vignette", filePath: "/svgs/library/ERRL_FX_EDGE_VIGNETTE.svg", tags: ["fx", "vignette"] },
  { id: "ERRL_DEPTH_FG_PLANTS_A", category: "BACKGROUNDS", label: "Depth FG Plants", filePath: "/svgs/library/ERRL_DEPTH_FG_PLANTS_A.svg", tags: ["background", "plant"] },
  { id: "ERRL_DEPTH_FG_DRIPS_FRAME", category: "BACKGROUNDS", label: "Depth FG Drips Frame", filePath: "/svgs/library/ERRL_DEPTH_FG_DRIPS_FRAME.svg", tags: ["background", "goo"] },
  { id: "ERRL_DEPTH_MG_ORBS_FIELD", category: "BACKGROUNDS", label: "Depth MG Orbs Field", filePath: "/svgs/library/ERRL_DEPTH_MG_ORBS_FIELD.svg", tags: ["background", "orb"] },
  { id: "ERRL_DEPTH_BG_STARS_FIELD", category: "BACKGROUNDS", label: "Depth BG Stars Field", filePath: "/svgs/library/ERRL_DEPTH_BG_STARS_FIELD.svg", tags: ["background", "stars"] },

  // Mystery / tiny
  { id: "ERRL_CHAR_HEAD_TINY_SINGLE_A", category: "ERRL_CREW", label: "Tiny Errl Single", filePath: "/svgs/library/ERRL_CHAR_HEAD_TINY_SINGLE_A.svg", tags: ["errl", "character"] },
  { id: "ERRL_CHAR_HEAD_TINY_SCATTER_A", category: "ERRL_CREW", label: "Tiny Errl Scatter", filePath: "/svgs/library/ERRL_CHAR_HEAD_TINY_SCATTER_A.svg", tags: ["errl", "character"] },
  { id: "ERRL_FX_MYSTERY_GLYPH_A", category: "FX", label: "Mystery Glyph", filePath: "/svgs/library/ERRL_FX_MYSTERY_GLYPH_A.svg", tags: ["symbol", "fx"] },
  { id: "ERRL_FX_MYSTERY_PORTAL_A", category: "FX", label: "Mystery Portal", filePath: "/svgs/library/ERRL_FX_MYSTERY_PORTAL_A.svg", tags: ["fx", "portal"] },

  // UI icons
  { id: "ERRL_UI_ICON_DRAG_HANDLE", category: "UI", label: "UI Drag Handle", filePath: "/svgs/library/ERRL_UI_ICON_DRAG_HANDLE.svg", tags: ["icon", "ui"] },
  { id: "ERRL_UI_ICON_LAYER_VISIBLE", category: "UI", label: "UI Layer Visible", filePath: "/svgs/library/ERRL_UI_ICON_LAYER_VISIBLE.svg", tags: ["icon", "ui"] },
  { id: "ERRL_UI_ICON_LAYER_HIDDEN", category: "UI", label: "UI Layer Hidden", filePath: "/svgs/library/ERRL_UI_ICON_LAYER_HIDDEN.svg", tags: ["icon", "ui"] },
  { id: "ERRL_UI_ICON_LOCK", category: "UI", label: "UI Lock", filePath: "/svgs/library/ERRL_UI_ICON_LOCK.svg", tags: ["icon", "symbol"] },
  { id: "ERRL_UI_ICON_UNLOCK", category: "UI", label: "UI Unlock", filePath: "/svgs/library/ERRL_UI_ICON_UNLOCK.svg", tags: ["icon", "symbol"] },
  { id: "ERRL_UI_ICON_RANDOMIZE", category: "UI", label: "UI Randomize", filePath: "/svgs/library/ERRL_UI_ICON_RANDOMIZE.svg", tags: ["icon", "ui"] },
  { id: "ERRL_UI_ICON_PLAY", category: "UI", label: "UI Play", filePath: "/svgs/library/ERRL_UI_ICON_PLAY.svg", tags: ["icon", "ui"] },
  { id: "ERRL_UI_ICON_PAUSE", category: "UI", label: "UI Pause", filePath: "/svgs/library/ERRL_UI_ICON_PAUSE.svg", tags: ["icon", "ui"] },
  { id: "ERRL_UI_ICON_RESET", category: "UI", label: "UI Reset", filePath: "/svgs/library/ERRL_UI_ICON_RESET.svg", tags: ["icon", "ui"] },
];

const registryMap = new Map<string, AssetDefinition>();
for (const asset of coreAssets) {
  registryMap.set(asset.id, asset);
}

for (const asset of libraryAssets as AssetDefinition[]) {
  if (!registryMap.has(asset.id)) {
    registryMap.set(asset.id, asset);
  }
}

// Add variant assets
for (const asset of variantAssets) {
  if (!registryMap.has(asset.id)) {
    registryMap.set(asset.id, asset);
  } else {
    console.warn(`Duplicate asset ID found: ${asset.id}`);
  }
}

// Helper function to create asset definitions from pose manifest entries
export function createPoseAssetsFromManifest(
  manifest: Array<{
    id: string;
    file: string;
    pack: string;
    category: string;
    pose_set: string;
  }>,
  basePath: string
): AssetDefinition[] {
  return manifest.map((entry) => ({
    id: entry.id,
    category: "ERRL_CREW" as AssetCategory,
    label: entry.id.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    filePath: `${basePath}/${entry.file}`,
    tags: ["errl", "character", "pose", entry.pose_set],
  }));
}

// Load pose packs from manifest files
// Pose packs are generated by tools/generate_errl_poses.py
// Each pose pack directory contains a manifest.json file
// 
// Note: To load pose packs, you can either:
// 1. Manually import manifest.json files and call createPoseAssetsFromManifest
// 2. Create a generated file similar to library.generated.ts
// 3. Use a build-time script to generate pose assets
//
// For now, this is a placeholder that will be populated once poses are generated
const posePackAssets: AssetDefinition[] = [];

// Example: Once poses are generated, you can load them like this:
// import wavingManifest from "../../svgs/library/poses-waving/manifest.json";
// posePackAssets.push(...createPoseAssetsFromManifest(
//   wavingManifest,
//   "/svgs/library/poses-waving"
// ));

// Add pose pack assets
for (const asset of posePackAssets) {
  if (!registryMap.has(asset.id)) {
    registryMap.set(asset.id, asset);
  } else {
    console.warn(`Duplicate asset ID found: ${asset.id}`);
  }
}

// Debug: Log variant asset registration
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  console.log(`Registered ${variantAssets.length} variant assets`);
  const sampleVariant = variantAssets[0];
  if (sampleVariant) {
    console.log('Sample variant asset:', {
      id: sampleVariant.id,
      filePath: sampleVariant.filePath,
      category: sampleVariant.category
    });
  }
  if (posePackAssets.length > 0) {
    console.log(`Registered ${posePackAssets.length} pose pack assets`);
  }
}

export const assetRegistry: AssetDefinition[] = Array.from(registryMap.values());

export const getAssetById = (id: string): AssetDefinition | undefined =>
  assetRegistry.find((a) => a.id === id);
