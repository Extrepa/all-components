# Extracted Modules Reference Guide

**Last Updated**: December 10, 2025  
**Purpose**: Quick reference for all modules extracted from main.js

---

## Update Modules (`src/core/updates/`)

### SystemsUpdater.js
**Status**: ✅ Created, ⚠️ Not yet integrated  
**Size**: ~357 lines  
**Purpose**: Consolidates all system updates into one function  
**API**:
```javascript
updateAllSystems({
    deltaTime,
    elapsedTime,
    clock,
    systems: { /* all game systems */ }
});

renderScene({
    scene,
    camera,
    renderer,
    composer,
    postProcessingEnabled,
});
```
**Dependencies**: All other updater modules  
**Integration Status**: Ready to use, but not called from main.js yet

---

### AvatarMovementUpdater.js
**Status**: ✅ Created and used  
**Size**: ~200 lines  
**Purpose**: Handles avatar movement, physics, collision, and particle effects  
**API**:
```javascript
updateAvatarMovement({
    keys,
    avatar,
    physicsSystem,
    collisionSystem,
    particleSystem,
    deltaTime,
    elapsedTime,
    scene,
});

updateAvatarFootsteps({
    footstepSystem,
    avatar,
    particleSystem,
    camera,
    deltaTime,
});
```
**Dependencies**: Three.js, constants  
**Used in**: main.js animate() function

---

### PostProcessingUpdater.js
**Status**: ✅ Created and used  
**Size**: ~100 lines  
**Purpose**: Handles post-processing effects (motion blur, bloom, canvas filters)  
**API**:
```javascript
updatePostProcessing({
    composer,
    cameraController,
    bloomPass,
    frequencyBands,
    frequencyExtractor,
    vibeMeter,
    deltaTime,
    codexAssetIntegration,
    avatarPosition,
});

updateCanvasFilters({
    composer,
    vibeMeter,
});
```
**Dependencies**: Three.js  
**Used in**: main.js animate() function (via SystemsUpdater when integrated)

---

### CollectiblesUpdater.js
**Status**: ✅ Created and used  
**Size**: ~50 lines  
**Purpose**: Updates collectibles and collection progress UI  
**API**:
```javascript
updateCollectibles({
    collectibleManager,
    avatar,
    deltaTime,
    elapsedTime,
    collectionGoalsUI,
});
```
**Dependencies**: None (pure logic)  
**Used in**: main.js animate() function (via SystemsUpdater when integrated)

---

### InteractionUpdater.js
**Status**: ✅ Created and used  
**Size**: ~30 lines  
**Purpose**: Updates interaction system and reticle visibility  
**API**:
```javascript
updateInteraction({
    interactionSystem,
    camera,
    avatar,
});
```
**Dependencies**: None (pure logic)  
**Used in**: main.js animate() function (via SystemsUpdater when integrated)

---

### AudioUpdateHelpers.js
**Status**: ✅ Created and used  
**Size**: ~47 lines  
**Purpose**: Helper functions for audio-reactive effects  
**API**:
```javascript
updateAudioReactiveLightingHelper(spotLight, bassEnergy);
updateAudioReactiveFogHelper(fog, frequencyBands, overallEnergy);
updateAudioFadeInHelper(ambientAudio, deltaTime, progress, duration);
```
**Dependencies**: Three.js, constants  
**Used in**: main.js animate() function, SystemsUpdater

---

### AudioAnalysisUpdater.js
**Status**: ✅ Created and used  
**Size**: ~115 lines  
**Purpose**: Handles audio analysis, frequency band extraction, beat detection  
**API**:
```javascript
updateAudioAnalysisHelper({
    analyser,
    audioData,
    frequencyExtractor,
    beatDetector,
    clock,
    codexAssetIntegration,
    particleSystem,
    eventSystem,
    visualEffects,
    worldStateReactor,
    avatar,
    audioReactiveDebugger,
    frequencyBands,
    bassEnergy,
    overallEnergy,
    roomSize,
});
// Returns: { bassEnergy, overallEnergy, frequencyBands }
```
**Dependencies**: Three.js, constants, AudioUpdateHelpers  
**Used in**: main.js animate() function, SystemsUpdater

---

### EnvironmentAnimator.js
**Status**: ✅ Created and used  
**Size**: ~300 lines  
**Purpose**: Handles all environment animations (lights, LEDs, speakers, materials, fans, screens)  
**API**:
```javascript
EnvironmentAnimator.updateEnvironmentAnimations(
    deltaTime,
    elapsedTime,
    frequencyExtractor,
    audioData,
    ledStrips,
    ceilingLights,
    overallEnergy,
    bassEnergy,
    holographicRings,
    restModeEnabled,
    speakerCones,
    particleSystem,
    floorMaterial,
    wallMaterial,
    leftFanBlades,
    rightFanBlades,
    screenTexture,
    updateScreenTexture,
    applyGlitchToScreen,
    ROOM_SIZE
);
```
**Dependencies**: Three.js, constants  
**Used in**: main.js animate() function, SystemsUpdater

---

## Initializer Modules (`src/core/initializers/`)

### SceneBuilderInitializer.js
**Status**: ✅ Created and used  
**Purpose**: Initializes all scene geometry, lighting, and effects  
**API**:
```javascript
const sceneData = SceneBuilderInitializer.initialize(scene);
// Returns: { materials, objects, speakerCones, lights, fog, etc. }
```
**Dependencies**: RoomBuilder, LightingSetup, EnvironmentEffects  
**Used in**: main.js initialization

