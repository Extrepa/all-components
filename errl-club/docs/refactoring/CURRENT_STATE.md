# main.js Refactoring - Current State

**Last Updated**: December 10, 2025  
**Current Size**: 1,404 lines (down from 3,163 - 55.6% reduction)  
**Status**: Incremental Extraction In Progress

---

## Quick Status Summary

### ✅ Completed Extractions
- **Scene Setup**: Extracted to `SceneBuilderInitializer.js` (~720 lines)
- **Audio Helpers**: Extracted to multiple modules (~300 lines)
- **Event Handlers**: Extracted to `MouseEventHandlers.js`, `KeyboardEventHandlers.js`, `ResizeHandler.js` (~430 lines)
- **System Initializers**: Extracted to multiple helper modules (~500 lines)
- **Update Helpers**: Extracted to specialized updater modules (~380 lines)
- **Systems Updater**: Created `SystemsUpdater.js` to consolidate updates (357 lines, not yet integrated)

### ⏳ In Progress
- Animation loop still in main.js (~600 lines)
- System initialization code still in main.js (~500 lines)
- Individual update calls still scattered in animate() function

### 📋 Next Steps
1. Integrate `SystemsUpdater.js` into main.js's `animate()` function
2. Extract remaining initialization code
3. Prepare for migration to `GameLoop` + `UpdateManager`
4. Final migration to `GameInitializer`

---

## File Structure

### Main File
- `src/main.js` - 1,404 lines (was 3,163)
  - Still contains: Imports, initialization, animate() function, event handler setup

### Extracted Modules Created

#### Core/Updates
- `src/core/updates/AvatarMovementUpdater.js` (~200 lines)
- `src/core/updates/PostProcessingUpdater.js` (~100 lines)
- `src/core/updates/CollectiblesUpdater.js` (~50 lines)
- `src/core/updates/InteractionUpdater.js` (~30 lines)
- `src/core/updates/SystemsUpdater.js` (~357 lines) ⚠️ **Created but not yet integrated**

#### Core/Initializers
- `src/core/initializers/SceneBuilderInitializer.js`
- `src/core/initializers/AudioInitializationHelper.js`
- `src/core/initializers/PostProcessingInitializer.js`
- `src/core/initializers/CollectiblesInitializationHelper.js`
- `src/core/initializers/UISystemsInitializationHelper.js`
- `src/core/initializers/AudioSystemsInitializationHelper.js`
- `src/core/initializers/DevToolsInitializationHelper.js`
- `src/core/initializers/SettingsInitializationHelper.js`

#### Core/Handlers
- `src/core/handlers/MouseEventHandlers.js`
- `src/core/handlers/KeyboardEventHandlers.js`
- `src/core/handlers/ResizeHandler.js`

#### Core/Helpers
- `src/core/helpers/InteractionRegistrationHelper.js`
- `src/core/helpers/FPSTracker.js`

#### Core/Updates (Additional)
- `src/core/updates/AudioUpdateHelpers.js`
- `src/core/updates/AudioAnalysisUpdater.js`
- `src/core/updates/EnvironmentAnimator.js`

---

## Key Dependencies in main.js

### Variables Still in main.js (need to be accessible)
- Scene objects: `spotLight`, `ceilingLights`, `speakerCones`, `screenMaterial`, `holographicRings`, `floorMaterial`, `wallMaterial`
- Systems: `avatar`, `camera`, `cameraController`, `particleSystem`, `physicsSystem`, `collisionSystem`, etc.
- Audio: `frequencyBands`, `bassEnergy`, `overallEnergy`, `analyser`, `audioData`
- Post-processing: `composer`, `bloomPass`
- Interactive objects: `doors`, `teleporters`, `fogVents`, `portalRifts`, `seatableObjects`

### How They're Currently Used
- Defined as `let` variables at module scope
- Passed to extracted updater functions
- Some stored in `window.gameSystems` for global access

---

## Integration Status

### SystemsUpdater.js
- ✅ **Created** with `updateAllSystems()` function
- ⚠️ **Not yet integrated** into main.js's `animate()` function
- ✅ Designed to be compatible with `UpdateManager` structure
- ✅ Uses explicit dependencies (follows Codex recommendations)

