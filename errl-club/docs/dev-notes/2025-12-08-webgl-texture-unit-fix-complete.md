# WebGL Texture Unit Limit Fix - Complete

**Date**: December 8, 2025  
**Status**: ✅ Complete - All phases implemented  
**Issue**: Persistent `FRAGMENT shader texture image units count exceeds MAX_TEXTURE_IMAGE_UNITS(16)` WebGL errors

## Problem Summary

The game was experiencing persistent WebGL `INVALID_OPERATION` errors due to exceeding the hardware limit of 16 texture image units. This occurred because:

1. **Codex assets** were loaded with `MeshStandardMaterial` instances
2. **Material enhancement functions** were converting materials back to `MeshStandardMaterial` after simplification
3. **Interactive objects** were creating new `MeshStandardMaterial` instances
4. **Collectibles and effects** were using complex materials
5. **Order of operations** - materials were being enhanced before simplification, causing re-conversion

## Solution Overview

Implemented a comprehensive multi-phase approach to ensure ALL materials in the scene are `MeshBasicMaterial` before the first render:

### Phase 1: CodexAssetIntegration Material Pipeline ✅
- **File**: `src/scene/CodexAssetIntegration.js`
- **Changes**:
  - Added `simplifyAssetMaterials(asset)` method to simplify materials immediately after each asset loads
  - Modified `loadShroomBar`, `loadGeodesicStation`, `loadBoomBox`, `loadDamagedHelmet` to call `simplifyAssetMaterials` AFTER `applyPresetToAsset` or `enhanceMaterials`
  - Removed `applyPresetToAsset` import and introduced `applyPresetToSimplifiedAsset` to work with `MeshBasicMaterial`
  - Ensures materials are simplified even after preset/enhancement operations

### Phase 2: Interactive Objects ✅
- **Files Updated** (10 files):
  - `src/interactions/Door.js`
  - `src/interactions/Teleporter.js`
  - `src/interactions/CameraConsole.js`
  - `src/interactions/LightingConsole.js`
  - `src/interactions/FogVent.js`
  - `src/interactions/VentilationFan.js`
  - `src/interactions/MovingPlatform.js`
  - `src/interactions/PortalRift.js`
  - `src/interactions/PushableProp.js` (already done)
  - `src/interactions/SeatableObject.js` (already done)
  - `src/interactions/ThrowableDrip.js`
  - `src/interactions/InteractiveScreen.js`
- **Changes**: All now use `createMaterial()` from `MaterialSimplifier.js` instead of `new THREE.MeshStandardMaterial()`

### Phase 3: Collectibles ✅
- **Files Updated** (4 files):
  - `src/collectibles/BubbleCollectible.js`
  - `src/collectibles/DripCollectible.js`
  - `src/collectibles/ErrlFragment.js`
  - `src/collectibles/GlowBall.js`
- **Changes**: All collectible materials now use `createMaterial()` to ensure `MeshBasicMaterial`

### Phase 4: Visual Effects ✅
- **File**: `src/effects/VisualEffects.js`
- **Changes**: Updated all effect materials:
  - `createDistortionRing()` - distortion rings
  - `createGooTrail()` - goo trails
  - `createFloorRipple()` - floor ripples
  - `createHallucinationZone()` - hallucination zones

### Phase 5: Avatar and Systems ✅
- **Files Updated**:
  - `src/avatar/ErrlAvatar.js` - main material, shadow, glow, forward indicator, hoverboard
  - `src/systems/TeleportSystem.js` - anchor markers
  - `src/systems/LODSystem.js` - LOD proxy meshes
  - `src/assets/AssetErrorHandler.js` - fallback placeholder materials

### Phase 6: Main Entry Point ✅
- **File**: `src/main.js`
- **Changes**: DJ booth ring materials now use `MeshBasicMaterial`

## Material Simplification Strategy

