# Quick Start Guide - Continuing main.js Refactoring

**For**: New chat session / different window  
**Context**: Refactoring main.js from 3,163 → target < 400 lines  
**Current Status**: 1,404 lines (55.6% reduction)

---

## 🚀 Start Here

1. **Read Current State**: `docs/refactoring/CURRENT_STATE.md`
2. **Review Next Steps**: `docs/refactoring/NEXT_STEPS.md`
3. **Check Module Reference**: `docs/refactoring/EXTRACTED_MODULES_REFERENCE.md`

---

## ⚡ Immediate Action Items

### 1. Integrate SystemsUpdater (HIGH PRIORITY)
- **File**: `src/core/updates/SystemsUpdater.js` (exists, not used)
- **Task**: Replace individual update calls in `main.js` animate() with `updateAllSystems()`
- **See**: `NEXT_STEPS.md` Step 1 for details
- **Expected**: Reduce main.js by ~250-300 lines

### 2. Fix Duplicate Imports
- **File**: `src/main.js` lines 115-118
- **Task**: Remove duplicate imports, organize by category

### 3. Continue Extraction
- Extract remaining initialization code
- Target: < 800 lines

---

## 📋 Current Structure

```
src/main.js (1,404 lines)
├── Imports (~160 lines)
├── Initialization (~500 lines) ← Extract next
├── animate() function (~600 lines) ← Integrate SystemsUpdater here
└── Event handler setup (~50 lines)

src/core/updates/
├── SystemsUpdater.js ✅ Created, ⚠️ Not integrated
├── AvatarMovementUpdater.js ✅ Used
├── PostProcessingUpdater.js ✅ Used
└── ... (other updaters) ✅ Used
```

---

## 🔍 Key Files

### To Edit:
- `src/main.js` - Main file being refactored

### To Review:
- `src/core/updates/SystemsUpdater.js` - System updates consolidator
- `src/core/GameLoop.js` - Future migration target
- `src/core/UpdateManager.js` - Future migration target
- `src/core/GameInitializer.js` - Future migration target

### Documentation:
- `docs/refactoring/CURRENT_STATE.md` - Full status
- `docs/refactoring/NEXT_STEPS.md` - Detailed next steps
- `docs/refactoring/EXTRACTED_MODULES_REFERENCE.md` - Module docs
- `docs/refactoring/MAIN_JS_MIGRATION_STATUS.md` - Migration strategy

---

## ✅ What's Done

- ✅ Scene setup extracted
- ✅ Audio helpers extracted
- ✅ Event handlers extracted
- ✅ System initializers extracted
- ✅ Update helpers extracted
- ✅ SystemsUpdater created (but not integrated)

---

## ⏳ What's Next

1. ⚠️ Integrate SystemsUpdater into main.js
2. ⏳ Extract remaining initialization
3. ⏳ Prepare for GameLoop migration
4. ⏳ Migrate to GameLoop + UpdateManager
5. ⏳ Migrate to GameInitializer
6. ⏳ Final cleanup

---

## 🎯 Goals

- **Current**: 1,404 lines (55.6% reduction)
- **After SystemsUpdater**: ~1,100-1,150 lines
- **After init extraction**: ~700-800 lines
- **After GameLoop migration**: ~400-500 lines
- **Final goal**: < 400 lines (ideally < 200)

---

## 📝 Testing Checklist

After each change:
- [ ] Game loads
- [ ] Avatar moves
- [ ] Audio works
- [ ] Particles animate
- [ ] Collectibles spawn
- [ ] Interactions work
- [ ] No console errors
- [ ] Performance acceptable

---

## 🔗 Codex Recommendations

Following incremental extraction approach (Option B):
- ✅ Explicit dependencies
- ✅ Test after each step
- ⚠️ Prepare for GameLoop migration
- ⏳ Eventually use GameInitializer + GameLoop

See `MAIN_JS_MIGRATION_STATUS.md` for full strategy.

---

## 💡 Pro Tips

1. **Start small**: Integrate SystemsUpdater first (biggest impact, low risk)
2. **Test often**: After each extraction, test thoroughly
3. **Document changes**: Update CURRENT_STATE.md as you go
4. **Follow patterns**: Use existing extracted modules as templates
5. **Keep dependencies explicit**: No globals except temporary window.gameSystems

---

## 🆘 If Stuck

1. Check `CURRENT_STATE.md` for current status
2. Review `EXTRACTED_MODULES_REFERENCE.md` for module APIs
3. Look at existing extracted modules for patterns
4. Review `GameLoop.js` and `UpdateManager.js` for target structure
5. Check git history for recent changes

---

## 📊 Progress Tracking

Update these files as you work:
- `docs/refactoring/CURRENT_STATE.md` - Current status
- `docs/refactoring/NEXT_STEPS.md` - Completed steps
- This file - Quick reference

---

Good luck! Start with SystemsUpdater integration - it's the highest impact next step. 🚀

