# Large File Refactoring Plan

**Last Updated**: December 10, 2025  
**Purpose**: Systematic plan to refactor files over 1000 lines into smaller, more maintainable modules

---

## Overview

This document outlines a comprehensive strategy for refactoring large files (>1000 lines) in the Errl Club Simulator codebase. The goal is to improve maintainability, testability, and code organization while maintaining backward compatibility.

---

## Files Requiring Refactoring

### Priority 1: Critical (3000+ lines)
1. **`src/main.js`** - 3,163 lines
   - **Status**: High priority - still contains too much inline code
   - **Complexity**: Very High
   - **Risk**: Medium (core entry point)

### Priority 2: High (2000+ lines)
2. **`src/ui/ErrlPhone.js`** - 2,385 lines
   - **Status**: Medium-High priority
   - **Complexity**: High (UI component with multiple tabs)
   - **Risk**: Low (isolated UI component)

3. **`src/dev/DevMenu.js`** - 2,271 lines
   - **Status**: Medium priority (dev tool)
   - **Complexity**: High (many configuration sections)
   - **Risk**: Low (dev-only, not in production builds)

### Priority 3: Medium (1000-1500 lines)
4. **`src/core/initializers/SetupInitializer.js`** - 1,294 lines
   - **Status**: Medium priority
   - **Complexity**: Medium-High (setup utilities)
   - **Risk**: Medium (initialization code)

5. **`src/core/UpdateManager.js`** - 1,261 lines
   - **Status**: Medium-High priority (core game loop)
   - **Complexity**: Medium-High
   - **Risk**: Medium (affects all systems)

6. **`src/core/GameInitializer.js`** - 1,178 lines
   - **Status**: Medium priority
   - **Complexity**: Medium-High
   - **Risk**: Medium (initialization flow)

7. **`src/dev/DevTools.js`** - 1,061 lines
   - **Status**: Low-Medium priority (dev tool)
   - **Complexity**: Medium
   - **Risk**: Low (dev-only)

8. **`src/effects/PostProcessingManager.js`** - 1,032 lines
   - **Status**: Medium priority
   - **Complexity**: Medium
   - **Risk**: Low (isolated system)

9. **`src/avatar/ErrlAvatar.js`** - 1,010 lines
   - **Status**: Medium priority
   - **Complexity**: Medium
   - **Risk**: Medium (core avatar system)

---

## Refactoring Strategy

### General Principles

1. **Extract by Responsibility**: Group related functionality into separate modules
2. **Maintain Interfaces**: Keep public APIs unchanged to ensure backward compatibility
3. **Incremental Approach**: Refactor one file at a time, test after each change
4. **Documentation**: Update documentation as files are refactored
5. **Testing**: Ensure all functionality works after refactoring

### Refactoring Patterns

#### Pattern 1: Component Extraction (UI Files)
- Extract each tab/section into its own component class
- Keep main class as a coordinator
- Example: `ErrlPhone.js` → `ErrlPhone.js` + `MenuTab.js`, `MapTab.js`, `AvatarTab.js`, etc.

#### Pattern 2: Method Group Extraction (Utility Files)
- Group related methods into utility classes
- Keep main class thin, delegate to utilities
- Example: `SetupInitializer.js` → Extract keybind registration, resize handlers, etc.

#### Pattern 3: Feature Module Extraction (Manager Files)
- Extract features into separate modules
- Main class becomes a coordinator
- Example: `UpdateManager.js` → Extract update methods by system type

#### Pattern 4: Configuration Extraction
- Move large configuration objects to separate files
- Example: DevMenu presets → `config/DevMenuPresets.js`

---

## Detailed Refactoring Plans

## 1. `src/main.js` (3,163 lines) - PRIORITY 1

### Current Structure Analysis
- Contains: Scene setup, asset loading, animation loop, event handlers, UI initialization, audio setup, post-processing setup
- Main issues: Too much inline code, mixed concerns, hard to navigate

### Refactoring Plan

