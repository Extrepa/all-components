# 3D Model Integration Guide

**Last Updated**: December 10, 2025  
**Asset Type**: 3D Models (GLB/GLTF, OBJ, FBX)

## Overview

This guide provides detailed instructions for integrating 3D models into the Errl Club Simulator project.

## Supported Formats

- **GLB** (recommended) - Binary GLTF, single file, best performance
- **GLTF** - Text-based GLTF, separate files
- **OBJ** - Legacy format, limited material support
- **FBX** - Autodesk format, good for animations

## Size Guidelines

- **Small Props** (< 1m): < 2MB, < 5K triangles
- **Medium Objects** (1-5m): < 10MB, < 50K triangles
- **Large Structures** (5-20m): < 25MB, < 200K triangles
- **Environment Pieces** (> 20m): < 50MB, < 500K triangles

## Optimization Requirements

Before integration:
- Use GLB format when possible (binary, single file)
- Compress textures (BC7/ETC2 for WebGL)
- Remove unused materials/animations
- Merge meshes where possible
- Use instancing for repeated objects
- Reduce polygon count if over limits

## Integration Steps

### 1. Prepare Asset

- Export model in GLB format (preferred)
- Optimize textures
- Remove unused materials
- Test model loads in Three.js viewer

### 2. Place Asset

Place model in appropriate directory:
```
public/models/
├── props/          # Small interactive objects
├── environment/    # Large scene pieces
├── characters/     # Character models
└── effects/        # Particle/effect models
```

Example: `/public/models/props/my_prop.glb`

### 3. Validate Asset

```javascript
import { AssetValidator } from './assets/AssetValidator.js';

const validator = new AssetValidator();
const result = validator.validate({
    type: '3d-model',
    path: '/models/props/my_prop.glb',
    size: fileSizeInBytes,
    format: 'glb',
    license: 'CC BY 4.0',
    category: 'props',
});

if (!result.valid) {
    console.error('Validation errors:', result.errors);
    return;
}
```

### 4. Register Asset

```javascript
import { AssetRegistry } from './assets/AssetRegistry.js';

const registry = new AssetRegistry();
registry.register('myProp', {
    type: '3d-model',
    path: '/models/props/my_prop.glb',
    category: 'props',
    size: fileSizeInBytes,
    format: 'glb',
    license: 'CC BY 4.0',
    source: 'Source Name',
    description: 'Description of asset',
    tags: ['prop', 'interactive'],
});
```

### 5. Create Integration Method

Add to `src/scene/CodexAssetIntegration.js`:

```javascript
/**
 * Load and integrate My Prop
 * @returns {Promise<THREE.Group>} Loaded model
 */
async loadMyProp() {
    try {
        // Load model
        const model = await this.assetLoader.loadModel(
            '/models/props/my_prop.glb'
        );

        // Auto-scale to desired dimensions
        this.autoScaleModel(model, {
            desiredHeight: 1.5, // meters
            maxScale: 2.0, // prevent excessive scaling
        });

        // Position in scene
        model.position.set(0, 0, 0);

        // Enhance materials with preset
        const preset = getPreset('cyan'); // or 'green', 'magenta', etc.
        if (preset) {
            applyPresetToAsset(model, preset);
        } else {
            // Fallback to manual enhancement
            this.enhanceMaterials(model, {
                applyNeonTint: true,
                neonColor: new THREE.Color(0x00ffff),
                emissiveIntensity: 0.4,
            });
        }

        // Precompute bounding sphere for frustum culling
        const box = new THREE.Box3().setFromObject(model);
        model.userData.boundingSphere = box.getBoundingSphere(new THREE.Sphere());
        model.userData.proximityThreshold = 10; // Visibility distance in meters

        // Tag asset with metadata
        this.tagAsset(model, 'My Prop', 'CC BY 4.0 - Source Name');

        // Add to scene
        this.scene.add(model);
        this.loadedAssets.set('myProp', model);

        // Register with LOD system if available
        if (this.lodSystem) {
            this.lodSystem.registerAsset('myProp', model);
        }

        console.log('✅ Loaded My Prop');
        return model;
    } catch (error) {
        console.error('❌ Failed to load My Prop:', error);
        return null;
    }
}
```

