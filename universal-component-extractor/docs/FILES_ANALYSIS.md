# Files Analysis - Unused or Needs Update
Grabbing enemies very fast around the waterfall
This document lists files that are either no longer needed or need their references updated after documentation consolidation.

## Files That Needed Reference Updates

These files previously referenced the old documentation files that were moved to `docs/archive/`. They have been updated to point to the consolidated docs.

### 1. `components/WelcomeModal.tsx`
**Issue:** References old documentation files  
**Fix:** Replaced old links with `docs/USER_GUIDE.md` (consolidated user documentation)

**Status:** ✅ Updated

### 2. `docs/checklist.md`
**Issue:** References `bugfixes.md` which was merged into `project-status.md`  
**Fix:** Link now points to `docs/project-status.md`

**Status:** ✅ Updated

### 3. `docs/ai-prompts.md`
**Issue:** References old documentation files  
**Fix:** Links now point to `DEVELOPER_GUIDE.md` (architecture) and `USER_GUIDE.md` (user instructions)

**Status:** ✅ Updated

---

## Files That May Not Be Needed

These files appear to be unused or replaced by other files.

### 1. `scripts/copy-three.js`
**Status:** ❌ **NOT NEEDED - Safe to Delete**

**Reason:**
- Replaced by `scripts/copy-libs.js` which handles all library copying (Three.js, p5.js, Babel, React)
- Not referenced in `package.json` scripts
- Not referenced in any build scripts
- Not imported or required anywhere
- Mentioned in CHANGELOG as being replaced by copy-libs.js

**Action:** ✅ **Can be safely deleted** (functionality moved to `copy-libs.js`)

### 2. `metadata.json`
**Status:** ❓ **UNKNOWN - Verify Usage**

**Reason:**
- Not referenced in any code files
- Not referenced in `package.json`
- Not referenced in build scripts
- Not used by electron-builder (package.json has all metadata)
- Contains: name, description, requestFramePermissions (not used)

**Action:** ⚠️ **Likely not needed** - Can be removed unless used for something specific

### 3. `docs/checklist.md`
**Status:** ⚠️ **OUTDATED - Needs Update or Archive**

**Reason:**
- Appears to be a one-time verification checklist from version 2.0.1
- References old file structure
- References `bugfixes.md` which no longer exists (merged into project-status.md)
- Version shows 2.0.1 (current is 2.0.5)
- May be useful as historical reference but needs updating

**Action:** 
- Option 1: Update references and keep as historical verification record
- Option 2: Move to archive if no longer needed
- Option 3: Delete if completely outdated

---

## Summary

### High Priority (Update References)
1. ✅ `components/WelcomeModal.tsx` - Doc references updated
2. ✅ `docs/checklist.md` - Bugfixes reference updated
3. ✅ `docs/ai-prompts.md` - Doc references updated

### Medium Priority (Verify Usage)
1. ❓ `metadata.json` - Check if needed for Electron
2. ⚠️ `docs/checklist.md` - Consider if still needed

### Low Priority (Safe to Remove)
1. ❌ `scripts/copy-three.js` - Replaced by copy-libs.js, safe to delete

---

## Recommended Actions

1. **Verify Usage:**
   - Check if `metadata.json` is used by Electron Builder
   - Decide if `docs/checklist.md` should be updated or archived

2. **Clean Up:**
   - Delete `scripts/copy-three.js` (replaced functionality)

---

**Date:** November 2025  
**Version:** 2.0.5
