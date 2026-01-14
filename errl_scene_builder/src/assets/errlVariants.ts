import { AssetVariantGroup, AssetDefinition, AssetCategory } from "./registry";

/**
 * Generate asset ID for a variant
 */
function generateVariantAssetId(folderPath: string, variantIndex: number, variantFileName?: string): string {
  const folderName = folderPath.split("/").pop() || "";
  
  // Handle viscous body folder specially
  if (folderName.includes("viscous-body")) {
    if (variantFileName) {
      // Extract variant name from filename, e.g., "visc2-body-01-shear-left-tall" -> "VISC2_BODY_01"
      const match = variantFileName.match(/visc2-body-(\d+)-(.+)/);
      if (match) {
        const num = match[1];
        const name = match[2].split("-").slice(0, 2).join("_").toUpperCase();
        return `ERRL_VARIANT_VISC2_BODY_${num}_${name}`;
      }
    }
    return `ERRL_VARIANT_VISC2_BODY_${String(variantIndex + 1).padStart(2, "0")}`;
  }
  
  // Convert folder name to ID format
  // e.g., "errl-30-dynamic-individual-transparent" -> "ERRL_VARIANT_DYNAMIC_30"
  const parts = folderName
    .replace(/^errl-/, "")
    .replace(/-individual-transparent$/, "")
    .replace(/-individual-errl-only$/, "")
    .split("-");

  // Extract number if present (e.g., "30" from "30-dynamic")
  const numberMatch = parts[0].match(/^(\d+)/);
  const number = numberMatch ? numberMatch[1] : "";
  const nameParts = numberMatch ? parts.slice(1) : parts;

  // Build ID - convert to uppercase for consistency
  const namePart = nameParts
    .map((p) => p.toUpperCase())
    .join("_");
  const prefix = number ? `ERRL_VARIANT_${namePart}_${number}` : `ERRL_VARIANT_${namePart}`;
  const variantNum = String(variantIndex + 1).padStart(2, "0");
  return `${prefix}_${variantNum}`;
}

/**
 * Generate friendly label for a folder
 */
