# Asset Catalog

**Last Updated**: December 10, 2025  
**Status**: Active Catalog

This document provides a complete inventory of all assets in the Errl Club Simulator project.

## Overview

The asset catalog tracks all assets with metadata including:
- Asset type and format
- Size and location
- License information
- Source and attribution
- Usage locations in code
- Dependencies and relationships

## Asset Statistics

- **Total Assets**: See AssetRegistry for current count
- **By Type**: See AssetRegistry statistics
- **Total Size**: See AssetRegistry statistics

## Asset Categories

### 3D Models

#### Codex Assets
- **The Shroom Bar Nightclub** (`/models/nightclub/the_shroom_bar__nightclub.glb`)
  - Type: 3D Model (GLB)
  - Category: Environment
  - License: Check repo documentation
  - Source: Repository asset
  - Usage: `src/scene/CodexAssetIntegration.js::loadShroomBar()`
  - Features: Interactive floor panels, proximity visibility, LOD integration

- **Futuristic Geodesic Space Station** (`/models/rooms/futuristic_geodesic_space_station.glb`)
  - Type: 3D Model (GLB)
  - Category: Environment
  - License: Check repo documentation
  - Source: Repository asset
  - Usage: `src/scene/CodexAssetIntegration.js::loadGeodesicStation()`
  - Features: Audio-reactive (mid frequencies), holographic effects

- **Khronos BoomBox** (`/models/external/khronos_boombox.glb`)
  - Type: 3D Model (GLB)
  - Category: Props
  - License: CC BY 4.0 - Khronos Group
  - Source: Khronos Group
  - Usage: `src/scene/CodexAssetIntegration.js::loadBoomBox()`
  - Features: Audio-reactive (bass frequencies), spark trails

- **Khronos DamagedHelmet** (`/models/external/khronos_damaged_helmet.glb`)
  - Type: 3D Model (GLB)
  - Category: Props
  - License: CC BY 4.0 - Khronos Group
  - Source: Khronos Group
  - Usage: `src/scene/CodexAssetIntegration.js::loadDamagedHelmet()`
  - Features: Interactive, holographic centerpiece, audio-reactive (treble)

### Textures

*No textures currently cataloged. Add textures as they are integrated.*

### Audio

*No audio files currently cataloged. Add audio files as they are integrated.*

### Animations

*No animations currently cataloged. Add animations as they are integrated.*

### Shaders

*No shaders currently cataloged. Add shaders as they are integrated.*

### UI Assets

#### Avatar Assets
- **25 Color Variants** (`/src/assets/avatars/colors/`)
  - Type: UI Asset (SVG)
  - Category: Avatar
  - License: Project assets
  - Source: Project assets
  - Usage: `src/config/AvatarColorVariants.js`
  - Files: `errl_01_classic_purple.svg` through `errl_25_cobalt_blue.svg`

- **200+ Pose References** (`/src/assets/avatars/`)
  - Type: UI Asset (SVG)
  - Category: Avatar
  - License: Project assets
  - Source: Project assets
  - Usage: Design reference
  - Collections: dynamic/, grid-poses/, grid-ref/, random-dynamic/, viscous/, viscous-v2/

## Adding Assets

To add a new asset to the catalog:

1. Place asset in appropriate directory
2. Register asset using `AssetRegistry.register()`
3. Update this catalog document
4. Add integration code
5. Test and verify

See integration guides in `docs/assets/INTEGRATION_GUIDES/` for detailed instructions.

## License Compliance

All assets must have proper license information. Assets requiring attribution are tracked in the catalog and attribution reports can be generated using `AssetCatalog.generateAttributionReport()`.

## Dependencies

Asset dependencies are tracked in the catalog. When loading an asset, ensure all dependencies are available first.

## Usage Tracking

Asset usage locations in code are tracked automatically when using `AssetCatalog.trackUsage()`. This helps identify which assets are used where and prevents accidental removal of in-use assets.

## Search and Filtering

Use `AssetCatalog.search()` to find assets by:
- Name/ID
- Type
- Category
- License
- Source
- Tags

## Attribution Reports

Generate attribution reports using:
- `AssetCatalog.generateAttributionReport()` - JSON format
- `AssetCatalog.generateAttributionMarkdown()` - Markdown format

Reports can be filtered by license, source, or other criteria.

