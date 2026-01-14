# Next 20 Steps - Development Roadmap

This document outlines the next 20 prioritized development steps for the Errl Club Simulator project.

## Current Status

- ✅ Chapter 6: Audio & Visual Systems - Complete
- ✅ Phase A: Refactoring (Phases 3-7) - Complete
- ✅ Phase B: Foundation Modules (StateManager, EventBus, Avatar Serialization) - Complete
- ✅ Phase C: Multiplayer Infrastructure (Network layer, Player Management, Network Integration) - Complete
- ✅ Chapter 9: UX, UI & Polish - Complete (Steps 1-20 Complete - December 10, 2025)
- ⏳ Chapter 8: World Expansion - Pending

## Next 20 Steps

### High Priority - User-Facing Features (Steps 1-8)

#### Step 1: Camera Settings UI
**Priority**: High  
**Status**: ✅ **COMPLETED**  
**Goal**: Create UI for camera intensity controls and settings

**Tasks**:
- [x] Create `src/ui/CameraSettingsUI.js`
- [x] Add camera intensity quick toggle (keybind)
- [x] Display current camera intensity
- [x] Add camera preset selector
- [x] Integrate with existing CameraSettings

**Files**:
- ✅ Created: `src/ui/CameraSettingsUI.js`
- ✅ Modified: `src/core/initializers/SetupInitializer.js` (keybind added)
- ✅ Modified: `src/ui/UIManager.js` (UI integrated)

---

#### Step 2: Collection Progress Tracking UI
**Priority**: High  
**Status**: ✅ **COMPLETED**  
**Goal**: Display collection statistics and progress

**Tasks**:
- [x] Verify CollectionTracker exists and is working
- [x] Create `src/ui/CollectionProgressUI.js`
- [x] Display total drips, bubbles, fragments, glow balls collected
- [x] Show collection percentages
- [x] Add collection statistics display
- [x] Make UI minimizable/persistent

**Files**:
- ✅ Created: `src/ui/CollectionProgressUI.js`
- ✅ Modified: `src/ui/UIManager.js` (UI integrated)
- ✅ Modified: `index.html` (UI container added)

---

#### Step 3: Quick Settings Menu
**Priority**: High  
**Status**: ✅ **COMPLETED**  
**Goal**: Quick access to common settings

**Tasks**:
- [x] Create `src/ui/QuickSettingsMenu.js`
- [x] Add quick camera intensity toggle
- [x] Add quick visual effect toggles (UV mode, glitch, etc.)
- [x] Add quick audio volume slider
- [x] Add keybind to open/close menu
- [x] Add settings presets

**Files**:
- ✅ Created: `src/ui/QuickSettingsMenu.js`
- ✅ Modified: `src/core/initializers/SetupInitializer.js` (keybind added)
- ✅ Modified: `src/ui/UIManager.js` (menu integrated)

---

#### Step 4: First-Time Player Tutorial System
**Priority**: High  
**Status**: ✅ **COMPLETED**  
**Goal**: Onboarding for new players

**Tasks**:
- [x] Create `src/ui/TutorialSystem.js`
- [x] Create `src/ui/TutorialOverlay.js`
- [x] Create `src/config/tutorials.js` (tutorial definitions)
- [x] Design tutorial flow: movement, camera, interactions, collection
- [x] Add tutorial completion tracking
- [x] Add skip tutorial option

**Files**:
- ✅ Created: `src/ui/TutorialSystem.js`
- ✅ Created: `src/ui/TutorialOverlay.js`
- ✅ Created: `src/config/tutorials.js`
- ✅ Modified: `src/core/GameInitializer.js` (tutorial initialized)
- ✅ Modified: `src/config/SettingsManager.js` (tutorial persistence)

---

#### Step 5: Visual Preferences Persistence Enhancement
**Priority**: High  
**Status**: ✅ **COMPLETED**  
**Goal**: Ensure all visual preferences persist correctly

**Tasks**:
- [x] Verify VisualPreferences is fully integrated
- [x] Test persistence of UV mode, visualizer style, glitch mode
- [x] Add visual preset system (save/load presets)
- [x] Add export/import preferences
- [x] Test loading preferences on game start

**Files**:
- ✅ Modified: `src/config/VisualPreferences.js` (presets added)
- ✅ Modified: `src/config/SettingsManager.js` (persistence enhanced)
- ✅ Tested: All visual preference systems