### 6. Add Audio-Reactive Properties (Optional)

If asset should react to audio:

```javascript
// In loadMyProp() method, after loading:
model.userData.audioReactive = {
    frequencyBand: 'bass', // 'bass', 'mid', or 'treble'
    targetProperty: 'emissiveIntensity', // Property to modify
    minValue: 0.3, // Minimum value
    maxValue: 1.5, // Maximum value
};

// Then in updateAudioReactive() method:
// Asset will automatically update based on frequency data
```

### 7. Add Interactions (Optional)

If asset should be interactive:

```javascript
// In loadMyProp() method, after loading:
model.userData.interactive = true;
model.userData.interactionType = 'hover'; // or 'click', 'proximity'
model.userData.interactionRange = 3; // Interaction range in meters

// Register with InteractionSystem
if (this.systems.interactionSystem) {
    this.systems.interactionSystem.registerInteractive(model, {
        onHover: () => {
            // Hover action
        },
        onClick: () => {
            // Click action
        },
    });
}
```

### 8. Call Integration Method

In initialization code (e.g., `main.js` or `GameInitializer.js`):

```javascript
// After CodexAssetIntegration is initialized
await codexAssetIntegration.loadMyProp();
```

### 9. Test Integration

- Visual inspection: Verify model appears correctly
- Position check: Verify model is in correct location
- Scale check: Verify model is appropriately sized
- Material check: Verify materials are enhanced correctly
- Performance check: Verify no performance issues
- Proximity check: Verify visibility works at distance
- LOD check: Verify LOD switching works
- Audio-reactive check: Verify audio-reactive properties work (if applicable)
- Interaction check: Verify interactions work (if applicable)

### 10. Update Documentation

- Add asset to `docs/assets/ASSET_CATALOG.md`
- Document any special features or requirements
- Update integration checklist

## Material Presets

Available material presets (see `src/config/MaterialPresets.js`):
- `cyan` - Cyan neon glow
- `green` - Green neon glow
- `magenta` - Magenta holographic effect
- `red` - Red neon glow
- `blue` - Blue neon glow
- Custom presets can be created

## Proximity Visibility

Set `proximityThreshold` in `model.userData` to control when asset becomes visible:
- Small props: 5-10 meters
- Medium objects: 10-15 meters
- Large structures: 15-25 meters
- Environment pieces: 25+ meters

## LOD System

All 3D models should be registered with LOD system:
```javascript
if (this.lodSystem) {
    this.lodSystem.registerAsset('assetId', model);
}
```

LOD system automatically switches detail levels based on distance.

## Error Handling

Use `AssetErrorHandler` for graceful error handling:
```javascript
import { AssetErrorHandler } from './assets/AssetErrorHandler.js';

const errorHandler = new AssetErrorHandler();
try {
    const model = await this.assetLoader.loadModel(path);
} catch (error) {
    const fallback = await errorHandler.handleError(path, error, {
        assetType: '3d-model',
        loader: (path) => this.assetLoader.loadModel(path),
    });
    // Use fallback or handle error
}
```

## Examples

See existing integrations in `src/scene/CodexAssetIntegration.js`:
- `loadShroomBar()` - Large environment piece
- `loadGeodesicStation()` - Floating structure with holographic effects
- `loadBoomBox()` - Small prop with audio-reactive properties
- `loadDamagedHelmet()` - Interactive centerpiece

## Troubleshooting

### Model Not Loading
- Check file path is correct
- Verify file exists in public directory
- Check browser console for errors
- Verify format is supported

### Model Not Visible
- Check position is within camera view
- Verify scale is appropriate
- Check proximity threshold settings
- Verify material is not transparent

### Performance Issues
- Reduce polygon count
- Enable LOD system
- Compress textures
- Use instancing for repeated objects

### Material Issues
- Verify material preset exists
- Check material enhancement code
- Verify textures are loaded
- Check emissive properties

## Next Steps

After integration:
1. Test in development
2. Test in production build
3. Monitor performance
4. Update asset catalog
5. Add to test suite

