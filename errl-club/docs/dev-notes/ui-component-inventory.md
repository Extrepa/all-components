# UI Component Inventory & Initialization Status

## Components Initialized in UIInitializer

### Directly Initialized (16 components)
1. ✅ **VibeMeter** - Created directly
2. ✅ **VisualizerStylePicker** - Created directly (visualizer set later)
3. ✅ **NotificationSystem** - Created directly
4. ✅ **CameraIntensityIndicator** - Created directly
5. ✅ **InteractionPrompt** - Created directly
6. ✅ **InteractionFeedback** - Created directly
7. ✅ **ControlDock** - Created directly (dev mode only, hidden)
8. ✅ **ErrlPhone** - Created directly (primary UI)
9. ✅ **HelpSystem** - Created directly
10. ✅ **HelpPanel** - Created directly
11. ✅ **ReplayRecordingIndicator** - Created directly
12. ✅ **VisualRecorderUI** - Created directly (visualRecorder set later)
13. ✅ **CollectionStreakUI** - Created directly (streakSystem set later)
14. ✅ **RoomTransitionUI** - Created directly (roomManager set later)
15. ✅ **ControlsReferenceUI** - Created directly (keybindManager set later)
16. ✅ **DiscoveryMap** - Created directly (discoverySystem/roomManager set later)

### Lazy-Loaded Components (Created on Demand)
These are created when their keybinds are triggered:

1. **CameraSettingsUI** - Created on F2 keypress
   - Location: `SetupInitializer.js:672`
   - Keybind: F2
   - Dependencies: cameraSettings, cameraController, settingsManager

2. **AudioSettingsUI** - Created on F6 keypress
   - Location: `SetupInitializer.js:887`
   - Keybind: F6
   - Dependencies: audioSettings, audioSystem, settingsManager

3. **VisualEffectSettingsUI** - Created on F7 keypress
   - Location: `SetupInitializer.js:916`
   - Keybind: F7
   - Dependencies: visualEffectSettings, visualEffects, postProcessingManager, cameraSettings

4. **QuickSettingsMenu** - Created on F4 keypress
   - Location: `SetupInitializer.js:845`
   - Keybind: F4
   - Dependencies: systems object

5. **CollectionProgressUI** - Created on F3 keypress
   - Location: `SetupInitializer.js:824`
   - Keybind: F3
   - Dependencies: collectionTracker

### Lazy-Loaded (Other)
6. **EmoteWheel** - Created on Tab keypress
   - Location: `SetupInitializer.js:183`
   - Keybind: Tab
   - Dependencies: avatar

## Components NOT in UIInitializer

These components exist but are not initialized in UIInitializer:

1. **AudioPlayer** - Standalone component, not initialized
2. **UIManager** - Base UI management system, not initialized
3. **UIScalingSystem** - UI scaling system, not initialized
4. **TutorialSystem** - Tutorial system, not initialized
5. **TutorialOverlay** - Tutorial overlay, not initialized
6. **MenuSystem** - Menu system manager, not initialized
7. **BasePanel** - Base class, not instantiated directly
8. **MainMenu** - Screen component, not initialized
9. **SettingsScreen** - Screen component, not initialized
10. **RoomBrowser** - Screen component, not initialized
11. **FriendsList** - Screen component, not initialized
12. **ProfileScreen** - Screen component, not initialized

## Component Dependencies

### Components That Need Systems Set Later
- **VisualizerStylePicker**: visualizer set later
- **VisualRecorderUI**: visualRecorder set later
- **CollectionStreakUI**: streakSystem set later
- **RoomTransitionUI**: roomManager set later
- **ControlsReferenceUI**: keybindManager set later
- **DiscoveryMap**: discoverySystem/roomManager set later
- **ErrlPhone**: systems set via `setSystems()` method

## Initialization Flow

1. **UIInitializer.initialize()** creates base UI components
2. **SetupInitializer.registerKeybinds()** sets up lazy-loaded components
3. **GameInitializer** connects systems to UI components after initialization
4. Components with `setSystems()` or similar methods get their dependencies

## Testing Checklist

### Directly Initialized Components
- [ ] VibeMeter displays and updates
- [ ] VisualizerStylePicker works when visualizer is set
- [ ] NotificationSystem shows notifications
- [ ] CameraIntensityIndicator displays current intensity
- [ ] InteractionPrompt appears near interactable objects
- [ ] InteractionFeedback shows on interactions
- [ ] ControlDock works in dev mode
- [ ] ErrlPhone opens/closes and all tabs work
- [ ] HelpSystem and HelpPanel work
- [ ] ReplayRecordingIndicator shows recording state
- [ ] VisualRecorderUI works when visualRecorder is set
- [ ] CollectionStreakUI displays streaks
- [ ] RoomTransitionUI shows during transitions
- [ ] ControlsReferenceUI displays keybinds
- [ ] DiscoveryMap displays map and rooms

### Lazy-Loaded Components
- [ ] CameraSettingsUI opens on F2
- [ ] AudioSettingsUI opens on F6
- [ ] VisualEffectSettingsUI opens on F7
- [ ] QuickSettingsMenu opens on F4
- [ ] CollectionProgressUI opens on F3
- [ ] EmoteWheel opens on Tab

### Components Not Initialized
- [ ] Verify these are intentionally not initialized
- [ ] Check if they're used elsewhere or deprecated
- [ ] Determine if they should be initialized

## Issues Found

1. **ErrlPhone.setSystems()** - Needs to be called after systems are initialized
2. **Components with late dependencies** - Need verification that dependencies are set
3. **Uninitialized components** - Need to verify if they're used or should be removed

## Recommendations

1. **Add system connection verification** - Check that all components have their dependencies set
2. **Add initialization logging** - Log when components are initialized and when dependencies are set
3. **Review uninitialized components** - Determine if they should be initialized or removed
4. **Add error handling** - Handle cases where dependencies aren't set