---

#### Step 6: Interaction Prompt Enhancements
**Priority**: Medium-High  
**Status**: ✅ **COMPLETED**  
**Goal**: Better visual feedback for interactions

**Tasks**:
- [x] Create `src/ui/InteractionPrompt.js`
- [x] Create `src/ui/InteractionFeedback.js`
- [x] Enhance interaction prompts (clearer visuals, animations)
- [x] Add interaction success/failure feedback
- [x] Add interaction cooldown indicators
- [x] Add interaction range indicators

**Files**:
- ✅ Created: `src/ui/InteractionPrompt.js`
- ✅ Created: `src/ui/InteractionFeedback.js`
- ✅ Modified: `src/systems/InteractionSystem.js` (feedback integrated)

---

#### Step 7: Audio Settings UI Completion
**Priority**: Medium-High  
**Status**: ✅ **COMPLETED**  
**Goal**: Complete audio settings interface

**Tasks**:
- [x] Complete audio settings UI in SettingsScreen
- [x] Add master volume slider
- [x] Add music volume slider
- [x] Add effect volume slider
- [x] Add audio quality settings
- [x] Test audio settings persistence

**Files**:
- ✅ Created: `src/ui/AudioSettingsUI.js` (standalone audio settings UI)
- ✅ Modified: `src/config/AudioSettings.js` (implementation complete)
- ✅ Modified: `src/config/SettingsManager.js` (audio persistence added)

---

#### Step 8: Collection Statistics System
**Priority**: Medium  
**Status**: ✅ **COMPLETED**  
**Goal**: Detailed collection analytics

**Tasks**:
- [x] Create `src/systems/CollectionStatistics.js`
- [x] Create `src/ui/CollectionStatisticsUI.js` (integrated into CollectionProgressUI)
- [x] Track collection rate (per minute/hour)
- [x] Track rarest collectible found
- [x] Track collection streaks
- [x] Add statistics dashboard

**Files**:
- ✅ Created: `src/systems/CollectionStatistics.js`
- ✅ Modified: `src/ui/CollectionProgressUI.js` (statistics integrated)
- ✅ Modified: `src/systems/CollectionTracker.js` (statistics tracking added)

---

### Medium Priority - Enhanced Systems (Steps 9-14)

#### Step 9: Errl Fragment Progression System
**Priority**: Medium  
**Status**: ✅ **COMPLETED**  
**Goal**: Fragment-based unlocks and progression

**Tasks**:
- [x] Create `src/systems/FragmentProgressionSystem.js`
- [x] Create `src/ui/FragmentProgressUI.js` (integrated into ControlDock)
- [x] Define fragment milestones
- [x] Define unlockable features (colors, effects, areas)
- [x] Add fragment collection notifications
- [x] Add progress bar to next milestone

**Files**:
- ✅ Created: `src/systems/FragmentProgressionSystem.js`
- ✅ Modified: `src/ui/ControlDock.js` (fragment progress integrated)
- ✅ Modified: `src/collectibles/CollectibleManager.js` (fragment tracking added)
- ✅ Modified: `src/avatar/ErrlAvatar.js` (unlockable colors supported)

---

#### Step 10: Achievement System
**Priority**: Medium  
**Status**: ✅ **COMPLETED**  
**Goal**: Achievement tracking and rewards

**Tasks**:
- [x] Create `src/systems/AchievementSystem.js`
- [x] Create `src/ui/AchievementUI.js` (integrated into NotificationSystem)
- [x] Create `src/config/achievements.js` (achievement definitions in AchievementSystem)
- [x] Define achievement categories (collection, exploration, movement, etc.)
- [x] Add achievement notifications
- [x] Add achievement progress tracking

**Files**:
- ✅ Created: `src/systems/AchievementSystem.js`
- ✅ Modified: `src/ui/NotificationSystem.js` (achievement notifications integrated)
- ✅ Modified: `src/config/SettingsManager.js` (achievement persistence added)

---

#### Step 11: Vibe Meter Enhancements
**Priority**: Medium  
**Status**: ✅ **COMPLETED**  
**Goal**: Enhanced vibe meter features

