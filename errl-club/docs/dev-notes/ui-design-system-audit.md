# UI Design System Audit

This document tracks the status of all UI components and their alignment with the central design system (`src/ui/designSystem.js`).

## Design System Status

### ✅ Components Using Design System
- `BasePanel.js` - Base class, uses design system
- `InteractionPrompt.js` - Fully migrated to design system
- `NotificationSystem.js` - Uses design system
- `TutorialOverlay.js` - Uses design system
- `HelpPanel.js` - Extends BasePanel, search input updated to design system
- `QuickSettingsMenu.js` - All sections updated to use design system
- `VisualEffectSettingsUI.js` - Fully migrated to design system
- `InputField.js` - Fully migrated to design system
- `ReadyPrompt.js` - Fully migrated to design system
- `Button.js` - Uses design system
- `Dropdown.js` - Uses design system
- `Slider.js` - Uses design system
- `Modal.js` - Uses design system
- `ControlDock.js` - Uses design system
- `CollectionProgressUI.js` - Uses design system
- `AudioSettingsUI.js` - Fully migrated to design system (Round 3)
- `CameraSettingsUI.js` - Fully migrated to design system (Round 3)
- `VisualizerStylePicker.js` - Fully migrated to design system (Round 3)
- `VisualRecorderUI.js` - Fully migrated to design system (Round 4)
- `ControlsReferenceUI.js` - Fully migrated to design system (Round 4)
- `CollectionStreakUI.js` - Borders updated to design system (Round 4)
- `DiscoveryMap.js` - Fully migrated to design system (Round 4)
- `RoomTransitionUI.js` - Text colors updated to design system (Round 4)
- `AudioPlayer.js` - Fully migrated to design system (Round 4)
- `ReplayRecordingIndicator.js` - Text colors updated to design system (Round 4)
- `CameraIntensityIndicator.js` - Fully migrated to design system (Round 4)
- `MainMenu.js` - Uses Button components (already using design system)
- `SettingsScreen.js` - Fully migrated to design system (Round 4)
- `RoomBrowser.js` - Fully migrated to design system (Round 4)
- `FriendsList.js` - Fully migrated to design system (Round 4)
- `ProfileScreen.js` - Fully migrated to design system (Round 4)

### ✅ Manager Classes (No Styles Needed)
- `MenuSystem.js` - Screen manager class, no UI rendering (verified 2025-01-07)

### ✅ Intentional Custom Styles (Verified 2025-01-07)
- `EmoteWheel.js` - Radial menu with intentional custom styles for circular layout
- `ErrlLoader.js` - Animated loader with intentional custom styles for animation
- `VibeMeter.js` - Has hardcoded styles (UI moved to ErrlPhone, logic only)

### 🧩 Component Library (in `components/`)
- `Button.js` - ✅ Uses design system
- `Dropdown.js` - ✅ Uses design system
- `InputField.js` - ✅ Fully migrated to design system
- `Modal.js` - ✅ Uses design system
- `Slider.js` - ✅ Uses design system
- `VibesLiquidBar.js` - Custom component, intentional custom styles
- `VibesMarquee.js` - Custom component, intentional custom styles

## Priority for Updates

### High Priority (User-Facing, Frequently Used)
1. ✅ `ControlDock.js` - Main control interface (dev mode only) - COMPLETE
2. ✅ `VisualEffectSettingsUI.js` - Settings panel - COMPLETE (Round 3)
3. ✅ `QuickSettingsMenu.js` - Quick access menu - COMPLETE
4. ✅ `CollectionProgressUI.js` - Progress tracking - COMPLETE
5. ✅ `AudioSettingsUI.js` - Audio settings panel - COMPLETE (Round 3)
6. ✅ `CameraSettingsUI.js` - Camera settings panel - COMPLETE (Round 3)

### Medium Priority (Less Frequently Used)
5. `DiscoveryMap.js` - Map interface
6. `RoomTransitionUI.js` - Transition screens
7. `VisualRecorderUI.js` - Recording interface
8. `AudioSettingsUI.js` - Audio settings
9. `CameraSettingsUI.js` - Camera settings

### Low Priority (Specialized or Infrequent)
10. ✅ `MenuSystem.js` - Menu system (manager class, no styles needed) - VERIFIED
11. ✅ `ReadyPrompt.js` - Ready prompt - COMPLETE
12. ✅ `ReplayRecordingIndicator.js` - Replay indicator - COMPLETE (verified 2025-01-07)
13. ✅ Screen components in `screens/` directory - COMPLETE (Round 4)

### Intentional Custom Styles (No Update Needed)
- `ErrlPhone.js` - Phone has intentional custom design
- `LoadingScreen.js` - Loading screen has intentional custom design
- `VibesLiquidBar.js` - Custom visual component
- `VibesMarquee.js` - Custom visual component
- `VibeMeter.js` - UI moved to ErrlPhone, logic only

## Verification Status (2025-01-07)

All components verified:
- ✅ `MenuSystem.js` - Confirmed: Manager class, no styled UI elements
- ✅ `ReplayRecordingIndicator.js` - Confirmed: Fully migrated, uses DESIGN_SYSTEM throughout
- ✅ `CameraIntensityIndicator.js` - Confirmed: Fully migrated, uses DESIGN_SYSTEM throughout

**Migration Status**: ~98% complete. Only intentional custom styles and a few unverified components remain.

## Implementation Strategy

1. **Update High Priority Components First**
   - Refactor to use `DESIGN_SYSTEM` constants
   - Use `generatePanelStyles()` and `generateTitleStyles()` helpers
   - Maintain existing functionality while improving consistency

2. **Create Component-Specific Overrides**
   - Some components may need slight variations
   - Use design system as base, override only when necessary
   - Document any intentional deviations

3. **Test After Each Update**
   - Verify visual consistency
   - Ensure functionality remains intact
   - Check responsive behavior

## Notes

- Components that extend `BasePanel` automatically get design system styles
- Some components have intentional custom designs (phone, loading screen)
- Focus on user-facing components first
- Dev-only components (like ControlDock) are lower priority but should still be updated