---

### AudioInitializationHelper.js
**Status**: ✅ Created and used  
**Purpose**: Initializes audio context and related systems  
**API**:
```javascript
const { audioContext, analyser, audioData } = await initAudioContext();
const { audioPlayer, errlPhone } = await initializeAudioPlayer(...);
```
**Dependencies**: Audio systems  
**Used in**: main.js initialization

---

### PostProcessingInitializer.js
**Status**: ✅ Created and used  
**Purpose**: Sets up post-processing pipeline  
**API**:
```javascript
const result = await setupPostProcessingHelper(renderer, scene, camera);
// Returns: { composer, bloomPass, postProcessingEnabled }
```
**Dependencies**: PostProcessingManager  
**Used in**: main.js initialization

---

### Other Initializers
- `CollectiblesInitializationHelper.js` - Initialize collection tracker and manager
- `UISystemsInitializationHelper.js` - Initialize UI components
- `AudioSystemsInitializationHelper.js` - Audio system setup
- `DevToolsInitializationHelper.js` - Dev tools setup
- `SettingsInitializationHelper.js` - Settings manager setup

---

## Handler Modules (`src/core/handlers/`)

### MouseEventHandlers.js
**Status**: ✅ Created and used  
**Purpose**: Handles all mouse events (drag, click, wheel)  
**API**:
```javascript
const cleanup = setupMouseHandlers(canvas, cameraController);
// Returns cleanup function to remove event listeners
```
**Used in**: main.js after systems initialization

---

### KeyboardEventHandlers.js
**Status**: ✅ Created and used  
**Purpose**: Handles all keyboard events (game actions, UI toggles, debug tools)  
**API**:
```javascript
const cleanup = setupKeyboardHandlers({
    keys,
    avatar,
    interactionSystem,
    // ... all systems needed for keyboard handlers
});
// Returns cleanup function to remove event listeners
```
**Used in**: main.js after systems initialization

---

### ResizeHandler.js
**Status**: ✅ Created and used  
**Purpose**: Handles window resize events  
**API**:
```javascript
const cleanup = setupResizeHandler(camera, renderer, composer);
// Returns cleanup function to remove event listener
```
**Used in**: main.js after composer initialization

---

## Helper Modules (`src/core/helpers/`)

### InteractionRegistrationHelper.js
**Status**: ✅ Created and used  
**Purpose**: Registers interactable objects with interaction system  
**API**:
```javascript
InteractionRegistrationHelper.registerInteractables(
    djScreen,
    interactionSystem,
    screenMaterial
);
```
**Used in**: main.js initialization

---

### FPSTracker.js
**Status**: ✅ Created and used  
**Purpose**: Tracks FPS for performance monitoring  
**API**:
```javascript
const fpsTracker = new FPSTracker();
fpsTracker.update(); // Call each frame
const fps = fpsTracker.getFPS();
```
**Used in**: main.js animate() function

---

## Integration Notes

### SystemsUpdater Integration
The `SystemsUpdater.js` module consolidates all system updates but is not yet integrated. To integrate:

1. Import `updateAllSystems` and `renderScene` from SystemsUpdater
2. Replace individual system update calls in `animate()` with:
   ```javascript
   updateAllSystems({
       deltaTime,
       elapsedTime,
       clock,
       systems: { /* all systems as object */ }
   });
   
   renderScene({
       scene,
       camera,
       renderer,
       composer,
       postProcessingEnabled,
   });
   ```

### UpdateManager Compatibility
All updater modules are designed to be compatible with `UpdateManager`. They:
- Accept explicit dependencies as parameters
- Don't rely on global state
- Can be called from UpdateManager methods

### GameLoop Migration
Once SystemsUpdater is integrated, the next step is:
1. Ensure all dependencies are in a systems object
2. Replace `animate()` with `GameLoop.start()`
3. Update `UpdateManager` to call `SystemsUpdater.updateAllSystems()` or integrate updaters directly

---

## Testing Checklist

After integrating SystemsUpdater:
- [ ] Game loads correctly
- [ ] Avatar movement works
- [ ] Audio-reactive effects work
- [ ] Post-processing works
- [ ] Collectibles spawn and collect
- [ ] Interactions work
- [ ] Environment animations work
- [ ] Performance is acceptable

---

## Dependencies Map

```
SystemsUpdater
├── AvatarMovementUpdater
│   └── (Three.js, constants)
├── PostProcessingUpdater
│   └── (Three.js)
├── CollectiblesUpdater
├── InteractionUpdater
├── InteractiveObjectsUpdater
├── EnvironmentAnimator
│   └── (Three.js, constants)
├── AudioAnalysisUpdater
│   ├── AudioUpdateHelpers
│   └── (Three.js, constants)
└── FPSTracker
```

---

## Common Patterns

### All Updaters Follow:
1. **Explicit Dependencies**: All dependencies passed as parameters
2. **Pure Functions**: No side effects beyond updating passed objects
3. **Null Checks**: All updaters check for null/undefined before using
4. **Return Values**: Update mutable state by reference, return new state when needed

### All Initializers Follow:
1. **Async/Await**: Handle async operations properly
2. **Error Handling**: Catch and log errors gracefully
3. **Progress Updates**: Update loading screen when applicable
4. **Return Objects**: Return initialized objects for use