**Tasks**:
- [x] Enhance vibe meter effects (high level effects)
- [x] Add vibe level milestones (25%, 50%, 75%, 100%)
- [x] Add vibe level rewards (unlockable features)
- [x] Add vibe meter history (last 1000 samples)
- [x] Add vibe meter statistics (peak, average, time at high vibe)
- [x] Add milestone celebrations

**Files**:
- ✅ Modified: `src/ui/VibeMeter.js` (all enhancements complete)

---

#### Step 12: Visual Effect Intensity Controls
**Priority**: Medium  
**Status**: ✅ **COMPLETED**  
**Goal**: Fine-tune visual effect intensity

**Tasks**:
- [x] Create `src/config/VisualEffectSettings.js`
- [x] Add UV mode intensity slider
- [x] Add glitch intensity slider
- [x] Add visual distortion intensity controls
- [x] Add chromatic aberration intensity controls
- [x] Create visual effect presets (off, subtle, normal, intense, extreme)
- [x] Add visual effect preview (real-time)
- [x] Create `src/ui/VisualEffectSettingsUI.js`

**Files**:
- ✅ Created: `src/config/VisualEffectSettings.js`
- ✅ Created: `src/ui/VisualEffectSettingsUI.js`
- ✅ Modified: `src/effects/VisualEffects.js` (intensity controls integrated)

---

#### Step 13: Help System Integration
**Priority**: Medium  
**Status**: ✅ **COMPLETED**  
**Goal**: In-game help and documentation

**Tasks**:
- [x] Create `src/ui/HelpSystem.js`
- [x] Create `src/ui/HelpPanel.js`
- [x] Integrate workflows documentation
- [x] Add context-sensitive help (movement, camera, interactions, collection, audio, visual effects, settings)
- [x] Add help search functionality
- [x] Add help keybind (F1 or ?)
- [x] Add keyboard navigation

**Files**:
- ✅ Created: `src/ui/HelpSystem.js`
- ✅ Created: `src/ui/HelpPanel.js`
- ✅ Modified: `src/main.js` (help keybind and navigation)

---

#### Step 14: UI Scaling System
**Priority**: Medium  
**Status**: ✅ **COMPLETED**  
**Goal**: Accessibility - UI scaling options

**Tasks**:
- [x] Create `src/ui/UIScalingSystem.js`
- [x] Add scale factor setting (0.75x to 2x)
- [x] Add scaling presets (small, medium, large, extra large, huge)
- [x] Add per-element scaling registration
- [x] Add auto-registration for common UI elements
- [x] Add scaling persistence (SettingsManager/localStorage)

**Files**:
- ✅ Created: `src/ui/UIScalingSystem.js`
- ✅ Modified: `src/main.js` (initialization and auto-registration)

---

### Infrastructure & Polish (Steps 15-20)

#### Step 15: Performance Monitoring UI Enhancement
**Priority**: Medium  
**Status**: ✅ **COMPLETED**  
**Goal**: Better performance visibility

**Tasks**:
- [x] Enhance DevTools performance display
- [x] Add automatic performance adjustment (PerformanceOptimizer)
- [x] Add performance optimizer UI controls (DevMenu)
- [x] Add target FPS and minimum FPS configuration
- [x] Add adjustment level tracking
- [x] Create `src/systems/PerformanceOptimizer.js`
- [x] Add asset-specific performance metrics to DevTools
- [x] Fix DevTools syntax errors

**Files**:
- ✅ Created: `src/systems/PerformanceOptimizer.js`
- ✅ Modified: `src/dev/DevMenu.js` (Performance Optimizer controls)
- ✅ Modified: `src/config/GraphicsSettings.js` (LOD settings)
- ✅ Modified: `src/dev/DevTools.js` (Asset metrics, syntax fixes)

---

#### Step 16: Replay Recording Indicator
**Priority**: Low-Medium  
**Status**: Pending  
**Goal**: Visual feedback for replay recording

**Tasks**:
- Create `src/ui/ReplayRecordingIndicator.js`
- Add visual recording indicator
- Add recording time display
- Add frame count display
- Add recording status

**Files**:
- Create: `src/ui/ReplayRecordingIndicator.js`
- Modify: `src/systems/ReplaySystem.js` (integrate indicator)
- Modify: `src/ui/UIManager.js` (add indicator)

---

#### Step 17: Visual Recorder UI
**Priority**: Low-Medium  
**Status**: ✅ **COMPLETED**  
**Goal**: Better visual recorder interface

