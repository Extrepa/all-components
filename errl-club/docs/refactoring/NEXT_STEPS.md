# Next Steps for main.js Refactoring

**Last Updated**: December 10, 2025  
**Context**: Continuing refactoring from 1,404 lines toward target of < 400 lines

---

## Immediate Next Steps (High Priority)

### Step 1: Integrate SystemsUpdater into main.js ⚠️ **DO THIS FIRST**

**Current State**: `SystemsUpdater.js` exists but is not used in main.js  
**Goal**: Replace individual system update calls with `updateAllSystems()`

**Actions**:
1. Import `updateAllSystems` and `renderScene` from SystemsUpdater
2. In `animate()` function, replace all individual update calls with:
   ```javascript
   updateAllSystems({
       deltaTime,
       elapsedTime,
       clock,
       systems: {
           // Core objects
           scene,
           camera,
           renderer,
           avatar,
           
           // All systems (see SystemsUpdater.js for full list)
           particleSystem,
           physicsSystem,
           // ... etc
       },
   });
   
   renderScene({
       scene,
       camera,
       renderer,
       composer,
       postProcessingEnabled,
   });
   ```
3. Remove duplicate import statements (lines 115-118 have duplicates)
4. Test that game still works

**Expected Reduction**: ~250-300 lines (from ~1,404 to ~1,100-1,150)

**Files to Modify**:
- `src/main.js` - Update animate() function

**Testing Checklist**:
- [ ] Game loads
- [ ] Avatar moves
- [ ] Audio works
- [ ] Particles animate
- [ ] Collectibles spawn
- [ ] Interactions work
- [ ] Performance acceptable

---

### Step 2: Fix Duplicate Imports

**Current State**: Lines 115-118 show duplicate imports  
**Actions**:
1. Review all imports at top of main.js
2. Remove duplicates
3. Organize imports by category (Three.js, systems, updaters, etc.)

**Expected Reduction**: ~10-20 lines

---

### Step 3: Extract Remaining Initialization Code

**Current State**: Large blocks of initialization still inline (lines ~500-900)  
**Goal**: Move initialization to helper modules or GameInitializer

**Actions**:
1. Identify initialization blocks:
   - Avatar creation
   - Particle system setup
   - System initialization
   - Codex asset loading
   - UI component creation
2. Create or use existing initializer modules
3. Replace inline code with initializer calls
4. Ensure loading screen progress updates still work

**Expected Reduction**: ~300-400 lines (from ~1,100 to ~700-800)

**Files to Create/Modify**:
- Create: `src/core/initializers/GameSystemsInitializer.js` (if needed)
- Modify: `src/main.js`

---

## Medium-Term Steps (After Immediate Steps)

### Step 4: Consolidate Initialization

**Goal**: Use GameInitializer or create unified initialization flow

**Actions**:
1. Review `GameInitializer.js` to see what it already handles
2. Either:
   - Migrate remaining init to GameInitializer, OR
   - Create initialization wrapper that calls all initializers in order
3. Ensure all systems are properly initialized
4. Test thoroughly

**Expected Reduction**: ~200-300 lines (from ~700 to ~400-500)

---

### Step 5: Prepare for GameLoop Migration

**Goal**: Ensure animate() function is ready for GameLoop replacement

**Actions**:
1. Ensure all systems are in a single systems object
2. Verify SystemsUpdater works correctly
3. Test that UpdateManager structure is compatible
4. Document any differences between current structure and UpdateManager expectations

**Files to Review**:
- `src/core/GameLoop.js`
- `src/core/UpdateManager.js`
- `src/core/updates/SystemsUpdater.js`

---

### Step 6: Migrate to GameLoop + UpdateManager

**Goal**: Replace animate() with GameLoop.start()

**Actions**:
1. Create UpdateManager instance
2. Either:
   - Modify UpdateManager to call SystemsUpdater, OR
   - Integrate SystemsUpdater logic into UpdateManager methods
3. Replace `animate()` function with:
   ```javascript
   const gameLoop = new GameLoop(
       new UpdateManager(),
       composer, // or postProcessingManager
       renderer,
       scene,
       camera,
       systems
   );
   gameLoop.start();
   ```
4. Remove old `animate()` function
5. Test thoroughly

**Expected Reduction**: ~100-150 lines (from ~400 to ~250-300)

**Files to Modify**:
- `src/main.js`
- Possibly `src/core/UpdateManager.js` (if integrating SystemsUpdater)

---

## Long-Term Steps (Final Migration)

### Step 7: Migrate to GameInitializer

**Goal**: Use GameInitializer for all initialization

