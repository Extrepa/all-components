# Model Integration Guide

This guide explains how to add 3D models to the Errl Club Simulator.

## Supported Formats

### ✅ GLTF/GLB (Recommended)
- **Best choice** for Three.js projects
- Single file contains geometry, materials, textures, and animations
- Efficient file sizes
- Excellent browser support
- **Already supported** in `AssetLoader`

### ⚠️ OBJ (Optional - needs loader)
- Simple format, widely available
- Requires separate `.mtl` file for materials
- No animation support
- Would need `OBJLoader` from Three.js examples

### ⚠️ FBX (Optional - needs loader)
- Common format from Blender/Maya
- Larger file sizes
- Supports animations
- Would need `FBXLoader` from Three.js examples

## Current Implementation

The `AssetLoader` class (`src/assets/AssetLoader.js`) currently supports:
- ✅ **GLTF/GLB** via `GLTFLoader`
- ✅ **Textures** (PNG, JPG, etc.)
- ✅ **Audio** (MP3, OGG, WAV)

## Adding Models

### Step 1: Place Model Files
Create a directory for your models:
```
src/assets/models/
  ├── props/
  ├── furniture/
└── decorations/
```

### Step 2: Load Models
Use the `AssetLoader` to load models:

```javascript
import { AssetLoader } from '../assets/AssetLoader.js';

const assetLoader = new AssetLoader();

// Load a GLTF model
const model = await assetLoader.loadModel('/src/assets/models/props/chair.gltf');

// Add to scene
scene.add(model);
```

### Step 3: Position and Scale
Adjust model position, rotation, and scale:

```javascript
model.position.set(0, 0, 0);
model.rotation.set(0, Math.PI / 2, 0);
model.scale.set(1, 1, 1);
```

## Model Requirements

### File Size
- Keep models under **5MB** for web performance
- Use compression tools if needed
- Consider LOD (Level of Detail) for complex models

### Optimization Tips
1. **Reduce polygon count** - Use decimation in Blender
2. **Optimize textures** - Compress images, use appropriate resolution
3. **Use GLB** - Binary format is smaller than GLTF
4. **Remove unused data** - Clean up materials, animations you don't need

### Texture Requirements
- **Format**: PNG (with transparency) or JPG
- **Resolution**: 512x512 to 2048x2048 (depending on model size)
- **Power of 2**: Recommended (512, 1024, 2048)
- **Embedded**: GLTF/GLB can embed textures, or use external files

## Adding Support for Other Formats

If you need OBJ or FBX support, we can add loaders:

### OBJ Support
```javascript
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
```

### FBX Support
```javascript
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
```

**Note**: These loaders are already included in Three.js, just need to import and use them.

## Example: Adding a Free Model

1. **Download model** (GLTF/GLB format preferred)
2. **Place in** `src/assets/models/`
3. **Load in code**:
   ```javascript
   const assetLoader = systems.assetLoader;
   const model = await assetLoader.loadModel('/src/assets/models/my-model.glb');
   scene.add(model);
   ```

## Where to Find Free Models

- **Sketchfab** - Many free GLTF models
- **Poly Haven** - Free 3D assets
- **TurboSquid** - Free and paid models
- **Free3D** - Free model library
- **BlenderKit** - Free models (Blender format, export as GLTF)

## Troubleshooting

### Model doesn't appear
- Check file path is correct
- Verify model is in correct format (GLTF/GLB)
- Check browser console for errors
- Ensure model is added to scene

### Model is too large/small
- Adjust `model.scale.set(x, y, z)`
- Check model's original scale in modeling software

### Textures missing
- Ensure texture paths are relative to model file
- Check texture files are in correct location
- Verify texture format is supported (PNG, JPG)

### Performance issues
- Reduce polygon count
- Compress textures
- Use simpler materials
- Consider LOD system

## External Assets Library

### Downloaded Assets (December 2025)

The following external assets have been downloaded and are available in `public/models/external/`:

#### Khronos glTF Sample Models (CC BY 4.0)

1. **BoomBox** (`khronos_boombox.glb`)
   - **Size**: ~10.4 MB
   - **Usage**: Stage prop, audio-reactive speaker visualization
   - **Integration**: Load via `AssetLoader.loadModel('/models/external/khronos_boombox.glb')`
   - **Attribution Required**: "BoomBox model by Khronos Group, licensed under CC BY 4.0"

2. **DamagedHelmet** (`khronos_damaged_helmet.glb`)
   - **Size**: ~3.6 MB
   - **Usage**: Holographic centerpiece, portal decoration (tint with neon materials)
   - **Integration**: Load via `AssetLoader.loadModel('/models/external/khronos_damaged_helmet.glb')`
   - **Attribution Required**: "DamagedHelmet model by Khronos Group, licensed under CC BY 4.0"