**Tasks**:
- [x] Create `src/ui/VisualRecorderUI.js`
- [x] Add recording indicator UI
- [x] Add recorder controls UI (start/stop/pause)
- [x] Add recording management (view, delete, export)
- [x] Add recording metadata display
- [x] Create `src/systems/VisualRecorderExporter.js` (PNG/JPEG export)
- [x] Integrate exporter with VisualRecorderUI

**Files**:
- ✅ Created: `src/ui/VisualRecorderUI.js`
- ✅ Created: `src/systems/VisualRecorderExporter.js`
- ✅ Modified: `src/ui/VisualRecorderUI.js` (exporter integration)

---

#### Step 18: Room Management System (Phase D1)
**Priority**: Medium (for Chapter 8)  
**Status**: Pending  
**Goal**: Multi-room architecture foundation

**Tasks**:
- Create `src/scene/RoomDefinition.js`
- Create `src/scene/RoomManager.js`
- Create `src/scene/RoomTransition.js`
- Define room config schema
- Add room validation
- Support room loading/unloading

**Files**:
- Create: `src/scene/RoomDefinition.js`
- Create: `src/scene/RoomManager.js`
- Create: `src/scene/RoomTransition.js`
- Modify: `src/scene/RoomBuilder.js` (support room variants)

---

#### Step 19: Base Room System (Phase D2)
**Priority**: Medium (for Chapter 8)  
**Status**: Pending  
**Goal**: Room class hierarchy

**Tasks**:
- Create `src/scene/rooms/BaseRoom.js`
- Create `src/scene/rooms/MainClubRoom.js`
- Migrate existing room to new system
- Add common room functionality
- Add lifecycle methods
- Test room system

**Files**:
- Create: `src/scene/rooms/BaseRoom.js`
- Create: `src/scene/rooms/MainClubRoom.js`
- Modify: `src/scene/RoomBuilder.js` (refactor to use BaseRoom)

---

#### Step 20: Asset Management System (Phase D3)
**Priority**: Medium (for Chapter 8)  
**Status**: Pending  
**Goal**: Centralized asset loading and caching

**Tasks**:
- Create `src/assets/AssetLoader.js`
- Create `src/assets/AssetCache.js`
- Verify `src/assets/TextureManager.js` exists
- Add centralized asset loading
- Add asset caching
- Add memory management
- Integrate with room system

**Files**:
- Create: `src/assets/AssetLoader.js`
- Create: `src/assets/AssetCache.js`
- Verify: `src/assets/TextureManager.js`
- Modify: `src/scene/RoomManager.js` (use AssetLoader)

---

## Implementation Order

### Phase 1: High Priority UI (Steps 1-8)
Focus on user-facing features that improve experience immediately:
1. Camera Settings UI
2. Collection Progress UI
3. Quick Settings Menu
4. Tutorial System
5. Visual Preferences Enhancement
6. Interaction Prompts
7. Audio Settings UI
8. Collection Statistics

### Phase 2: Enhanced Systems (Steps 9-14)
Add depth and progression to the game:
9. Fragment Progression
10. Achievement System
11. Vibe Meter Enhancements
12. Visual Effect Controls
13. Help System
14. UI Scaling

### Phase 3: Infrastructure & Polish (Steps 15-20)
Prepare for expansion and improve quality:
15. Performance Monitoring
16. Replay Indicator
17. Visual Recorder UI
18. Room Management
19. Base Room System
20. Asset Management

## Success Criteria

After completing these 20 steps:
- ✅ All high-priority user-facing features implemented
- ✅ Enhanced progression and achievement systems
- ✅ Better accessibility and help systems
- ✅ Foundation for multi-room architecture
- ✅ Improved performance monitoring
- ✅ Better asset management

## Additional Completed Systems (December 10, 2025)

### Path 9: LOD System
**Status**: ✅ **COMPLETED**  
**Goal**: Performance optimization with Level of Detail

**Tasks**:
- [x] Create `src/systems/LODSystem.js`
- [x] Implement distance-based LOD switching (high/medium/low)
- [x] Create proxy meshes for far-away assets
- [x] Integrate with CodexAssetIntegration
- [x] Add LOD settings to GraphicsSettings
- [x] Fix initialization order (LOD before assets)