**Actions**:
1. Review GameInitializer.initialize() return value
2. Ensure it returns all needed systems
3. Replace initialization code with:
   ```javascript
   const gameInitializer = new GameInitializer(canvas);
   const systems = await gameInitializer.initialize();
   ```
4. Remove all inline initialization

**Expected Reduction**: ~150-200 lines (from ~250 to ~50-100)

---

### Step 8: Final Cleanup

**Goal**: Reduce main.js to minimal entry point

**Actions**:
1. Remove any remaining utility functions
2. Ensure all logic is in modules
3. Verify imports are minimal
4. Final testing

**Expected Result**: main.js ~100-200 lines (exceeding goal of < 400)

---

## Migration Strategy (Per Codex Recommendations)

### Option A: Full Migration (Risky)
- Migrate everything at once to GameInitializer + GameLoop
- **Risk**: High - many things could break
- **Benefit**: Fastest path to goal

### Option B: Incremental Migration (Recommended) ✅
- Continue current approach: extract, test, migrate
- **Risk**: Low - test after each step
- **Benefit**: Safe, maintainable, follows Codex recommendations

**Current Status**: Following Option B (incremental)

---

## Testing Strategy

### After Each Step:
1. **Manual Testing**:
   - Game loads
   - Basic movement works
   - Audio works
   - Visual effects work
   - Interactions work

2. **Console Check**:
   - No errors in console
   - No warnings about missing dependencies

3. **Performance Check**:
   - FPS acceptable
   - No memory leaks
   - Loading time reasonable

4. **Feature Testing**:
   - Key features work
   - UI works
   - Collectibles work

---

## Risk Assessment

### Low Risk ✅
- Integrating SystemsUpdater (already tested structure)
- Fixing duplicate imports
- Extracting initialization helpers

### Medium Risk ⚠️
- Consolidating initialization
- Preparing for GameLoop migration

### High Risk 🚨
- Migrating to GameLoop
- Migrating to GameInitializer
- Final cleanup

**Mitigation**: Test after each step, use git commits, can revert if needed

---

## Dependencies to Track

### Variables Still in main.js (need access after migration):
- Scene objects: `spotLight`, `ceilingLights`, `speakerCones`, etc.
- Systems: `avatar`, `particleSystem`, `physicsSystem`, etc.
- Audio: `frequencyBands`, `bassEnergy`, `overallEnergy`
- Post-processing: `composer`, `bloomPass`
- Interactive objects: `doors`, `teleporters`, etc.

### Solution:
- Pass as part of `systems` object
- Store in `window.gameSystems` (temporary, for compatibility)
- Ensure GameInitializer returns all needed objects

---

## Success Criteria

### Quantitative Goals:
- [x] Reduce from 3,163 → 1,404 lines (55.6% done)
- [ ] Reduce to < 1,200 lines (after SystemsUpdater integration)
- [ ] Reduce to < 800 lines (after initialization extraction)
- [ ] Reduce to < 400 lines (target goal)
- [ ] Reduce to < 200 lines (stretch goal)

### Qualitative Goals:
- [x] Code is more modular
- [x] Clear separation of concerns
- [ ] Using existing systems (GameLoop, UpdateManager, GameInitializer)
- [x] Explicit dependencies (no globals)
- [ ] All files < 800 lines

---

## Quick Reference

### Key Files to Edit:
- `src/main.js` - Main file being refactored
- `src/core/updates/SystemsUpdater.js` - System updates consolidator

### Key Files to Review:
- `src/core/GameLoop.js` - Target for animation loop
- `src/core/UpdateManager.js` - Target for update coordination
- `src/core/GameInitializer.js` - Target for initialization

### Documentation to Read:
- `docs/refactoring/CURRENT_STATE.md` - Current status
- `docs/refactoring/EXTRACTED_MODULES_REFERENCE.md` - Module reference
- `docs/refactoring/MAIN_JS_MIGRATION_STATUS.md` - Migration strategy
- `docs/refactoring/LARGE_FILE_REFACTORING_PLAN.md` - Overall plan

---

## Notes for Next Session

1. **Start with SystemsUpdater integration** - Biggest immediate impact
2. **Test thoroughly** after each change
3. **Follow incremental approach** - Don't try to migrate everything at once
4. **Keep dependencies explicit** - No globals except window.gameSystems (temporary)
5. **Document as you go** - Update this file and CURRENT_STATE.md

---

## Questions to Resolve

1. Should SystemsUpdater be integrated into UpdateManager, or called from it?
2. Does GameInitializer already handle all initialization we need?
3. Are there any dependencies in main.js that GameInitializer doesn't return?
4. Should we maintain window.gameSystems for compatibility, or remove it?

