# Next 20 Steps - Part 2 (Steps 21-40)
## Movement Refinement, Shader Effects & System Enhancements

This document outlines Steps 21-40, focusing on movement polish, shader effects integration, collection enhancements, and performance optimization.

## Current Status

- ✅ Steps 1-10: UI Systems & Feature Enhancements - Complete
- ✅ Steps 11-20: World Expansion & System Enhancements - Complete
- ✅ DevMenu: Comprehensive testing interface - Complete
- ✅ TunnelRoom & BarRoom: Room designs updated - Complete
- ⏳ Steps 21-40: Movement, Shaders & Enhancements - Pending

## Next 20 Steps (21-40)

### High Priority - Movement & Core Feel (Steps 21-25)

#### Step 21: Movement System Refinement
**Priority**: Critical (User Priority: "Solid Movement")  
**Status**: Pending  
**Goal**: Perfect movement feel through comprehensive testing and tuning

**Tasks**:
- [ ] Create movement testing suite using DevMenu
- [ ] Fine-tune acceleration/deceleration curves
- [ ] Optimize rotation speed and responsiveness
- [ ] Refine hop/jump physics and feel
- [ ] Improve dash mechanic timing and distance
- [ ] Test movement across all room types
- [ ] Add movement state visualization (debug)
- [ ] Create movement presets (snappy, smooth, floaty)

**Files**:
- Modify: `src/core/UpdateManager.js` (movement update logic)
- Modify: `src/avatar/ErrlAvatar.js` (movement parameters)
- Modify: `src/config/constants.js` (MOVEMENT_CONFIG)
- Create: `src/systems/MovementTester.js` (automated movement testing)

---

#### Step 22: Advanced Movement Features
**Priority**: High  
**Status**: Pending  
**Goal**: Add movement polish and advanced mechanics

**Tasks**:
- [ ] Implement momentum preservation (slight carry-over when changing direction)
- [ ] Add movement state blending (smooth transitions)
- [ ] Enhance crouch mechanics (speed reduction, visual feedback)
- [ ] Improve landing physics (bounce coefficient tuning)
- [ ] Add air control (slight movement adjustment while hopping)
- [ ] Create movement trails/effects (optional visual feedback)
- [ ] Add movement sound effects (footsteps, landing, dashing)

**Files**:
- Modify: `src/avatar/ErrlAvatar.js` (add momentum, air control)
- Modify: `src/core/UpdateManager.js` (movement state blending)
- Create/Modify: `src/audio/FootstepSystem.js` (movement sounds)
- Modify: `src/effects/ParticleSystem.js` (movement trail particles)

---

#### Step 23: Shader Effects Integration (Psychedelic Effects)
**Priority**: High  
**Status**: Pending  
**Goal**: Integrate psychedelic shader effects from vault

**Tasks**:
- [ ] Locate and review shader effects in vault
- [ ] Create shader loader system for custom shaders
- [ ] Integrate psychedelic shader effects
- [ ] Add shader effect controls to DevMenu
- [ ] Create shader effect presets
- [ ] Apply shader effects to BarRoom fake view window
- [ ] Add shader effect intensity controls
- [ ] Test shader performance impact

**Files**:
- Create: `src/shaders/ShaderLoader.js` (load custom shaders from vault)
- Create: `src/shaders/PsychedelicShader.js` (or multiple shader files)
- Modify: `src/effects/PostProcessingManager.js` (add shader passes)
- Modify: `src/scene/rooms/BarRoom.js` (apply shader to fake view)
- Modify: `src/dev/DevMenu.js` (add shader effect controls)
- Create: `src/config/ShaderEffectSettings.js` (shader effect configuration)

**Note**: User mentioned shader effects are in their vault - need to locate and integrate them.

---

#### Step 24: Motion Blur Post-Processing Effect
**Priority**: Medium-High  
**Status**: Pending  
**Goal**: Add motion blur for enhanced movement feel

**Tasks**:
- [ ] Create motion blur shader
- [ ] Integrate motion blur into PostProcessingManager
- [ ] Add motion blur intensity control
- [ ] Tie motion blur to movement speed
- [ ] Add motion blur to camera settings
- [ ] Create motion blur presets
- [ ] Optimize motion blur performance

**Files**:
- Create: `src/shaders/MotionBlurShader.js`
- Modify: `src/effects/PostProcessingManager.js` (add motion blur pass)
- Modify: `src/config/CameraSettings.js` (motion blur settings)
- Modify: `src/dev/DevMenu.js` (motion blur controls)

---

#### Step 25: Collection System Enhancements (Streaks & Combos)
**Priority**: High  
**Status**: Pending  
**Goal**: Add collection streaks, combos, and enhanced feedback