3. **Avocado** (`khronos_avocado.glb`)
   - **Size**: ~7.9 MB
   - **Usage**: Material testing, emissive gradient examples, lighting tests
   - **Integration**: Load via `AssetLoader.loadModel('/models/external/khronos_avocado.glb')`
   - **Attribution Required**: "Avocado model by Khronos Group, licensed under CC BY 4.0"

#### Recommended Manual Downloads

The following assets are recommended but require manual download:

- **Poly Haven "Goat Farm" Interior** (CC0)
  - Source: https://polyhaven.com/a/goat_farm
  - Usage: Environment replacement, warm materials for neon overlay
  - Note: Download GLB format from Poly Haven website

- **Sketchfab "Neon Arcade Room"** (License varies)
  - Source: https://sketchfab.com/3d-models/neon-arcade-room-31d2e8f8b5724c7f8657e7d9b6b3c54b
  - Usage: Neon arcade aesthetic, side room or backdrop
  - Note: Requires Sketchfab account for download

See `public/models/external/README.md` for complete asset documentation, licensing details, and integration examples.

## Codex Asset Integration System

The `CodexAssetIntegration` class (`src/scene/CodexAssetIntegration.js`) provides automated loading and integration of Codex-recommended assets with:

### Features

- **Automatic Scaling**: Models are automatically scaled to fit desired dimensions
- **Material Enhancement**: Converts MeshBasicMaterial to MeshStandardMaterial, enables emissive channels, applies neon tints
- **Audio-Reactive**: Assets can be wired to frequency bands (bass, mid, treble) for dynamic visual effects
- **Interaction System**: Assets can be registered with the InteractionSystem for click/hover interactions
- **Asset Tagging**: All assets are tagged with source and license information for traceability

### Usage

```javascript
import { CodexAssetIntegration } from './scene/CodexAssetIntegration.js';

// Initialize with scene and systems
const codexIntegration = new CodexAssetIntegration(scene, {
    eventSystem: eventSystem,
    interactionSystem: interactionSystem,
    audioSystem: frequencyExtractor
});

// Load all available assets
const assets = await codexIntegration.loadAllAssets();

// Assets are automatically:
// - Scaled to appropriate size
// - Enhanced with neon materials
// - Tagged with metadata
// - Added to the scene
```

### Currently Integrated Assets

- **The Shroom Bar Nightclub** (`/models/nightclub/the_shroom_bar__nightclub.glb`)
  - Stage replacement with curated lighting
  - Auto-scaled and positioned
  
- **Futuristic Geodesic Space Station** (`/models/rooms/futuristic_geodesic_space_station.glb`)
  - Floating mezzanine with holographic effects
  - Additive blending for neon glow
  
- **Khronos BoomBox** (`/models/external/khronos_boombox.glb`)
  - Audio-reactive speaker prop
  - Wired to bass frequencies
  
- **Khronos DamagedHelmet** (`/models/external/khronos_damaged_helmet.glb`)
  - Holographic centerpiece
  - Interactive, wired to treble frequencies

### Audio-Reactive Integration

Assets are automatically wired to frequency bands in the main update loop:

```javascript
// In updateAudioAnalysis():
if (codexAssetIntegration) {
    codexAssetIntegration.updateAudioReactive(frequencyBands);
}
```

This updates emissive intensity based on:
- **Bass** → BoomBox intensity
- **Mid** → Geodesic Station intensity  
- **Treble** → DamagedHelmet intensity

### Adding New Assets

To add a new asset to the Codex integration system:

1. Add a load method to `CodexAssetIntegration`:
```javascript
async loadNewAsset() {
    const model = await this.assetLoader.loadModel('/models/path/to/asset.glb');
    this.autoScaleModel(model, { desiredHeight: 2 });
    this.enhanceMaterials(model, { applyNeonTint: true });
    this.tagAsset(model, 'Asset Name', 'License');
    this.scene.add(model);
    this.loadedAssets.set('newAsset', model);
    return model;
}
```

2. Call it in `loadAllAssets()`:
```javascript
results.newAsset = await this.loadNewAsset();
```

3. Wire audio-reactive properties if needed:
```javascript
wireAudioReactive(audioSystem) {
    const asset = this.loadedAssets.get('newAsset');
    if (asset) {
        asset.userData.audioReactive = {
            frequencyBand: 'bass',
            targetProperty: 'emissiveIntensity',
            minValue: 0.3,
            maxValue: 1.5
        };
    }
}
```

See `src/scene/CodexAssetIntegration.js` for complete implementation details.

