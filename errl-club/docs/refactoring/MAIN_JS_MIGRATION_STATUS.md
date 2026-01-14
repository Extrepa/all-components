# main.js Migration Status

**Date**: December 10, 2025  
**Status**: Migration Needed - main.js has duplicate code that should use existing systems

---

## Current Situation

### main.js (3,163 lines)
- **Entry Point**: Yes (loaded by `index.html`)
- **Status**: Contains all initialization logic inline
- **Issue**: Duplicates functionality that already exists in other modules

### Existing Systems (Not Used by main.js)
- ✅ `GameInitializer` - Handles complete game initialization
- ✅ `GameLoop` - Manages animation loop with UpdateManager
- ✅ `UpdateManager` - Coordinates all system updates
- ✅ `InputManager` - Handles keyboard/mouse input
- ✅ `SceneInitializer` - Creates scene (RoomBuilder + LightingSetup + EnvironmentEffects)

---

## Migration Strategy

### Option A: Migrate to GameInitializer (Recommended)
**Target**: Reduce main.js to ~100-200 lines

**Steps**:
1. Replace inline initialization with `GameInitializer.initialize()`
2. Replace animate() function with `GameLoop.start()`
3. Remove duplicate scene setup code (use SceneInitializer)
4. Remove duplicate input handlers (use InputManager)
5. Remove duplicate audio setup (use AudioInitializer)

**Result**:
```javascript
// main.js (simplified)
import './style.css';
import { LoadingScreen } from './ui/LoadingScreen.js';
import { GameInitializer } from './core/GameInitializer.js';
import { GameLoop } from './core/GameLoop.js';
import { UpdateManager } from './core/UpdateManager.js';

// Get canvas
const canvas = document.getElementById('club-canvas');
const loadingScreen = new LoadingScreen();

// Initialize game
const gameInitializer = new GameInitializer(canvas);
const systems = await gameInitializer.initialize();

// Create game loop
const gameLoop = new GameLoop(
    new UpdateManager(),
    systems.postProcessingManager,
    systems.renderer,
    systems.scene,
    systems.camera,
    systems
);

// Wait for user to click "Ready"
loadingScreen.setOnReady(() => {
    loadingScreen.hide();
    gameLoop.start();
});
```

---

### Option B: Incremental Extraction (Safer)
**Target**: Extract one concern at a time, test after each

**Steps**:
1. ✅ Extract scene setup to SceneInitializer (created, needs migration)
2. Extract animation loop to use GameLoop
3. Extract event handlers to use InputManager
4. Extract audio setup
5. Extract UI initialization
6. Final cleanup

---

## Dependencies Analysis

### Variables Used in Animation Loop
These need to be accessible after migration:
- Scene objects: `spotLight`, `ceilingLights`, `speakerCones`, `screenMaterial`, `holographicRings`
- Systems: `avatar`, `camera`, `cameraController`, `particleSystem`, etc.
- Audio: `frequencyBands`, `bassEnergy`, `overallEnergy`
- Post-processing: `composer`

**Solution**: These should be stored in `systems` object returned by GameInitializer

---

## Risk Assessment

### High Risk
- ⚠️ Animation loop migration - large code block, many dependencies
- ⚠️ Scene setup migration - many variables need to be accessible

### Medium Risk
- ⚠️ Audio setup migration - already partially extracted
- ⚠️ Event handlers - InputManager exists, need to ensure all callbacks work

### Low Risk
- ✅ UI initialization - isolated, easy to test
- ✅ Post-processing - PostProcessingManager already exists

---

## Recommended Approach

**Start with Option B (Incremental)**:
1. First: Migrate scene setup to use SceneInitializer
2. Second: Migrate animation loop to use GameLoop
3. Third: Migrate remaining pieces incrementally

This allows testing after each step and minimizes risk.

---

## Next Steps

1. Review GameInitializer to ensure it returns all needed variables
2. Migrate main.js to use SceneInitializer first
3. Test that scene still builds correctly
4. Continue with animation loop migration

