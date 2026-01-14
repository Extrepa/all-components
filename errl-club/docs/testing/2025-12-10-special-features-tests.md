# Rest Mode & Special Features Testing
**Date**: December 10, 2025  
**Tester**: [Your Name]  
**Test Type**: Manual Feature Testing

## Overview

This document provides testing procedures for rest mode toggle and other special Codex features.

## Prerequisites

1. **Setup**:
   - Start dev server: `npm run dev`
   - Open `localhost:5173`
   - Click "Ready" to start game
   - Ensure all assets have loaded

2. **Controls**:
   - Ctrl+R - Toggle rest mode
   - Other keyboard shortcuts as needed

## Test Procedures

### Test 1: Rest Mode Toggle (Ctrl+R)

**Objective**: Verify rest mode toggle works and affects assets/particles

**Steps**:
1. Observe normal mode (assets at full brightness, particles active)
2. Press Ctrl+R to enable rest mode
3. Observe changes:
   - Asset colors fade to mellow
   - Particle emissions reduce
   - Holographic rings slow down
4. Press Ctrl+R again to disable rest mode
5. Verify return to normal mode

**Expected Results**:
- ✅ Rest mode toggles on Ctrl+R
- ✅ Asset colors fade to mellow blue-purple
- ✅ Particle emission rate reduces (70% chance to skip)
- ✅ Particles fade faster in rest mode
- ✅ Holographic rings rotate slower
- ✅ Toggle works both ways (on/off)
- ✅ Transitions are smooth

**Verification Checklist**:
- [ ] Rest mode toggles correctly
- [ ] Asset colors fade appropriately
- [ ] Particle emissions reduce
- [ ] Particles fade faster
- [ ] Rings slow down
- [ ] Toggle works both ways
- [ ] Transitions are smooth
- [ ] No visual glitches

**Issues Found**:
1. [ ] No issues
2. [Issue description]: _______________

---

### Test 2: Rest Mode Persistence

**Objective**: Verify rest mode state persists (if implemented)

**Steps**:
1. Enable rest mode
2. Reload page or restart game
3. Check if rest mode state is restored

**Expected Results**:
- ✅ Rest mode state persists (if implemented)
- ✅ State loads correctly on game start
- ✅ Settings are saved to localStorage

**Verification Checklist**:
- [ ] State persists (if implemented)
- [ ] State loads correctly
- [ ] Settings saved correctly

**Notes**: This feature may not be implemented yet.

**Issues Found**:
1. [ ] No issues
2. [Issue description]: _______________

---

### Test 3: Rest Mode Visual Feedback

**Objective**: Verify visual feedback indicates rest mode state

**Steps**:
1. Toggle rest mode on
2. Observe visual indicators (if any)
3. Toggle rest mode off
4. Observe return to normal indicators

**Expected Results**:
- ✅ Visual feedback indicates rest mode state
- ✅ Feedback is clear and visible
- ✅ Feedback appears/disappears correctly

**Verification Checklist**:
- [ ] Visual feedback visible
- [ ] Feedback is clear
- [ ] Feedback appears/disappears correctly

**Issues Found**:
1. [ ] No issues
2. [Issue description]: _______________

---

### Test 4: Camera Vignette Proximity Detection

**Objective**: Verify camera vignettes (bloom boost) work when approaching assets

**Steps**:
1. Position avatar far from Codex assets
2. Observe normal bloom level
3. Approach The Shroom Bar Nightclub
4. Observe bloom intensity increase
5. Move away and observe bloom decrease
6. Repeat for other assets

**Expected Results**:
- ✅ Bloom intensity increases when approaching assets
- ✅ Bloom intensity decreases when moving away
- ✅ Transitions are smooth
- ✅ Works for all Codex assets
- ✅ Intensity scales with proximity

**Verification Checklist**:
- [ ] Bloom increases near assets
- [ ] Bloom decreases when away
- [ ] Transitions are smooth
- [ ] Works for all assets
- [ ] Intensity scales correctly

**Issues Found**:
1. [ ] No issues
2. [Issue description]: _______________

---

### Test 5: Keyboard Shortcuts for Codex Features

**Objective**: Verify all keyboard shortcuts for Codex features work

**Steps**:
1. Test Ctrl+R (rest mode toggle)
2. Test other Codex-related shortcuts (if any)
3. Verify shortcuts don't conflict with other controls
4. Check console for any errors

**Expected Results**:
- ✅ All shortcuts work correctly
- ✅ No conflicts with other controls
- ✅ No console errors
- ✅ Shortcuts are responsive

**Verification Checklist**:
- [ ] Ctrl+R works
- [ ] Other shortcuts work (if any)
- [ ] No conflicts
- [ ] No console errors
- [ ] Shortcuts are responsive

**Issues Found**:
1. [ ] No issues
2. [Issue description]: _______________

---

## Test Results Summary

### Overall Status: ⏳ PENDING

**Tests Completed**: 0/5  
**Tests Passed**: 0/5  
**Tests Failed**: 0/5

### Individual Test Results

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Rest Mode Toggle | ⏳ Pending | |
| 2 | Rest Mode Persistence | ⏳ Pending | |
| 3 | Rest Mode Visual Feedback | ⏳ Pending | |
| 4 | Camera Vignette Proximity | ⏳ Pending | |
| 5 | Keyboard Shortcuts | ⏳ Pending | |

---

## Issues Found

_List any issues discovered during testing:_

1. **Issue**: [Description]
   - **Severity**: [Low/Medium/High/Critical]
   - **Steps to Reproduce**: [Steps]
   - **Expected**: [Expected behavior]
   - **Actual**: [Actual behavior]

---

## Recommendations

_List recommendations for improvements:_

1. [Recommendation 1]
2. [Recommendation 2]

---

## Next Steps

1. Complete all special feature tests
2. Document any issues found
3. Verify fixes if issues are addressed
4. Update test results table

---

**Test Document Version**: 1.0  
**Last Updated**: December 10, 2025  
**Next Review**: After special features testing complete

