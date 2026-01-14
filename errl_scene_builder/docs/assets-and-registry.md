# Assets and Registry

This document summarizes how visual assets (SVGs) are referenced and used by the Errl Scene Builder.

## Asset IDs

Every visual asset used in a scene has a stable `assetId`, for example:

- `ERRL_CHAR_HEAD_OG`
- `ERRL_DRIP_TOP_MEDIUM_A`
- `ERRL_PROP_TV_GRANDMA_V1`

These IDs are the glue between:
- The asset registry (metadata + file paths)
- The editor UI (asset browser, categories)
- The scene model (`SceneEntity.assetId`)

## Registry

The registry is a static map of `AssetDefinition`:

```ts
export type AssetDefinition = {
  id: string;
  category: "CHARACTER" | "DRIP" | "PROP" | "ENV" | "FX" | "MYSTERY" | "UI" | "DEPTH";
  label: string;
  description?: string;
  filePath: string; // e.g., "/svgs/ERRL_CHAR_HEAD_OG.svg"
  defaultStyle?: Partial<EntityStyle>;
  defaultMotion?: MotionInstance[];
};
```

The registry is the single source of truth for:
- Which assets exist
- How they are grouped in the UI
- Default styling and motion when spawning new entities

## Thumbnails

For variant assets (Errl variants in `Errl_AndOrbs/` and `ErrlOnly/` folders), the AssetPanel automatically uses pre-generated PNG thumbnails for faster loading:

- **Thumbnail location**: `svgs/thumbnails/` (mirrors the source folder structure)
- **Thumbnail format**: 256x256px PNG with transparent background
- **Automatic conversion**: The `getThumbnailPath()` utility converts SVG paths to thumbnail paths
- **Fallback**: If a thumbnail fails to load, the system automatically falls back to the SVG

Thumbnails are generated using `npm run generate:thumbnails` (see `docs/thumbnail-generation-guide.md` for details).

## Scene Entities

`SceneEntity.assetId` must match a registry entry. The renderer:
1. Looks up the `AssetDefinition` by `assetId`.
2. Loads the underlying SVG/texture.
3. Applies the entity’s transform, style, and motion at render time.

If an `assetId` is missing from the registry, the renderer can skip rendering and/or log a warning.

## Adding New Assets

1. Place the SVG in the appropriate `/svgs/` or assets folder.
2. Add a new `AssetDefinition` entry to the registry:
   - `id` should follow the ERRL_* naming rules.
   - Set `category`, `label`, and `filePath`.
   - Optionally set `defaultStyle` and `defaultMotion`.
3. The new asset will automatically appear in:
   - The AssetPanel (grouped by category).
   - Any selectors reading from the registry.

**For Variant Assets**: If adding new Errl variant folders, generate thumbnails by running `npm run generate:thumbnails`. The AssetPanel will automatically use thumbnails for assets in `Errl_AndOrbs/` and `ErrlOnly/` folders.
