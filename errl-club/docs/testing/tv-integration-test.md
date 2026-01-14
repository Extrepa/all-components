# TV Integration Test

## Test Date
December 7, 2025

## Test Objective
Verify that the TV model loads correctly and the avatar spawns inside/at the TV screen.

## Implementation Summary

### Files Modified
1. `src/interactions/TVProp.js` - New TV prop class
2. `src/core/GameInitializer.js` - Integrated TV loading and spawn point
3. `src/core/initializers/AvatarInitializer.js` - Added custom spawn position support

### Files Created
1. `public/models/props/television_11.glb` - TV model (2.2MB)
2. `public/models/props/television_11-2.glb` - Alternative TV model (22MB)

## Test Steps

### 1. Model Loading
- [ ] TV model loads from `/models/props/television_11.glb`
- [ ] Model appears in scene at position `(0, 0.75, -ROOM_SIZE/2 + 3)`
- [ ] If model fails to load, placeholder box appears
- [ ] No console errors during model loading

### 2. Spawn Position Calculation
- [ ] TV bounding box is calculated correctly
- [ ] Screen position is calculated from bounding box
- [ ] Screen position is at front face of TV (slightly inside)
- [ ] Fallback position works if model hasn't loaded yet

### 3. Avatar Spawning
- [ ] Avatar spawns at TV screen position
- [ ] Avatar appears "inside" or "at" the TV screen
- [ ] Avatar drops down from spawn height correctly
- [ ] No collision issues with TV model

### 4. Visual Verification
- [ ] TV is visible in scene
- [ ] TV is positioned near stage area
- [ ] TV faces the room (correct rotation)
- [ ] Avatar spawns correctly relative to TV

## Expected Results

### Success Criteria
- ✅ TV model loads without errors
- ✅ Avatar spawns inside/at TV screen
- ✅ No console errors
- ✅ Smooth initialization

### Known Issues
- TV model file is 2.2MB - may take a moment to load
- Spawn position calculation depends on model bounding box
- If model fails to load, placeholder is used

## Test Results

### Browser Console Checks
- [ ] No 404 errors for model file
- [ ] No GLTFLoader errors
- [ ] TVProp logs show successful load
- [ ] Screen position is logged correctly

### Visual Checks
- [ ] TV appears in scene
- [ ] Avatar spawns at correct location
- [ ] No visual glitches or artifacts

## Notes

### Model Path
- Development: `/models/props/television_11.glb` (served from `public/`)
- Production: Same path (Vite copies `public/` to `dist/`)

### Spawn Position Logic
1. Calculate TV bounding box
2. Find center of bounding box
3. Calculate size of bounding box
4. Screen position = center + (size.z/2 - 0.1) in Z direction
5. Apply rotation if TV is rotated

### Fallback Behavior
- If model fails to load: Placeholder box is created
- If screen position not calculated: Uses TV position + offset
- Avatar always spawns, even if TV model fails

## Next Steps
- [ ] Test with different TV positions
- [ ] Test with TV rotation
- [ ] Add visual effects when spawning from TV
- [ ] Make TV interactive (click to spawn)