### Current animate() Function Structure
```javascript
function animate() {
    requestAnimationFrame(animate);
    
    let deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();
    deltaTime *= timeScale;
    
    // Avatar movement (uses AvatarMovementUpdater)
    updateAvatarMovement({...});
    updateAvatarFootsteps({...});
    
    // Individual system updates (should use SystemsUpdater)
    particleSystem.update(deltaTime);
    physicsSystem.update(deltaTime);
    // ... many more individual calls ...
    
    // Render
    renderer.render(scene, camera);
}
```

### Recommended Next Change
Replace individual system updates with:
```javascript
updateAllSystems({
    deltaTime,
    elapsedTime,
    clock,
    systems: { /* all systems */ }
});

renderScene({
    scene,
    camera,
    renderer,
    composer,
    postProcessingEnabled,
});
```

---

## Codex Recommendations Status

### ✅ Following Recommendations
- **Incremental Extraction**: Extracting one concern at a time ✅
- **Explicit Dependencies**: All updaters use parameter-based dependencies ✅
- **Preparation for Migration**: SystemsUpdater designed for UpdateManager ✅
- **Documentation**: Progress tracked in docs ✅

### ⏳ Pending Recommendations
- **Migrate to GameLoop**: Not yet done - animate() still in main.js
- **Migrate to UpdateManager**: Not yet done - individual update calls remain
- **Migrate to GameInitializer**: Not yet done - initialization still in main.js

---

## Testing Status

### Manual Testing Needed
- ✅ Scene setup still works
- ✅ Audio helpers work correctly
- ✅ Event handlers function properly
- ⚠️ SystemsUpdater not yet tested (not integrated)
- ⚠️ Full integration test needed after SystemsUpdater integration

---

## Known Issues / Notes

1. **SystemsUpdater.js created but not used**: The module exists but isn't called from main.js yet
2. **Duplicate imports**: Some imports appear multiple times in main.js (lines 115-118 show duplicate)
3. **Individual update calls**: Many system updates still called individually instead of via SystemsUpdater
4. **Initialization code**: Large blocks of initialization still inline in main.js
5. **Window.gameSystems**: Some systems stored globally for compatibility

---

## Migration Path (Per Codex)

### Phase 1: Complete Extraction (Current)
- ✅ Extract all update logic to updater modules
- ⏳ Integrate SystemsUpdater into animate()
- ⏳ Extract remaining initialization code

### Phase 2: Prepare for Migration
- ⏳ Ensure all dependencies match UpdateManager expectations
- ⏳ Test SystemsUpdater integration
- ⏳ Verify compatibility with GameLoop structure

### Phase 3: Migrate to GameLoop
- ⏳ Replace animate() with GameLoop.start()
- ⏳ Ensure UpdateManager calls our extracted updaters
- ⏳ Remove duplicate animation loop code

### Phase 4: Final Migration
- ⏳ Migrate initialization to GameInitializer
- ⏳ Reduce main.js to entry point only (~100-200 lines)
- ⏳ Remove all duplicate code

---

## Quick Reference

### Where to Find Things

**Scene Setup**: `src/core/initializers/SceneBuilderInitializer.js`  
**Avatar Movement**: `src/core/updates/AvatarMovementUpdater.js`  
**System Updates**: `src/core/updates/SystemsUpdater.js`  
**Event Handlers**: `src/core/handlers/`  
**Audio Updates**: `src/core/updates/AudioUpdateHelpers.js`, `AudioAnalysisUpdater.js`  
**Environment Animations**: `src/core/updates/EnvironmentAnimator.js`  
**Post-Processing**: `src/core/updates/PostProcessingUpdater.js`

### Important Files to Review
- `src/main.js` - Current state (1,404 lines)
- `src/core/updates/SystemsUpdater.js` - Consolidated updater (not yet used)
- `src/core/UpdateManager.js` - Existing update manager (to integrate with)
- `src/core/GameLoop.js` - Existing game loop (to migrate to)
- `src/core/GameInitializer.js` - Existing initializer (to migrate to)

---

## Next Session Checklist

1. [ ] Read this file to understand current state
2. [ ] Review `SystemsUpdater.js` to understand its API
3. [ ] Check `main.js` animate() function structure
4. [ ] Integrate `SystemsUpdater.updateAllSystems()` into animate()
5. [ ] Test that game still works after integration
6. [ ] Continue with remaining extractions
7. [ ] Prepare for GameLoop migration