**Tasks**:
- [ ] Create collection streak system
- [ ] Implement combo multiplier system
- [ ] Add streak/combo visual feedback
- [ ] Create collection streak achievements
- [ ] Add combo break indicators
- [ ] Implement collection timing windows
- [ ] Add streak/combo sound effects
- [ ] Display streak/combo UI indicators

**Files**:
- Create: `src/systems/CollectionStreakSystem.js`
- Modify: `src/collectibles/CollectibleManager.js` (streak tracking)
- Modify: `src/ui/CollectionProgressUI.js` (streak display)
- Modify: `src/systems/AchievementSystem.js` (streak achievements)
- Modify: `src/effects/ParticleSystem.js` (combo particle effects)

---

### Medium Priority - Room & Environment (Steps 26-30)

#### Step 26: Tunnel Room Enhancement & Polish
**Priority**: Medium  
**Status**: Pending  
**Goal**: Polish the tunnel room with atmospheric effects

**Tasks**:
- [ ] Add tunnel-specific lighting effects
- [ ] Create tunnel atmosphere (fog, particles)
- [ ] Add tunnel-specific interactive objects
- [ ] Implement tunnel audio ambiance
- [ ] Add tunnel visual effects (light streaks, etc.)
- [ ] Create tunnel collectible spawn points
- [ ] Add tunnel transition effects
- [ ] Test tunnel room performance

**Files**:
- Modify: `src/scene/rooms/TunnelRoom.js` (enhance lighting, effects)
- Create: `src/interactions/TunnelObjects.js` (tunnel-specific objects)
- Modify: `src/collectibles/CollectibleManager.js` (tunnel spawn logic)

---

#### Step 27: Bar Room Shader View Integration
**Priority**: Medium  
**Status**: Pending  
**Goal**: Apply psychedelic shader to BarRoom fake view window

**Tasks**:
- [ ] Create shader material for fake view window
- [ ] Apply psychedelic shader effect to window
- [ ] Add shader animation/parameters
- [ ] Create shader effect controls
- [ ] Add shader intensity adjustment
- [ ] Test shader performance
- [ ] Add shader preset options

**Files**:
- Modify: `src/scene/rooms/BarRoom.js` (apply shader to fakeWindow)
- Modify: `src/shaders/ShaderLoader.js` (load window shader)
- Create: `src/shaders/WindowViewShader.js` (or use psychedelic shader)

---

#### Step 28: Room Transition Enhancements
**Priority**: Medium  
**Status**: Pending  
**Goal**: Improve room transitions with better visuals and audio

**Tasks**:
- [ ] Enhance room transition animations
- [ ] Add transition sound effects
- [ ] Create transition loading screens
- [ ] Add transition progress indicators
- [ ] Implement smooth camera transitions
- [ ] Add transition particle effects
- [ ] Create transition presets (fade, slide, etc.)

**Files**:
- Modify: `src/scene/RoomTransition.js` (enhance transitions)
- Modify: `src/scene/RoomManager.js` (transition integration)
- Create: `src/ui/RoomTransitionUI.js` (loading screen)

---

#### Step 29: Interactive Object Discovery System
**Priority**: Medium  
**Status**: Pending  
**Goal**: Track and reward discovery of interactive objects

**Tasks**:
- [ ] Enhance object discovery tracking system (already exists)
- [ ] Add discovery notifications
- [ ] Create discovery achievements
- [ ] Add discovery map/minimap
- [ ] Implement discovery statistics
- [ ] Add discovery hints/guidance
- [ ] Create discovery rewards

**Files**:
- Modify: `src/systems/InteractiveObjectDiscovery.js` (enhance existing)
- Modify: `src/systems/InteractionSystem.js` (discovery integration)
- Create: `src/ui/DiscoveryMap.js` (discovery visualization)
- Modify: `src/systems/AchievementSystem.js` (discovery achievements)

---

#### Step 30: Room-Specific Interactive Objects
**Priority**: Medium  
**Status**: Pending  
**Goal**: Add unique interactive objects to each room type

**Tasks**:
- [ ] Design tunnel-specific objects
- [ ] Design bar-specific objects (drink dispenser, etc.)
- [ ] Design visualizer-specific objects
- [ ] Design chill room-specific objects
- [ ] Implement object interactions
- [ ] Add object discovery tracking
- [ ] Create object interaction effects

**Files**:
- Modify: `src/interactions/RoomSpecificObjects.js` (add more objects)
- Modify: `src/scene/rooms/TunnelRoom.js` (add tunnel objects)
- Modify: `src/scene/rooms/BarRoom.js` (add bar objects)
- Modify: `src/scene/rooms/VisualizerRoom.js` (add visualizer objects)
- Modify: `src/scene/rooms/ChillRoom.js` (add chill objects)

