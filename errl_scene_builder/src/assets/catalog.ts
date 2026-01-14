import assetCatalog from "../../svgs/asset_catalog.json";
import festIconCatalog from "../../svgs/asset_catalog_fest_icons.json";
import minimapCatalog from "../../svgs/asset_catalog_minimap.json";

export type CatalogEntry = {
  file: string;
  logicalName: string | null;
  path: string;
};

export type AssetCatalog = {
  [category: string]: CatalogEntry[];
};

export type FestIconEntry = CatalogEntry & {
  tags: string[];
};

export type FestIconCatalog = {
  [group: string]: FestIconEntry[];
};

export type MinimapEntry = CatalogEntry & {
  kind: "gate" | "tent" | "stage" | "service" | "other";
  tags: string[];
};

export type MinimapCatalog = {
  minimap: MinimapEntry[];
};

export const catalog = assetCatalog as AssetCatalog;
export const festIcons = festIconCatalog as FestIconCatalog;
export const minimap = minimapCatalog as MinimapCatalog;

export const getCategoryEntries = (category: string): CatalogEntry[] => {
  return catalog[category] ?? [];
};

export const getFestMinimapIcons = (): MinimapEntry[] => minimap.minimap;

export const getFestIconsByTag = (tag: string): FestIconEntry[] => {
  const group = festIcons[tag];
  if (group && Array.isArray(group)) return group;
  // Fallback: search all groups for tag membership
  const results: FestIconEntry[] = [];
  for (const entries of Object.values(festIcons) as FestIconEntry[][]) {
    for (const e of entries) {
      if (e.tags?.includes(tag)) results.push(e);
    }
  }
  return results;
};
