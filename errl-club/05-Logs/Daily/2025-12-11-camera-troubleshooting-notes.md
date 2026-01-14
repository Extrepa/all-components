# Camera Troubleshooting Session - December 11, 2025

## Summary
Spent significant time troubleshooting camera positioning issues where the avatar appears in the corner instead of centered in the view. Made multiple attempts to fix camera tracking, but the issue persists.

## Changes Made Today

### 1. Camera Position Tracking
- **File**: `src/camera/CameraController.js`
- **Changes**:
  - Modified `snapBehindAvatar()` to use `avatar.group.getWorldPosition()` instead of `avatar.position` to get actual world coordinates
  - Updated `updateFollowMode()` to use world position and simplified camera offset calculation
  - Added debug logging every 60 frames to track avatar and camera positions
  - Changed camera offset from `(0, 3, 8)` to `(0, 5, 12)` for higher/further view
  - Added startup frame counter to snap camera directly (no lerp) for first 30 frames

### 2. Initial Camera Position
- **File**: `src/core/GameInitializer.js`
- **Changes**:
  - Updated initial camera position from `(0, 2.5, 5)` to `(0, 8, 12)` to match new camera offset
  - Changed initial lookAt from `(0, 1.5, 0)` to `(0, 3, 0)` to match avatar spawn height

### 3. Auto-Start for Testing
- **File**: `src/core/GameInitializer.js`
- **Changes**:
  - Added auto-start functionality that triggers game start after 500ms delay
  - This skips the "Start game" button click for faster testing iteration
  - **Note**: Should be removed for production

## Current Status

### What's Working
- ✅ Game initializes successfully
- ✅ Avatar spawns at correct position (0, 3, 0) then falls to (0, 0.5, 0)
- ✅ Camera position calculations are correct (console logs show correct coordinates)
- ✅ Camera follows avatar position updates
- ✅ Post-processing disabled (no fuzziness)
- ✅ Color rendering fixed (no monochrome issues)

### What's NOT Working
- ❌ **Avatar appears in corner of screen, not centered**
  - Console logs show avatar at (0, 0.5, 0) and camera at (0, 3.5, 8)
  - Camera should be looking directly at avatar, but view is offset
  - Avatar is visible but in top-right corner instead of center

### Observations
- Camera position math appears correct based on console logs
- Avatar world position is being retrieved correctly
- The issue might be:
  1. Scene rotation or coordinate system mismatch
  2. Camera aspect ratio or FOV affecting view
  3. Some other system modifying camera after our updates
  4. Avatar mesh position not matching `avatar.position` or `avatar.group.position`

## Debug Information

### Console Logs Show:
```
snapBehindAvatar: Avatar world pos 0 3 0
snapBehindAvatar: Camera at 0 6 8
Camera follow: avatar at 0.00 0.50 0.00 | camera at 0.00 3.50 8.00
```

### Camera Configuration:
- FOV: 75 degrees
- Initial position: (0, 8, 12)
- LookAt: (0, 3, 0)
- Follow offset: (0, 5, 12)

## Next Steps for Tomorrow

### Priority 1: Fix Camera Centering
1. **Verify avatar mesh position**
   - Check if `avatar.mesh.position` matches `avatar.group.position`
   - Verify avatar is actually at the coordinates we think it is
   - Add visual debug helper (sphere at origin) to verify coordinate system

2. **Check for camera overrides**
   - Search for any code that modifies `camera.position` or `camera.rotation` after our updates
   - Check if `update()` method has shake/jitter that's offsetting camera
   - Verify no other camera controllers are active

3. **Test camera directly**
   - Try setting camera to fixed position (0, 5, 8) looking at (0, 0.5, 0) and see if avatar is centered
   - If not, the issue is coordinate system or avatar position mismatch
   - If yes, the issue is in the follow logic

4. **Check scene/coordinate system**
   - Verify scene has no rotation applied
   - Check if camera is in a different coordinate space
   - Look for any parent transforms affecting camera or avatar

### Priority 2: Clean Up
- Remove auto-start code before production
- Remove debug console.log statements (or gate behind DEBUG flag)
- Clean up commented code

### Priority 3: Verify Other Systems
- Ensure movement controls still work
- Verify camera presets (1/2/3 keys) work
- Test camera snap (R key) functionality

## Files Modified
1. `src/camera/CameraController.js` - Camera tracking logic
2. `src/core/GameInitializer.js` - Initial camera position, auto-start
3. `src/effects/PostProcessingManager.js` - Post-processing disabled (from earlier)
4. `src/core/initializers/PostProcessingEffectsInitializer.js` - SSAO disabled (from earlier)

## Testing Commands
```bash
npm run build
npm run dev
# Navigate to http://localhost:5173
# Game should auto-start after 500ms
```

## Key Insight
The camera position math appears correct, but the visual result doesn't match. This suggests either:
- A coordinate system mismatch
- Something else modifying the camera
- The avatar mesh position not matching what we think

The solution likely requires adding visual debug helpers to see exactly where things are in 3D space.