**Files**:
- ✅ Created: `src/systems/LODSystem.js`
- ✅ Modified: `src/scene/CodexAssetIntegration.js` (LOD registration)
- ✅ Modified: `src/config/GraphicsSettings.js` (LOD management)
- ✅ Modified: `src/main.js` (initialization order fix)

---

### Path 10: Asset Tagging & Attribution System
**Status**: ✅ **COMPLETED**  
**Goal**: Asset attribution and credits

**Tasks**:
- [x] Create `src/ui/AssetAttributionPanel.js`
- [x] Display attribution for all Codex assets
- [x] Show source, license, and metadata
- [x] Add keybind (Ctrl+Shift+A)

**Files**:
- ✅ Created: `src/ui/AssetAttributionPanel.js`
- ✅ Modified: `src/main.js` (initialization and keybind)

---

### Path 13: Motion Blur Implementation
**Status**: ✅ **COMPLETED**  
**Goal**: Motion blur effect with camera integration

**Tasks**:
- [x] Create `src/shaders/MotionBlurShader.js`
- [x] Add motion blur pass to PostProcessingManager
- [x] Add enable/disable controls
- [x] Tie motion blur intensity to camera intensity
- [x] Wire to CameraSettings

**Files**:
- ✅ Created: `src/shaders/MotionBlurShader.js`
- ✅ Modified: `src/effects/PostProcessingManager.js` (motion blur controls)
- ✅ Modified: `src/main.js` (camera settings integration)

---

### Path 19: Collection Goals System
**Status**: ✅ **COMPLETED**  
**Goal**: Collection goals and progress tracking

**Tasks**:
- [x] Create `src/ui/CollectionGoalsUI.js`
- [x] Initialize CollectionTracker system
- [x] Wire CollectionTracker to CollectibleManager
- [x] Add daily, session, and total goals
- [x] Add progress tracking and notifications
- [x] Add keybind (Ctrl+G)

**Files**:
- ✅ Created: `src/ui/CollectionGoalsUI.js`
- ✅ Modified: `src/main.js` (CollectionTracker initialization, wiring)
- ✅ Modified: `src/collectibles/CollectibleManager.js` (CollectionTracker integration)

---

### Path 23: Performance Monitoring UI Enhancement
**Status**: ✅ **COMPLETED**  
**Goal**: Automatic performance adjustment

**Tasks**:
- [x] Create `src/systems/PerformanceOptimizer.js`
- [x] Add automatic quality adjustment based on FPS
- [x] Add UI controls in DevMenu
- [x] Add target FPS and minimum FPS configuration
- [x] Integrate with GraphicsSettings

**Files**:
- ✅ Created: `src/systems/PerformanceOptimizer.js`
- ✅ Modified: `src/dev/DevMenu.js` (Performance Optimizer controls)
- ✅ Modified: `src/main.js` (initialization and updates)

---

### Path 24: Replay System Enhancements
**Status**: ✅ **COMPLETED**  
**Goal**: Replay library management

**Tasks**:
- [x] Create `src/systems/ReplayLibrary.js`
- [x] Create `src/ui/ReplayLibraryUI.js`
- [x] Add save/load/rename/delete replays
- [x] Add persistence to localStorage
- [x] Add keybind (Ctrl+L)

**Files**:
- ✅ Created: `src/systems/ReplayLibrary.js`
- ✅ Created: `src/ui/ReplayLibraryUI.js`
- ✅ Modified: `src/main.js` (initialization and keybind)

---

### Path 25: Visual Recorder UI & Export
**Status**: ✅ **COMPLETED**  
**Goal**: Visual recorder export functionality

**Tasks**:
- [x] Create `src/systems/VisualRecorderExporter.js`
- [x] Add PNG sequence export
- [x] Add JPEG sequence export
- [x] Integrate with VisualRecorderUI
- [x] Add export buttons and progress tracking

**Files**:
- ✅ Created: `src/systems/VisualRecorderExporter.js`
- ✅ Modified: `src/ui/VisualRecorderUI.js` (exporter integration)
- ✅ Modified: `src/main.js` (exporter wiring)

---

## Notes

- Steps can be worked on in parallel where dependencies allow
- Some steps may need to be broken into smaller tasks
- Testing should be done after each major step
- Documentation should be updated as features are added
- Consider user feedback when prioritizing steps