#### Phase 1.1: Extract Scene Setup
**Target**: Lines 96-800 (scene geometry, lighting, fog, effects)
- **Create**: `src/scene/SceneBuilder.js`
- **Extract**: All scene geometry creation (floor, walls, ceiling, stage, DJ booth, decorative elements)
- **Result**: `main.js` imports SceneBuilder, calls `sceneBuilder.build()`

#### Phase 1.2: Extract Animation Loop
**Target**: Lines 1486-2000 (animate function and all update calls)
- **Already Extracted**: UpdateManager exists, but animate() function still in main.js
- **Create**: `src/core/AnimationLoop.js` (if doesn't exist) or enhance GameLoop
- **Extract**: Move entire `animate()` function
- **Result**: `main.js` just calls `animationLoop.start()`

#### Phase 1.3: Extract Event Handlers
**Target**: Lines 2300-2500 (keyboard/mouse event listeners)
- **Create**: `src/core/EventHandlers.js` or enhance `InputManager`
- **Extract**: All document.addEventListener() blocks
- **Result**: Event handlers registered via `EventHandlers.setup()`

#### Phase 1.4: Extract Audio Setup
**Target**: Lines 2524-2900 (audio initialization and update functions)
- **Create**: `src/core/initializers/AudioInitializer.js` (partially exists)
- **Extract**: `initAudio()`, `updateAudioAnalysis()`, `updateAudioFadeIn()`, audio update functions
- **Result**: Audio setup handled entirely by AudioInitializer

#### Phase 1.5: Extract UI Initialization
**Target**: Lines 2600-3100 (UI component creation)
- **Create**: `src/core/initializers/UIInitializer.js`
- **Extract**: All UI component instantiation (SettingsManager, DevTools, HelpSystem, etc.)
- **Result**: UI setup handled by UIInitializer

#### Phase 1.6: Final Cleanup
**Target**: Remaining inline code
- Remove any remaining utility functions
- Ensure main.js is only ~200-300 lines
- Main.js should only: Import, create loading screen, call GameInitializer, start animation loop

### Success Criteria
- `main.js` reduced to < 400 lines
- All functionality preserved
- Clear separation of concerns
- Easy to understand entry point

---

## 2. `src/ui/ErrlPhone.js` (2,385 lines) - PRIORITY 2

### Current Structure Analysis
- Contains: Multiple tab components (Menu, Map, Avatar, Inventory, Music), vibe bar, phone UI container
- Main issues: All tabs in one file, mixed responsibilities

### Refactoring Plan

#### Phase 2.1: Extract Tab Components
**Create**:
- `src/ui/phone/MenuTab.js` - Menu/keybinds tab (~400 lines)
- `src/ui/phone/MapTab.js` - Map/minimap tab (~300 lines)
- `src/ui/phone/AvatarTab.js` - Avatar info/stats tab (~350 lines)
- `src/ui/phone/InventoryTab.js` - Inventory/achievements tab (~400 lines)
- `src/ui/phone/MusicTab.js` - Music player tab (~300 lines)
- `src/ui/phone/VibesLiquidBar.js` - Already exists, ensure it's used

#### Phase 2.2: Extract Phone Container
- **Keep**: `ErrlPhone.js` as coordinator (~300 lines)
- **Responsibility**: Tab switching, phone container UI, collapse/expand, event handling
- **Delegation**: Each tab handles its own content

#### Phase 2.3: Extract Shared Components
- **Create**: `src/ui/phone/components/` directory
- **Extract**: Shared UI elements (buttons, cards, etc.) used across tabs

### Success Criteria
- `ErrlPhone.js` reduced to < 500 lines
- Each tab component < 500 lines
- Clear component boundaries
- Easy to add new tabs

---

## 3. `src/dev/DevMenu.js` (2,271 lines) - PRIORITY 2

### Current Structure Analysis
- Contains: Multiple configuration sections (Movement, Camera, Visual Effects, Avatar, Physics, Audio, Debug)
- Main issues: All sections in one file, large preset objects

### Refactoring Plan

#### Phase 3.1: Extract Configuration Presets
**Create**: `src/config/DevMenuPresets.js`
- **Extract**: All preset objects (Snappy, Smooth, Arcade, Default, etc.)
- **Result**: Presets imported from config file

#### Phase 3.2: Extract Section Components
**Create**:
- `src/dev/menu/MovementSection.js` - Movement & Camera controls (~400 lines)
- `src/dev/menu/EffectsSection.js` - Visual Effects & Avatar controls (~400 lines)
- `src/dev/menu/PhysicsSection.js` - Physics & Audio controls (~350 lines)
- `src/dev/menu/DebugSection.js` - Debug & Tools controls (~300 lines)

#### Phase 3.3: Refactor Main Class
- **Keep**: `DevMenu.js` as coordinator (~400 lines)
- **Responsibility**: Tab management, panel container, section coordination
- **Delegation**: Each section handles its own controls

### Success Criteria
- `DevMenu.js` reduced to < 500 lines
- Each section component < 500 lines
- Presets in separate config file
- Easy to add new sections

---

## 4. `src/core/initializers/SetupInitializer.js` (1,294 lines) - PRIORITY 3

### Current Structure Analysis
- Contains: Resize handlers, keybind registration, setup utilities
- Main issues: Many unrelated static methods

### Refactoring Plan

#### Phase 4.1: Extract Keybind Registration
**Create**: `src/core/initializers/KeybindInitializer.js`
- **Extract**: `registerKeybinds()` method and all keybind logic (~600 lines)
- **Result**: Keybinds registered via KeybindInitializer

#### Phase 4.2: Extract Resize Handler
**Create**: `src/core/handlers/ResizeHandler.js`
- **Extract**: `setupResizeHandler()` method (~150 lines)
- **Result**: Resize handling in dedicated module

#### Phase 4.3: Extract Remaining Utilities
**Review**: Other static methods in SetupInitializer
- Group related methods
- Extract to appropriate modules or create new utility modules

### Success Criteria
- `SetupInitializer.js` reduced to < 400 lines or eliminated
- Clear separation of concerns
- Each extracted module has single responsibility

---

## 5. `src/core/UpdateManager.js` (1,261 lines) - PRIORITY 3

### Current Structure Analysis
- Contains: Update methods for avatar, physics, particles, collectibles, multiplayer, world state
- Main issues: Many update methods in one class

### Refactoring Plan

#### Phase 5.1: Extract Update Handlers
**Create**:
- `src/core/updates/AvatarUpdateHandler.js` - Avatar movement, physics, visuals (~300 lines)
- `src/core/updates/AudioUpdateHandler.js` - Audio and footsteps (~150 lines)
- `src/core/updates/ParticleUpdateHandler.js` - Particle system updates (~100 lines)
- `src/core/updates/CollectibleUpdateHandler.js` - Collectibles and streaks (~200 lines)
- `src/core/updates/WorldStateUpdateHandler.js` - World state reactor (~150 lines)
- `src/core/updates/MultiplayerUpdateHandler.js` - Multiplayer syncing (~100 lines)

#### Phase 5.2: Refactor UpdateManager
- **Keep**: `UpdateManager.js` as coordinator (~200 lines)
- **Responsibility**: Orchestrating update calls in correct order
- **Delegation**: Each handler updates its domain

### Success Criteria
- `UpdateManager.js` reduced to < 300 lines
- Each handler < 350 lines
- Clear update order and dependencies
- Easy to add new update handlers

---

## 6. `src/core/GameInitializer.js` (1,178 lines) - PRIORITY 3

### Current Structure Analysis
- Contains: Complete game initialization flow
- Main issues: Long initialization method, many phases

### Refactoring Plan

#### Phase 6.1: Extract Initialization Phases
**Create**: `src/core/initializers/phases/` directory
- **Extract**: Each initialization phase into separate module
- **Phases**:
  - `Phase0FoundationInitializer.js` - StateManager, EventBus
  - `Phase1RendererInitializer.js` - Three.js renderer, scene, camera
  - `Phase2CoreSystemsInitializer.js` - Already exists, verify integration
  - `Phase3EffectsInitializer.js` - Already exists, verify integration
  - `Phase4InteractiveEnvironmentInitializer.js` - Already exists, verify integration
  - `Phase5AudioInitializer.js` - Audio system setup
  - `Phase6UIInitializer.js` - UI components
  - `Phase7FinalInitializer.js` - Final setup, cleanup

#### Phase 6.2: Refactor GameInitializer
- **Keep**: `GameInitializer.js` as coordinator (~300 lines)
- **Responsibility**: Orchestrating initialization phases in order
- **Delegation**: Each phase handles its own initialization

### Success Criteria
- `GameInitializer.js` reduced to < 400 lines
- Each phase < 200 lines
- Clear initialization sequence
- Easy to add/modify phases

---

## 7. `src/dev/DevTools.js` (1,061 lines) - PRIORITY 3 (Low)

### Current Structure Analysis
- Contains: Debug overlays, performance metrics, debugging utilities
- Main issues: Multiple debug features in one class

### Refactoring Plan

#### Phase 7.1: Extract Debug Components
**Create**:
- `src/dev/components/PerformanceOverlay.js` - Performance metrics display
- `src/dev/components/SystemStatusOverlay.js` - System status display
- `src/dev/components/AssetInfoOverlay.js` - Asset information display
- `src/dev/utils/DebugUtils.js` - Debug utility functions

#### Phase 7.2: Refactor DevTools
- **Keep**: `DevTools.js` as coordinator (~300 lines)
- **Responsibility**: Toggle debug mode, coordinate debug components
- **Delegation**: Each component handles its own display

### Success Criteria
- `DevTools.js` reduced to < 400 lines
- Each component < 300 lines
- Modular debug system

---

## 8. `src/effects/PostProcessingManager.js` (1,032 lines) - PRIORITY 3

### Current Structure Analysis
- Contains: Post-processing setup, SSAO, bloom, glitch, chromatic aberration
- Main issues: Multiple effects in one class

### Refactoring Plan

#### Phase 8.1: Extract Effect Classes
**Create**:
- `src/effects/postprocessing/SSAOEffect.js` - SSAO setup and configuration
- `src/effects/postprocessing/BloomEffect.js` - Bloom setup and configuration
- `src/effects/postprocessing/GlitchEffect.js` - Glitch setup and configuration
- `src/effects/postprocessing/ChromaticAberrationEffect.js` - Chromatic aberration setup

#### Phase 8.2: Refactor PostProcessingManager
- **Keep**: `PostProcessingManager.js` as coordinator (~300 lines)
- **Responsibility**: EffectComposer management, effect coordination
- **Delegation**: Each effect class handles its own setup

### Success Criteria
- `PostProcessingManager.js` reduced to < 400 lines
- Each effect class < 300 lines
- Easy to add/remove effects

---

## 9. `src/avatar/ErrlAvatar.js` (1,010 lines) - PRIORITY 3

### Current Structure Analysis
- Contains: Avatar creation, movement, animation, state management, color variants
- Main issues: Large class with many responsibilities

### Refactoring Plan

#### Phase 9.1: Extract Avatar Components
**Create**:
- `src/avatar/AvatarGeometry.js` - Avatar mesh creation and geometry
- `src/avatar/AvatarAnimation.js` - Animation state and transitions (~300 lines)
- `src/avatar/AvatarColorSystem.js` - Color variant management (~200 lines)
- `src/avatar/AvatarState.js` - State management (idle, walk, run, etc.)

#### Phase 9.2: Refactor ErrlAvatar
- **Keep**: `ErrlAvatar.js` as coordinator (~400 lines)
- **Responsibility**: Position, velocity, physics integration, component coordination
- **Composition**: Uses AvatarGeometry, AvatarAnimation, AvatarColorSystem, AvatarState

### Success Criteria
- `ErrlAvatar.js` reduced to < 500 lines
- Each component < 350 lines
- Clear component boundaries
- Easy to modify avatar behavior

---

## Implementation Guidelines

### Step-by-Step Process

1. **Analysis Phase**
   - Identify file sections and responsibilities
   - Document dependencies
   - Map out extraction boundaries

2. **Design Phase**
   - Design module interfaces
   - Plan file structure
   - Document public APIs

3. **Extraction Phase**
   - Create new module files
   - Move code incrementally
   - Update imports

4. **Testing Phase**
   - Test each extraction independently
   - Integration testing
   - Verify all functionality

5. **Cleanup Phase**
   - Remove old code
   - Update documentation
   - Code review

### Best Practices

1. **Single Responsibility Principle**: Each module should have one clear purpose
2. **Dependency Injection**: Pass dependencies through constructors
3. **Interface Stability**: Maintain backward-compatible public APIs
4. **Incremental Changes**: Refactor one section at a time
5. **Comprehensive Testing**: Test after each change
6. **Documentation**: Update docs as you refactor

### Testing Strategy

1. **Unit Tests**: Test each extracted module independently
2. **Integration Tests**: Test module interactions
3. **Manual Testing**: Verify visual/functional behavior
4. **Regression Testing**: Ensure no functionality is lost

---

## Execution Order

### Recommended Sequence

1. **Week 1-2**: `main.js` (Priority 1 - most critical)
2. **Week 3**: `ErrlPhone.js` (Priority 2 - high impact)
3. **Week 4**: `DevMenu.js` (Priority 2 - improves dev experience)
4. **Week 5-6**: `UpdateManager.js` and `SetupInitializer.js` (Priority 3 - core systems)
5. **Week 7**: `GameInitializer.js` (Priority 3 - initialization)
6. **Week 8**: Remaining files (Priority 3 - polish)

### Dependencies

- `main.js` should be refactored first (blocking other improvements)
- `GameInitializer.js` refactoring may depend on `SetupInitializer.js`
- UI files can be refactored in parallel
- Dev tools can be refactored last (lowest priority)

---

## Success Metrics

### Quantitative Goals
- **File Size**: All files < 800 lines (ideally < 500)
- **Complexity**: Cyclomatic complexity < 15 per function
- **Coupling**: Low coupling between modules
- **Test Coverage**: Maintain or improve test coverage

### Qualitative Goals
- **Readability**: Code is easier to understand
- **Maintainability**: Easier to modify and extend
- **Testability**: Easier to test in isolation
- **Performance**: No performance regression

---

## Risk Mitigation

### Potential Risks

1. **Breaking Changes**: Extracted code might not work exactly the same
   - **Mitigation**: Extensive testing, maintain interfaces

2. **Performance Impact**: Additional function calls might affect performance
   - **Mitigation**: Profile before/after, optimize hot paths

3. **Integration Issues**: Modules might not integrate correctly
   - **Mitigation**: Integration testing, careful dependency management

4. **Time Investment**: Refactoring takes time away from features
   - **Mitigation**: Incremental approach, prioritize highest impact files

### Rollback Plan

- Keep original files in git history
- Create feature branches for each refactoring
- Test thoroughly before merging
- Can revert if issues arise

---

## Documentation Updates

As files are refactored, update:

1. **Module Documentation**: JSDoc comments in new modules
2. **Architecture Docs**: `docs/README.md`, architecture diagrams
3. **API Documentation**: Document new public interfaces
4. **Changelog**: Record refactoring changes

---

## Tools and Resources

### Recommended Tools

- **Code Analysis**: ESLint, complexity analyzers
- **Testing**: Existing test suite, manual testing
- **Documentation**: JSDoc, Markdown
- **Version Control**: Git feature branches

### Useful Commands

```bash
# Find large files
find src -name "*.js" -exec wc -l {} + | awk '$1 > 1000 {print $1, $2}' | sort -rn

# Analyze complexity
npx complexity-report src/

# Check test coverage
npm test -- --coverage
```

---

## Next Steps

1. Review and approve this plan
2. Prioritize which files to refactor first
3. Create detailed extraction plans for Priority 1 files
4. Begin with `main.js` refactoring
5. Document progress in `docs/refactoring/PROGRESS.md`

---

## Questions or Concerns

If you have questions about any part of this plan or want to adjust priorities, please discuss before beginning implementation.

