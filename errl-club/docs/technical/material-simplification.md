# Material Simplification Technical Documentation

## Overview

Material simplification is a technique used in the Errl Club Simulator to prevent WebGL texture unit limit errors. This document explains why it's needed, how it works, and future improvements.

## The Problem: WebGL Texture Unit Limits

WebGL has a hardware limit on the number of texture image units available. Most GPUs support **16 texture image units** (though some older devices may support only 8).

Each texture map in a Three.js material consumes one texture unit:
- `map` (diffuse/albedo) - 1 unit
- `normalMap` - 1 unit
- `roughnessMap` - 1 unit
- `metalnessMap` - 1 unit
- `aoMap` (ambient occlusion) - 1 unit
- `emissiveMap` - 1 unit
- `envMap` (environment map) - 1 unit
- `displacementMap` - 1 unit
- `alphaMap` - 1 unit
- `lightMap` - 1 unit

A single `MeshStandardMaterial` with all maps enabled can use up to 10 texture units. With multiple materials in a scene, it's easy to exceed the 16-unit limit, causing:
- `WebGL: too many errors` messages
- `Shader Error 1282` (INVALID_OPERATION)
- Black screen rendering
- Game crashes

## Current Solution: Aggressive Simplification

The current implementation (`src/utils/MaterialSimplifier.js`) uses an **aggressive simplification approach**:

### How It Works

1. **Material Conversion**: Converts all `MeshStandardMaterial` and `MeshPhysicalMaterial` instances to `MeshBasicMaterial`
2. **Texture Removal**: All texture maps are removed (no texture units consumed)
3. **Property Preservation**: Preserves essential properties:
   - `color` (base color)
   - `transparent` / `opacity`
   - `side` (front/back/double)

### Why This Approach?

Even materials without textures can cause shader compilation issues when combined with other materials that do have textures. Converting to `MeshBasicMaterial` ensures:
- **Consistent shader usage**: All materials use the same simple shader
- **Zero texture units**: No risk of exceeding limits
- **Stability**: Prevents rendering errors and crashes

### Trade-offs

**Pros:**
- ✅ Prevents all texture unit limit errors
- ✅ Ensures game stability
- ✅ Simple and reliable
- ✅ Works on all devices

**Cons:**
- ❌ Reduces visual quality (no lighting, no reflections, no normal maps)
- ❌ All materials look flat/unlit
- ❌ No material variety

## Implementation Details

### Usage

```javascript
import { MaterialSimplifier } from './utils/MaterialSimplifier.js';

// Simplify all materials in a scene
MaterialSimplifier.simplifyMaterials(scene, true); // aggressive = true
```

### Code Location

- **File**: `src/utils/MaterialSimplifier.js`
- **Method**: `MaterialSimplifier.simplifyMaterials(scene, aggressive)`
- **Called from**: 
  - `src/core/GameInitializer.js` - Pre-render simplification pass
  - `src/main.js` - After Codex assets load (iterative passes)
  - `src/scene/CodexAssetIntegration.js` - Per-asset simplification
  - `src/core/GameLoop.js` - Runtime monitoring

### Statistics

The simplifier logs conversion statistics:
```
MaterialSimplifier: Converted 306 materials to MeshBasicMaterial, removed 1 texture maps
```

## Future Improvements

### 1. Selective Simplification

Instead of converting everything to `MeshBasicMaterial`, preserve some materials:

```javascript
// Priority system:
// 1. Keep diffuse maps for important objects (player, collectibles)
// 2. Remove normal/roughness/metalness maps
// 3. Keep emissive maps for glowing objects
// 4. Convert less important objects to MeshBasicMaterial
```

### 2. Configuration Options

Add a configuration system:

```javascript
const config = {
    preserveDiffuse: true,      // Keep diffuse maps
    preserveEmissive: true,     // Keep emissive maps
    maxTextureUnits: 12,        // Target texture unit usage
    priorityObjects: ['avatar', 'collectibles'], // Objects to preserve
};
MaterialSimplifier.simplifyMaterials(scene, config);
```

### 3. Texture Atlas

Combine multiple textures into a single atlas:
- Reduces texture unit count
- Maintains visual quality
- More complex to implement

### 4. Material Priority System

Assign priorities to materials:
- **High priority**: Player avatar, important collectibles (preserve more properties)
- **Medium priority**: Interactive objects (preserve diffuse)
- **Low priority**: Environment objects (convert to MeshBasicMaterial)

### 5. Dynamic Simplification

Monitor texture unit usage and simplify dynamically:
- Check texture unit usage each frame
- Simplify materials if approaching limit
- Re-enable materials when usage drops

## Related Issues

### Emissive Property Compatibility

**Problem**: `MeshBasicMaterial` does not support `emissive` or `emissiveIntensity` properties.

**Impact**: Code that tries to set these properties will fail silently or cause errors.

**Solution**: Updated code to check for `material.emissive` before accessing it:
- `src/interactions/InteractiveScreen.js` - Added conditional checks
- `src/core/UpdateManager.js` - Added conditional checks in `updateAudioReactive`

**Example Fix**:
```javascript
// Before (causes error):
material.emissive.setHSL(hue, saturation, brightness);

// After (safe):
if (material.emissive) {
    material.emissive.setHSL(hue, saturation, brightness);
} else {
    material.color.setHSL(hue, saturation, brightness);
}
```

## Monitoring Texture Unit Usage

The `MaterialSimplifier` includes a utility method to estimate texture unit usage:

```javascript
const estimatedUnits = MaterialSimplifier.estimateTextureUnits(scene);
console.log(`Estimated texture units: ${estimatedUnits}/16`);
```

**Note**: This is an estimate. Actual usage depends on what's currently rendered.

## Best Practices

1. **Apply Simplification Early**: Run material simplification immediately after scene loading
2. **Check for Emissive**: Always check if `material.emissive` exists before using it
3. **Monitor Usage**: Log texture unit usage during development
4. **Test on Low-End Devices**: Verify behavior on devices with 8 texture units
5. **Document Exceptions**: If preserving specific materials, document why

## References

- [WebGL Texture Unit Limits](https://www.khronos.org/registry/webgl/specs/1.0/#5.14.8)
- [Three.js Material Types](https://threejs.org/docs/#api/en/materials/Material)
- [Three.js MeshBasicMaterial](https://threejs.org/docs/#api/en/materials/MeshBasicMaterial)
- Related code: `src/utils/MaterialSimplifier.js`
- Related fixes: `src/interactions/InteractiveScreen.js`, `src/core/UpdateManager.js`

## Changelog

- **2025-12-08**: Comprehensive fix - All materials converted to MeshBasicMaterial
  - Fixed CodexAssetIntegration material pipeline
  - Updated all interactive objects, collectibles, effects, avatar, and systems
  - Added multiple simplification checkpoints
  - Implemented `createMaterial()` utility for consistent material creation
  - Created comprehensive documentation
- **2025-12-07**: Initial aggressive simplification implementation (from progress report)
  - Fixed emissive property compatibility issues
- **2025-12-08**: Created comprehensive documentation