---

### Infrastructure & Performance (Steps 31-35)

#### Step 31: LOD (Level of Detail) System
**Priority**: Medium  
**Status**: Pending  
**Goal**: Implement LOD for performance optimization

**Tasks**:
- [ ] Create LOD system architecture
- [ ] Implement distance-based LOD
- [ ] Add performance-based LOD
- [ ] Create LOD settings/controls
- [ ] Add LOD transition smoothing
- [ ] Test LOD performance impact
- [ ] Add LOD to DevMenu

**Files**:
- Create: `src/systems/LODSystem.js`
- Modify: `src/core/UpdateManager.js` (LOD updates)
- Modify: `src/config/GraphicsSettings.js` (LOD settings)
- Modify: `src/dev/DevMenu.js` (LOD controls)

---

#### Step 32: Performance Optimizer with Auto-Adjustment
**Priority**: Medium  
**Status**: Pending  
**Goal**: Automatic performance optimization based on FPS

**Tasks**:
- [ ] Create performance optimizer system
- [ ] Implement FPS monitoring and averaging
- [ ] Add automatic quality adjustment
- [ ] Create performance presets
- [ ] Add performance recommendations
- [ ] Implement quality scaling
- [ ] Add performance warnings
- [ ] Create performance UI

**Files**:
- Create: `src/systems/PerformanceOptimizer.js`
- Modify: `src/dev/DevTools.js` (performance integration)
- Modify: `src/config/GraphicsSettings.js` (auto-adjustment)
- Create: `src/ui/PerformanceUI.js` (performance display)

---

#### Step 33: Rendering Pipeline Optimization
**Priority**: Medium  
**Status**: Pending  
**Goal**: Optimize rendering through culling and batching

**Tasks**:
- [ ] Implement frustum culling optimization
- [ ] Add occlusion culling (if feasible)
- [ ] Create geometry batching system
- [ ] Optimize draw calls
- [ ] Add render statistics tracking
- [ ] Create performance profiling
- [ ] Add render optimization settings

**Files**:
- Create: `src/systems/RenderOptimizer.js`
- Modify: `src/core/GameLoop.js` (render optimization)
- Modify: `src/dev/DevTools.js` (render stats)

---

#### Step 34: Memory Management & Cleanup
**Priority**: Medium  
**Status**: Pending  
**Goal**: Improve memory management and prevent leaks

**Tasks**:
- [ ] Audit memory usage patterns
- [ ] Implement proper asset disposal
- [ ] Add memory leak detection
- [ ] Create memory cleanup system
- [ ] Add memory usage monitoring
- [ ] Implement memory warnings
- [ ] Create memory optimization tools

**Files**:
- Create: `src/systems/MemoryManager.js`
- Modify: `src/assets/AssetCache.js` (memory management)
- Modify: `src/scene/RoomManager.js` (room cleanup)
- Modify: `src/dev/DevTools.js` (memory monitoring)

---

#### Step 35: Visual Recorder Export (PNG/JPEG Sequences)
**Priority**: Medium  
**Status**: Pending  
**Goal**: Export visual recordings as image sequences

**Tasks**:
- [ ] Implement PNG sequence export
- [ ] Implement JPEG sequence export
- [ ] Add export quality settings
- [ ] Create export progress UI
- [ ] Add export metadata
- [ ] Implement batch export
- [ ] Add export file naming options

**Files**:
- Modify: `src/systems/VisualRecorder.js` (export functionality)
- Modify: `src/ui/VisualRecorderUI.js` (export UI)
- Create: `src/utils/ImageExporter.js` (export utilities)

---

### Enhanced Features (Steps 36-40)

#### Step 36: Replay Library Management System
**Priority**: Low-Medium  
**Status**: Pending  
**Goal**: Manage and organize replay recordings

**Tasks**:
- [ ] Create replay library system
- [ ] Add replay metadata storage
- [ ] Implement replay search/filter
- [ ] Create replay preview system
- [ ] Add replay rename/delete
- [ ] Implement replay sharing (future)
- [ ] Create replay library UI

**Files**:
- Create: `src/systems/ReplayLibrary.js`
- Modify: `src/systems/ReplaySystem.js` (library integration)
- Create: `src/ui/ReplayLibraryUI.js`

---

#### Step 37: Session Management & Statistics
**Priority**: Low-Medium  
**Status**: Pending  
**Goal**: Track and display session statistics

**Tasks**:
- [ ] Create session manager system
- [ ] Track session duration
- [ ] Record session statistics
- [ ] Create session goals
- [ ] Add session history
- [ ] Create session summary UI
- [ ] Implement session export

**Files**:
- Create: `src/systems/SessionManager.js`
- Create: `src/ui/SessionUI.js`
- Modify: `src/config/SettingsManager.js` (session persistence)

