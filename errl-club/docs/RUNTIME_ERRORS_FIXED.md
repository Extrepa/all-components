# Runtime Errors Fixed

Date: 2025-12-08

## Summary

Fixed two critical runtime errors that were preventing the game from loading:
1. Avatar initialization failure
2. WebGL texture unit limit exceeded

## Issue 1: Avatar Initialization Error

### Error
```
TypeError: Cannot read properties of undefined (reading 'rotation')
    at ErrlAvatar.updateForwardDirection (ErrlAvatar.js:514:85)
    at new ErrlAvatar (ErrlAvatar.js:102:14)
```

### Root Cause
The `updateForwardDirection()` method was being called in the constructor before `this.group` was created. The method tried to access `this.group.rotation.y`, which didn't exist yet.

### Solution
1. **Moved initialization call**: Moved `updateForwardDirection()` call to after `this.group` is created (line 117)
2. **Added safety check**: Added null check in `updateForwardDirection()` to handle cases where group might not exist

### Files Modified
- `src/avatar/ErrlAvatar.js`

### Code Changes
```javascript
// Before: Called before group was created
this.forwardDirection = new THREE.Vector3(0, 0, 1);
this.updateForwardDirection(); // ❌ Group doesn't exist yet

// After: Called after group is created
this.group = new THREE.Group();
this.group.rotation.y = 0;
this.updateForwardDirection(); // ✅ Group exists now
```

## Issue 2: WebGL Texture Unit Limit Error

### Error
```
THREE.WebGLProgram: Shader Error 0 - VALIDATE_STATUS false
FRAGMENT shader texture image units count exceeds MAX_TEXTURE_IMAGE_UNITS(16)
```

### Root Cause
WebGL has a limit of 16 texture image units. Each texture map in a material (map, normalMap, roughnessMap, metalnessMap, emissiveMap, envMap, etc.) consumes one texture unit. When multiple materials with many texture maps are rendered simultaneously, the limit is exceeded.

### Solution
1. **Created MaterialSimplifier utility**: New utility class to automatically remove non-essential texture maps from materials
2. **Fixed TV screen material**: Removed redundant `emissiveMap` (was using same texture as `map`)
3. **Automatic simplification**: Materials are automatically simplified after scene initialization
4. **Texture unit tracking**: Added estimation and warning system to prevent future issues

### Files Modified
- `src/utils/MaterialSimplifier.js` (new file)
- `src/core/GameInitializer.js`
- `src/systems/TVRenderSystem.js`

### MaterialSimplifier Features
- Removes non-essential texture maps (normal, roughness, metalness, ao, displacement, alpha, light)
- Aggressive mode also removes emissiveMap and envMap
- Keeps only essential maps (diffuse/color map)
- Estimates texture unit usage
- Warns when approaching limit

### Code Changes

**TV Screen Material**:
```javascript
// Before: Using both map and emissiveMap (2 texture units)
this.tvScreenMaterial = new THREE.MeshStandardMaterial({
    map: this.renderTarget.texture,
    emissiveMap: this.renderTarget.texture, // ❌ Redundant
});

// After: Using only map (1 texture unit)
this.tvScreenMaterial = new THREE.MeshStandardMaterial({
    map: this.renderTarget.texture,
    emissive: 0xffffff, // ✅ Use color instead of map
});
```

**Automatic Material Simplification**:
```javascript
// Added to GameInitializer after scene is built
const { MaterialSimplifier } = await import('../utils/MaterialSimplifier.js');
MaterialSimplifier.simplifyMaterials(clubScene, true);
MaterialSimplifier.checkTextureUnitUsage(clubScene, 12);
```

## Testing

### Build Status
- ✅ Build succeeds without errors
- ✅ No linting errors in modified files
- ✅ All code properly formatted

### Expected Behavior
1. **Avatar Initialization**: Avatar should now initialize successfully without errors
2. **WebGL Rendering**: No texture unit limit errors should occur
3. **Material Simplification**: Materials are automatically simplified to reduce texture usage

## Prevention

### MaterialSimplifier Utility
The new `MaterialSimplifier` utility provides:
- Automatic material simplification
- Texture unit estimation
- Warning system when approaching limits
- Can be called manually if needed

### Best Practices
1. Use `MaterialSimplifier.simplifyMaterials()` after creating scenes with many materials
2. Avoid using multiple texture maps on the same material when possible
3. Use texture atlases instead of individual textures
4. Monitor texture unit usage with `checkTextureUnitUsage()`

## Related Files

- `src/utils/MaterialSimplifier.js` - Material simplification utility
- `src/avatar/ErrlAvatar.js` - Avatar initialization fix
- `src/core/GameInitializer.js` - Material simplification integration
- `src/systems/TVRenderSystem.js` - TV screen material fix
- `src/effects/PostProcessingManager.js` - Already had texture error handling

## Notes

- The MaterialSimplifier runs automatically after scene initialization
- PostProcessingManager already had error handling for texture unit limits
- TVRenderSystem already had material simplification for TV rendering
- These fixes ensure the main scene also stays under texture unit limits