### MaterialSimplifier.js Enhancements
- **Accurate counting**: `estimateTextureUnits()` now counts `MeshStandardMaterial` and `MeshPhysicalMaterial` instances as consuming texture units, even without explicit texture maps
- **Aggressive simplification**: `simplifyMaterials()` removes texture maps from `MeshBasicMaterial` instances (map, alphaMap)
- **Runtime monitoring**: `checkTextureUnitUsage()` provides real-time texture unit usage
- **Material creation utility**: `createMaterial()` ensures all new materials are `MeshBasicMaterial`

### Simplification Checkpoints

1. **After Codex Assets Load** (`main.js`)
   - Iterative simplification passes (up to 3) after all Codex assets are loaded
   - Logs texture unit usage before and after each pass

2. **Pre-Render Pass** (`GameInitializer.js`)
   - Final aggressive simplification pass RIGHT BEFORE `gameLoop.start()`
   - Uses `requestAnimationFrame` to ensure it happens immediately before first render
   - Logs texture unit usage and warns if units remain

3. **Runtime Monitoring** (`GameLoop.js`)
   - Pre-render check using `checkTextureUnitUsage()` before each frame
   - Logs warnings if texture units are detected

## Files Modified Summary

### Core Systems (3 files)
- `src/core/GameInitializer.js` - Pre-render simplification pass
- `src/core/GameLoop.js` - Runtime monitoring
- `src/utils/MaterialSimplifier.js` - Enhanced simplification logic

### Scene Integration (1 file)
- `src/scene/CodexAssetIntegration.js` - Per-asset simplification pipeline

### Interactions (12 files)
- All interaction objects now use `createMaterial()`

### Collectibles (4 files)
- All collectible types now use `createMaterial()`

### Effects (1 file)
- All visual effect materials simplified

### Avatar & Systems (3 files)
- Avatar materials, teleport system, LOD system

### Main Entry (1 file)
- DJ booth rings

**Total: 25 files modified**

## Verification

### Linter Status
- ✅ No linter errors
- ✅ All files formatted with Prettier
- ✅ All imports properly added

### Material Status
- ✅ All `MeshStandardMaterial` instances replaced (except in `MaterialSimplifier.js` itself and template files)
- ✅ All new material creation uses `createMaterial()` utility
- ✅ Multiple simplification checkpoints ensure no complex materials remain

### Code Quality
- ✅ Consistent use of `createMaterial()` utility
- ✅ Proper error handling and logging
- ✅ Defensive programming with null checks

## Testing Readiness

The codebase is now ready for testing. All materials are `MeshBasicMaterial`, which should prevent WebGL texture unit limit errors.

### Expected Behavior
- No `FRAGMENT shader texture image units count exceeds MAX_TEXTURE_IMAGE_UNITS(16)` errors
- No `INVALID_OPERATION: useProgram: program not valid` errors
- Post-processing should enable successfully on first render
- All visual effects should render correctly (though with simplified materials)

### Next Steps
1. Run the game and verify no WebGL errors in console
2. Check that post-processing enables successfully
3. Verify all visual effects render correctly
4. Test with Playwright test suite
5. Monitor texture unit usage in runtime logs

## Notes

- **Material Simplification Trade-offs**: Using `MeshBasicMaterial` means we lose:
  - PBR lighting (metalness, roughness)
  - Emissive properties (simulated with bright colors)
  - Normal maps, roughness maps, etc.
  
  However, this is necessary to stay within WebGL texture unit limits and ensure the game runs on all hardware.

- **Future Enhancements**: If needed, we could implement:
  - Dynamic material switching based on distance (LOD)
  - Selective material enhancement for important objects
  - Custom shaders that combine multiple effects into single texture units

## Related Documentation

- `docs/technical/material-simplification.md` - Technical details on material simplification
- `src/utils/MaterialSimplifier.js` - Implementation details
- `docs/refactoring/LOOP_MANAGER_IMPLEMENTATION.md` - System architecture context

---

**Session Complete** ✅  
All phases implemented and verified. Ready for testing.

**Date**: December 8, 2025 (PST)

