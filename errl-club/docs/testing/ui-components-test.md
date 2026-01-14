# UI Components Testing Guide

This document outlines testing procedures for all newly implemented UI components.

## Tested Components

### 1. Collection Streak/Combo UI
**File**: `src/ui/CollectionStreakUI.js`  
**System**: `src/systems/CollectionStreakSystem.js`

**Test Steps**:
1. Start the game and collect multiple collectibles in quick succession
2. Verify streak counter appears and increments (e.g., "5x Streak!")
3. Verify combo display appears when collecting within timing window
4. Verify multiplier display shows correct multiplier
5. Verify timing bar decreases as time passes
6. Verify streak breaks when no collection occurs within timeout
7. Verify red flash animation on streak break
8. Check that streak info appears in Collection Progress UI (F3)

**Expected Behavior**:
- Streak UI appears when streak > 0
- Combo UI appears when combo > 1
- Timing bar shows time remaining before streak break
- Visual animations (pulse, combo pulse) work correctly
- UI hides after streak breaks

---

### 2. Room Transition UI
**File**: `src/ui/RoomTransitionUI.js`  
**Loader**: `src/ui/ErrlLoader.js`

**Test Steps**:
1. Start the game
2. Navigate to a teleporter or room transition point
3. Trigger room transition
4. Verify Errl loader animation appears
5. Verify room name displays correctly
6. Verify progress bar updates during loading
7. Verify tips rotate during loading
8. Verify smooth transition animation
9. Verify loading screen disappears after transition

**Expected Behavior**:
- Walking Errl animation plays smoothly
- Room name displays prominently
- Progress bar fills from 0% to 100%
- Tips change every 4 seconds
- Transition completes smoothly

---

### 3. Controls Reference UI
**File**: `src/ui/ControlsReferenceUI.js`

**Test Steps**:
1. Press Shift+? or Ctrl+? to open Controls Reference UI
2. Verify all keybinds are displayed
3. Verify keybinds are organized by category
4. Test search functionality
5. Test category filtering
6. Verify keybind formatting (modifiers + key)
7. Test "All" category button
8. Close UI and verify it closes properly

**Expected Behavior**:
- All registered keybinds appear
- Categories: Movement, Camera, Interaction, UI, Effects, Debug, Other
- Search filters keybinds by description or key
- Category buttons filter correctly
- Keybind display shows modifiers (Shift, Ctrl, Alt) + key
- Empty state shows when no matches

---

### 4. Discovery Map UI
**File**: `src/ui/DiscoveryMap.js`

**Test Steps**:
1. Press M key to open Discovery Map
2. Verify all rooms are displayed in sidebar
3. Verify discovery progress for each room
4. Click on a room to filter map
5. Verify discovered objects appear on map (green dots)
6. Toggle "Show Undiscovered" to see undiscovered objects (red dots)
7. Verify statistics display shows correct totals
8. Interact with an object to discover it
9. Verify map updates when object is discovered
10. Test view mode toggle (full/minimap)

**Expected Behavior**:
- Map shows all rooms in grid layout
- Discovered objects marked with green indicators
- Undiscovered objects marked with red indicators (when enabled)
- Room progress bars show discovery percentage
- Statistics update in real-time
- Map updates when discoveries occur

---

### 5. Visual Recorder Export UI
**File**: `src/ui/VisualRecorderUI.js`  
**Utility**: `src/utils/ImageExporter.js`

**Test Steps**:
1. Open Visual Recorder UI (check keybind)
2. Start a recording
3. Perform some actions in-game
4. Stop the recording
5. Verify recording appears in recordings list
6. Select PNG or JPEG format
7. Click "Export" on a recording
8. Verify progress bar appears and updates
9. Verify files download (check Downloads folder)
10. Verify file naming is correct (recording_ID_frame_000000.png)
11. Test with multiple recordings

**Expected Behavior**:
- Recordings list shows all recordings with metadata
- Export progress bar shows 0-100%
- PNG files download correctly
- JPEG files download correctly (with quality setting)
- File names are sequential and unique
- Export completes successfully

---

## Integration Testing

### Test All UI Components Together

1. **Start Game**:
   - Verify no console errors
   - Verify all UI components initialize
   - Check that Errl loader appears during initial load

2. **Test UI Access**:
   - F1: Help Panel
   - F3: Collection Progress
   - Shift+?: Controls Reference
   - M: Discovery Map
   - Visual Recorder keybind (check SetupInitializer)

3. **Test UI Interactions**:
   - Open multiple UIs simultaneously
   - Verify UIs don't overlap incorrectly
   - Verify UIs can be closed independently
   - Test UI scaling (if applicable)

4. **Test Event Integration**:
   - Collect items → Verify streak UI updates
   - Transition rooms → Verify transition UI appears
   - Discover objects → Verify discovery map updates
   - Record visuals → Verify recorder UI updates

---

## Known Issues to Check

1. **ControlsReferenceUI Import Error**:
   - Fixed: Added import to UIInitializer.js
   - Verify: Check browser console for errors

2. **Discovery Map Object Tracking**:
   - Verify objects are registered with discovery system
   - Check that object IDs are consistent

3. **Visual Recorder Export**:
   - Browser may block multiple downloads
   - Test with small recordings first
   - Verify file sizes are reasonable

4. **Room Transition UI**:
   - Verify Errl loader doesn't cause performance issues
   - Check that loader disposes properly

---

## Performance Testing

1. **UI Rendering**:
   - Open all UIs simultaneously
   - Check FPS impact
   - Verify no memory leaks

2. **Animation Performance**:
   - Errl loader animations
   - Streak UI animations
   - Transition animations

3. **Export Performance**:
   - Test export with large recordings (100+ frames)
   - Monitor browser performance during export
   - Check memory usage

---

## Browser Compatibility

Test in:
- Chrome/Edge (Chromium)
- Firefox
- Safari (if available)

Verify:
- All UIs render correctly
- Animations work
- Exports function
- No console errors

---

## Manual Test Checklist

- [ ] Collection Streak UI appears and updates correctly
- [ ] Room Transition UI shows Errl loader
- [ ] Controls Reference UI opens and displays all keybinds
- [ ] Discovery Map UI shows rooms and objects
- [ ] Visual Recorder Export downloads files correctly
- [ ] All UIs can be opened/closed without errors
- [ ] No console errors during normal gameplay
- [ ] UI scaling works (if applicable)
- [ ] All keybinds work correctly
- [ ] Event integration works (streaks, discoveries, etc.)

---

## Automated Testing (Future)

When automated tests are added:
- Unit tests for each UI component
- Integration tests for UI interactions
- E2E tests for full workflows
- Performance benchmarks

