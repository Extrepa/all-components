# main.js Refactoring - Detailed Extraction Plan

**File**: `src/main.js`  
**Current Size**: 3,163 lines  
**Target Size**: < 400 lines

---

## Current Structure Analysis

### Major Sections (by line ranges)

1. **Lines 1-94**: Imports and initial setup
2. **Lines 96-870**: Scene setup (geometry, lighting, fog, effects) - ~775 lines
3. **Lines 872-933**: Post-processing setup - ~60 lines
4. **Lines 935-988**: Codex asset integration - ~55 lines
5. **Lines 990-1370**: Systems initialization (avatar, particles, collision, etc.) - ~380 lines
6. **Lines 1372-1485**: Room bounds and keyboard input setup - ~115 lines
7. **Lines 1491-2440**: Animation loop (`animate()` function) - ~950 lines
8. **Lines 2442-2530**: Keyboard event handlers - ~90 lines
9. **Lines 2534-3000**: Audio setup and update functions - ~470 lines
10. **Lines 3002-3111**: SSAO setup - ~110 lines
11. **Lines 3114-3163**: Final initialization and animation start - ~50 lines

---

## Dependencies Analysis

### Variables Used in Animation Loop
These need to be accessible after extraction:
- `spotLight` - audio-reactive lighting
- `ceilingLights` - audio-reactive color updates
- `speakerCones` - animated with bass
- `screenMaterial` - glitch effects
- `holographicRings` - rotation animation
- `wallMaterial` - material updates
- `composer` - post-processing
- `frequencyBands`, `bassEnergy`, `overallEnergy` - audio data
- `avatar`, `camera`, `cameraController` - main game objects
- Various systems (particleSystem, collectibleManager, etc.)

### Global Variables Used Across Functions
- `scene`, `camera`, `renderer` - core Three.js objects
- `keys` - keyboard state
- `avatar` - player avatar
- Audio-related: `audioContext`, `analyser`, `audioData`, etc.
- UI components: `loadingScreen`, `settingsManager`, `devTools`, etc.

---

## Extraction Strategy

### Phase 1: Extract Animation Loop (Safest First)
**Target**: Lines 1491-2440 (~950 lines)

**Create**: `src/core/AnimationLoop.js` (or enhance existing GameLoop)

**Dependencies to Pass**:
- All scene objects (spotLight, ceilingLights, etc.)
- All systems (avatar, particleSystem, etc.)
- Audio data (frequencyBands, bassEnergy, etc.)

**Return/Expose**: None (animation loop just runs)

**Benefits**: 
- Largest single block to extract
- Clear boundaries
- Easier to test independently

---

### Phase 2: Extract Audio Functions
**Target**: Lines 2534-3000 (~470 lines)

**Create**: Enhance `src/core/initializers/AudioInitializer.js`

**Functions to Extract**:
- `initAudio()` → `AudioInitializer.initialize()`
- `updateAudioAnalysis()` → `AudioSystem.updateAnalysis()` (should already exist)
- `updateAudioFadeIn()` → `AudioSystem.updateFadeIn()`
- `updateAudioReactiveLighting()` → Move to AudioSystem or LightingManager
- `updateAudioReactiveFog()` → Move to AudioSystem or FogManager
- `loadAudioFile()` → `AudioSystem.loadFile()`

**Dependencies**: AudioSystem already exists, just needs to be used properly

---

### Phase 3: Extract Event Handlers
**Target**: Lines 1372-1485, 2442-2530 (~205 lines total)

**Create**: `src/core/handlers/InputHandlers.js` or enhance InputManager

**Functions to Extract**:
- Keyboard event listeners (keydown, keyup)
- Mouse event listeners (if any)
- Window event listeners (resize, error)

**Benefits**: Clear separation, easier to test input handling

---

### Phase 4: Extract Scene Setup
**Target**: Lines 96-870 (~775 lines)

**Strategy**: Migrate to use existing SceneInitializer (RoomBuilder + LightingSetup + EnvironmentEffects)

**Note**: SceneInitializer already created, need to:
1. Ensure it returns all needed variables
2. Replace inline code with SceneInitializer call
3. Store returned variables for animation loop use

---

### Phase 5: Extract Post-Processing Setup
**Target**: Lines 872-933, 3002-3111 (~170 lines total)

**Enhance**: `src/effects/PostProcessingManager.js`

**Functions to Extract**:
- `setupPostProcessing()` → Already in PostProcessingManager
- `setupSSAO()` → Move to PostProcessingManager
- `setupLowPassFilter()` → Move to AudioSystem
- `setupReverb()` → Move to AudioSystem

---

### Phase 6: Extract UI Initialization
**Target**: Scattered throughout (SettingsManager, DevTools, HelpSystem, etc.)

**Create**: `src/core/initializers/UIInitializer.js`

**Components to Initialize**:
- SettingsManager
- DevTools
- DebugOverlay
- DevMenu
- HelpSystem
- HelpPanel
- AudioReactiveDebugger
- UIScalingSystem
- CollectionGoalsUI
- AssetAttributionPanel
- ReplayLibraryUI
- VisualRecorderUI
- NotificationSystem

---

## Implementation Order (Recommended)

1. **Phase 1: Animation Loop** - Largest impact, clear boundaries
2. **Phase 2: Audio Functions** - Already partially extracted
3. **Phase 3: Event Handlers** - Isolated, easy to extract
4. **Phase 4: Scene Setup** - Use existing SceneInitializer
5. **Phase 5: Post-Processing** - Enhance existing PostProcessingManager
6. **Phase 6: UI Initialization** - Final cleanup

---

## Variable Access Strategy

After extraction, variables need to be accessible. Options:

### Option A: Return from Initializers
```javascript
const sceneData = SceneInitializer.initialize(scene);
// sceneData.spotLight, sceneData.ceilingLights, etc.
```

### Option B: Store in Systems Object
```javascript
window.gameSystems = {
    scene,
    spotLight,
    ceilingLights,
    // etc.
};
```

### Option C: Pass to Animation Loop
```javascript
animationLoop.start({
    scene,
    spotLight,
    ceilingLights,
    // all dependencies
});
```

**Recommendation**: Option C (explicit dependencies) for clarity and testability

---

## Testing Strategy

After each phase:
1. **Manual Testing**: Verify game still runs and looks correct
2. **Console Check**: Ensure no errors
3. **Feature Testing**: Test key features (movement, audio, visuals)
4. **Performance Check**: Ensure no performance regression

---

## Rollback Plan

- Each phase in separate git commit
- Test after each commit
- Can revert individual phases if issues arise

---

## Next Steps

Begin with Phase 1: Animation Loop extraction as it's the safest and has largest impact.