function generateFolderLabel(folderPath: string, hasFaces: boolean): string {
  const folderName = folderPath.split("/").pop() || "";
  
  // Handle special cases
  if (folderName.includes("viscous-body")) {
    return hasFaces ? "Viscous Bodies (with faces)" : "Viscous Bodies (body only - no face)";
  }
  
  if (folderName.includes("dynamic")) {
    const match = folderName.match(/(\d+)-dynamic/);
    const count = match ? match[1] : "";
    const label = hasFaces ? `Dynamic Poses ${count}` : `Dynamic Poses ${count} (body only)`;
    return label;
  }
  
  if (folderName.includes("grid-poses")) {
    return hasFaces ? "Grid Poses 50" : "Grid Poses 50 (body only)";
  }
  
  if (folderName.includes("grid-ref")) {
    return hasFaces ? "Grid Reference 50" : "Grid Reference 50 (body only)";
  }
  
  if (folderName.includes("random-dynamic")) {
    return hasFaces ? "Random Dynamic 50" : "Random Dynamic 50 (body only)";
  }
  
  // Fallback
  return folderName.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Create variant group and all individual asset definitions
 */
function createVariantGroup(
  folderPath: string,
  variantCount: number,
  hasFaces: boolean,
  variants: string[]
): { group: AssetVariantGroup; assets: AssetDefinition[] } {
  const folderName = folderPath.split("/").pop() || "";
  const groupId = `ERRL_VARIANT_GROUP_${folderName.toUpperCase().replace(/-/g, "_")}`;
  const label = generateFolderLabel(folderPath, hasFaces);
  
  // Generate all variant asset IDs
  const variantAssetIds: string[] = [];
  const assets: AssetDefinition[] = [];
  
  for (let i = 0; i < variantCount; i++) {
    const variantFileName = variants[i].split("/").pop();
    const assetId = generateVariantAssetId(folderPath, i, variantFileName);
    variantAssetIds.push(assetId);
    
    assets.push({
      id: assetId,
      category: "ERRL_CREW" as AssetCategory,
      label: `${label} - Variant ${i + 1}`,
      filePath: `/${variants[i]}`,
      tags: ["errl", "variant", hasFaces ? "with-face" : "body-only"],
    });
  }
  
  const group: AssetVariantGroup = {
    id: groupId,
    category: "ERRL_CREW",
    label,
    description: hasFaces 
      ? `${variantCount} variants with faces` 
      : `${variantCount} body-only variants (place face manually)`,
    folderPath,
    variantCount,
    hasFaces,
    variantAssetIds,
    tags: ["errl", "variant-group", hasFaces ? "with-face" : "body-only"],
  };
  
  return { group, assets };
}

// Scan results from the folder scan
const folderData = [
  {
    folderPath: "svgs/Errl_AndOrbs/errl-30-dynamic-individual-transparent",
    variantCount: 30,
    hasFaces: true,
    variants: Array.from({ length: 30 }, (_, i) => 
      `svgs/Errl_AndOrbs/errl-30-dynamic-individual-transparent/errl-${String(i + 1).padStart(2, "0")}.svg`
    ),
  },
  {
    folderPath: "svgs/Errl_AndOrbs/errl-50-grid-poses-individual-transparent",
    variantCount: 50,
    hasFaces: true,
    variants: Array.from({ length: 50 }, (_, i) => 
      `svgs/Errl_AndOrbs/errl-50-grid-poses-individual-transparent/errl-${String(i + 1).padStart(2, "0")}.svg`
    ),
  },
  {
    folderPath: "svgs/Errl_AndOrbs/errl-50-grid-ref-individual-transparent",
    variantCount: 50,
    hasFaces: true,
    variants: Array.from({ length: 50 }, (_, i) => 
      `svgs/Errl_AndOrbs/errl-50-grid-ref-individual-transparent/errl-${String(i + 1).padStart(2, "0")}.svg`
    ),
  },
  {
    folderPath: "svgs/Errl_AndOrbs/random-dynamic-individual-transparent",
    variantCount: 50,
    hasFaces: true,
    variants: Array.from({ length: 50 }, (_, i) => 
      `svgs/Errl_AndOrbs/random-dynamic-individual-transparent/errl-${String(i + 1).padStart(2, "0")}.svg`
    ),
  },
  {
    folderPath: "svgs/Errl_AndOrbs/errl-20-viscous-body-v2-individual-transparent",
    variantCount: 20,
    hasFaces: false, // Body only - no faces
    variants: [
      "svgs/Errl_AndOrbs/errl-20-viscous-body-v2-individual-transparent/visc2-body-01-shear-left-tall.svg",
      "svgs/Errl_AndOrbs/errl-20-viscous-body-v2-individual-transparent/visc2-body-02-shear-right-tall.svg",
      "svgs/Errl_AndOrbs/errl-20-viscous-body-v2-individual-transparent/visc2-body-03-squash-wide.svg",
      "svgs/Errl_AndOrbs/errl-20-viscous-body-v2-individual-transparent/visc2-body-04-lean-soft-left.svg",
      "svgs/Errl_AndOrbs/errl-20-viscous-body-v2-individual-transparent/visc2-body-05-lean-soft-right.svg",
      "svgs/Errl_AndOrbs/errl-20-viscous-body-v2-individual-transparent/visc2-body-06-dip-forward.svg",
      "svgs/Errl_AndOrbs/errl-20-viscous-body-v2-individual-transparent/visc2-body-07-dip-back.svg",
      "svgs/Errl_AndOrbs/errl-20-viscous-body-v2-individual-transparent/visc2-body-08-arc-soft-left.svg",
      "svgs/Errl_AndOrbs/errl-20-viscous-body-v2-individual-transparent/visc2-body-09-arc-soft-right.svg",
      "svgs/Errl_AndOrbs/errl-20-viscous-body-v2-individual-transparent/visc2-body-10-float-long.svg",
      "svgs/Errl_AndOrbs/errl-20-viscous-body-v2-individual-transparent/visc2-body-11-float-short.svg",
      "svgs/Errl_AndOrbs/errl-20-viscous-body-v2-individual-transparent/visc2-body-12-slide-soft-left.svg",
      "svgs/Errl_AndOrbs/errl-20-viscous-body-v2-individual-transparent/visc2-body-13-slide-soft-right.svg",
      "svgs/Errl_AndOrbs/errl-20-viscous-body-v2-individual-transparent/visc2-body-14-coil-soft-left.svg",
      "svgs/Errl_AndOrbs/errl-20-viscous-body-v2-individual-transparent/visc2-body-15-coil-soft-right.svg",
      "svgs/Errl_AndOrbs/errl-20-viscous-body-v2-individual-transparent/visc2-body-16-bow-low.svg",
      "svgs/Errl_AndOrbs/errl-20-viscous-body-v2-individual-transparent/visc2-body-17-bow-high.svg",
      "svgs/Errl_AndOrbs/errl-20-viscous-body-v2-individual-transparent/visc2-body-18-flare-wide.svg",
      "svgs/Errl_AndOrbs/errl-20-viscous-body-v2-individual-transparent/visc2-body-19-pinch-tall.svg",
      "svgs/Errl_AndOrbs/errl-20-viscous-body-v2-individual-transparent/visc2-body-20-crest-tuck.svg",
    ],
  },
  {
    folderPath: "svgs/ErrlOnly/errl-30-dynamic-individual-errl-only",
    variantCount: 30,
    hasFaces: true,
    variants: Array.from({ length: 30 }, (_, i) => 
      `svgs/ErrlOnly/errl-30-dynamic-individual-errl-only/errl-${String(i + 1).padStart(2, "0")}.svg`
    ),
  },
  {
    folderPath: "svgs/ErrlOnly/errl-50-grid-poses-individual-errl-only",
    variantCount: 50,
    hasFaces: true,
    variants: Array.from({ length: 50 }, (_, i) => 
      `svgs/ErrlOnly/errl-50-grid-poses-individual-errl-only/errl-${String(i + 1).padStart(2, "0")}.svg`
    ),
  },
  {
    folderPath: "svgs/ErrlOnly/errl-50-grid-ref-individual-errl-only",
    variantCount: 50,
    hasFaces: true,
    variants: Array.from({ length: 50 }, (_, i) => 
      `svgs/ErrlOnly/errl-50-grid-ref-individual-errl-only/errl-${String(i + 1).padStart(2, "0")}.svg`
    ),
  },
  {
    folderPath: "svgs/ErrlOnly/errl-50-random-dynamic-individual-errl-only",
    variantCount: 50,
    hasFaces: true,
    variants: Array.from({ length: 50 }, (_, i) => 
      `svgs/ErrlOnly/errl-50-random-dynamic-individual-errl-only/errl-${String(i + 1).padStart(2, "0")}.svg`
    ),
  },
];

// Generate all variant groups and their assets
const variantGroups: AssetVariantGroup[] = [];
const variantAssets: AssetDefinition[] = [];

for (const data of folderData) {
  const { group, assets } = createVariantGroup(
    data.folderPath,
    data.variantCount,
    data.hasFaces,
    data.variants
  );
  variantGroups.push(group);
  variantAssets.push(...assets);
}

export { variantGroups, variantAssets };

// Helper to get variant group by ID
export const getVariantGroupById = (id: string): AssetVariantGroup | undefined =>
  variantGroups.find((g) => g.id === id);

// Helper to get variant group for an asset ID
export const getVariantGroupForAsset = (assetId: string): AssetVariantGroup | undefined =>
  variantGroups.find((g) => g.variantAssetIds.includes(assetId));

// Helper to get variant index for an asset ID
export const getVariantIndex = (assetId: string): number | undefined => {
  const group = getVariantGroupForAsset(assetId);
  if (!group) return undefined;
  return group.variantAssetIds.indexOf(assetId);
};

// Helper to get next/previous variant asset ID
export const getNextVariant = (assetId: string): string | undefined => {
  const group = getVariantGroupForAsset(assetId);
  if (!group) return undefined;
  const index = group.variantAssetIds.indexOf(assetId);
  if (index === -1 || index === group.variantAssetIds.length - 1) return undefined;
  return group.variantAssetIds[index + 1];
};

export const getPreviousVariant = (assetId: string): string | undefined => {
  const group = getVariantGroupForAsset(assetId);
  if (!group) return undefined;
  const index = group.variantAssetIds.indexOf(assetId);
  if (index === -1 || index === 0) return undefined;
  return group.variantAssetIds[index - 1];
};