---

#### Step 38: Unified Progress Tracking System
**Priority**: Medium  
**Status**: Pending  
**Goal**: Centralized progress tracking across all systems

**Tasks**:
- [ ] Create unified progress tracker
- [ ] Integrate collection progress
- [ ] Integrate achievement progress
- [ ] Integrate fragment progress
- [ ] Integrate vibe meter progress
- [ ] Create progress dashboard
- [ ] Add progress goals system

**Files**:
- Create: `src/systems/ProgressTracker.js`
- Modify: `src/systems/CollectionTracker.js` (integration)
- Modify: `src/systems/AchievementSystem.js` (integration)
- Create: `src/ui/ProgressDashboard.js`

---

#### Step 39: Camera Preset Management (Save/Load)
**Priority**: Low-Medium  
**Status**: Pending  
**Goal**: Save and load custom camera presets

**Tasks**:
- [ ] Add camera preset save functionality
- [ ] Add camera preset load functionality
- [ ] Create camera preset library
- [ ] Add preset rename/delete
- [ ] Implement preset sharing (future)
- [ ] Create preset management UI

**Files**:
- Modify: `src/camera/CameraController.js` (preset save/load)
- Modify: `src/ui/CameraSettingsUI.js` (preset management)
- Modify: `src/config/SettingsManager.js` (preset persistence)

---

#### Step 40: Comprehensive Controls Reference UI
**Priority**: Low-Medium  
**Status**: Pending  
**Goal**: In-game comprehensive controls reference

**Tasks**:
- [ ] Create controls reference UI
- [ ] Display all keybinds
- [ ] Add controls search
- [ ] Organize controls by category
- [ ] Add controls customization hints
- [ ] Create controls help overlay
- [ ] Add context-sensitive controls

**Files**:
- Create: `src/ui/ControlsReferenceUI.js`
- Modify: `src/core/initializers/SetupInitializer.js` (controls data)
- Modify: `src/ui/HelpPanel.js` (controls integration)

---

## Implementation Order

### Phase 1: Movement & Core Feel (Steps 21-25)
Focus on perfecting movement feel and integrating shader effects:
1. Movement System Refinement (CRITICAL - User Priority)
2. Advanced Movement Features
3. Shader Effects Integration
4. Motion Blur Post-Processing
5. Collection System Enhancements

### Phase 2: Room & Environment (Steps 26-30)
Enhance rooms and interactive systems:
6. Tunnel Room Enhancement
7. Bar Room Shader View
8. Room Transition Enhancements
9. Interactive Object Discovery
10. Room-Specific Interactive Objects

### Phase 3: Infrastructure & Performance (Steps 31-35)
Optimize performance and add export features:
11. LOD System
12. Performance Optimizer
13. Rendering Pipeline Optimization
14. Memory Management
15. Visual Recorder Export

### Phase 4: Enhanced Features (Steps 36-40)
Add polish and management systems:
16. Replay Library Management
17. Session Management
18. Unified Progress Tracking
19. Camera Preset Management
20. Controls Reference UI

## Success Criteria

After completing Steps 21-40:
- ✅ Movement feels solid and responsive (user priority)
- ✅ Psychedelic shader effects integrated and controllable
- ✅ Collection system has streaks, combos, and enhanced feedback
- ✅ All rooms are polished with unique interactive objects
- ✅ Performance optimized with LOD and auto-adjustment
- ✅ Visual recorder can export image sequences
- ✅ Comprehensive progress tracking across all systems
- ✅ Better room transitions and discovery systems

## Notes

- **Step 21 (Movement Refinement)** is the highest priority - user explicitly stated "solid movement" is most important
- **Step 23 (Shader Effects)** requires locating shader files in user's vault
- Steps can be worked on in parallel where dependencies allow
- Testing should be done after each major step, especially movement-related
- DevMenu should be used extensively for testing Steps 21-24
- Consider user feedback when prioritizing within each phase

## Dependencies

- Steps 21-22: Movement refinement (can work in parallel)
- Step 23: Requires shader files from vault (blocking)
- Step 24: Can work in parallel with Step 23
- Steps 26-27: Room enhancements (can work in parallel)
- Steps 31-34: Performance optimization (can work in parallel)
- Steps 36-40: Enhanced features (can work in parallel)

## Testing Priorities

1. **Movement Testing** (Steps 21-22): Use DevMenu extensively, test all parameters
2. **Shader Testing** (Step 23): Test performance impact, visual quality
3. **Collection Testing** (Step 25): Test streaks, combos, timing windows
4. **Performance Testing** (Steps 31-34): Monitor FPS, memory, draw calls
5. **Export Testing** (Step 35): Test export quality, file sizes, performance

