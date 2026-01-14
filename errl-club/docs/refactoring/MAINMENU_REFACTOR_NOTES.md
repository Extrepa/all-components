# MainMenu Refactoring Notes

## Date: 2025-01-XX

## Overview
Refactored `LoadingScreen` component to `MainMenu` component with design system integration.

## Changes Made

### 1. File Rename
- `src/ui/LoadingScreen.js` → `src/ui/MainMenu.js`
- Class name: `LoadingScreen` → `MainMenu`
- Container ID: `loading-screen` → `main-menu`

### 2. Button Text Update
- Old: "READY TO ENTER GAME"
- New: "Start Game"

### 3. Progress Display Logic
- **During loading (< 100%)**: Shows progress bar and progress text, hides button
- **When ready (= 100%)**: Hides progress bar and progress text, shows button
- Progress bar container is completely hidden (display: none) at 100%
- Button is completely hidden (display: none) until 100%

### 4. Design System Integration
MainMenu now uses `DESIGN_SYSTEM` constants:
- Colors: `title`, `text`, `accent`, `border`
- Typography: `fontFamily`
- Spacing: `padding`, `margin`, `gap`
- Borders: `width`, `radius`

### 5. Import Updates
Updated imports in:
- `src/main.js`
- `src/core/GameInitializer.js`
- `src/core/initializers/AudioAndUISystemsInitializer.js`
- `src/core/initializers/UnifiedInitializer.js`
- `src/core/initializers/SettingsInitializationHelper.js`

### 6. Variable Name Updates
- `loadingScreen` → `mainMenu` (all references)
- `loadingScreenUpdateProgress` → `mainMenuUpdateProgress` (parameter names)

### 7. Test Helper Updates
- Updated `tests/helpers/gameHelpers.js`:
  - Looks for `#main-menu` instead of `#loading-screen`
  - Looks for "Start Game" button text instead of "READY"
  - Updated all comments and variable names

### 8. Enter Key Support
- MainMenu maintains Enter key support (keydown handler for 'Enter' and 'Space')
- Test helpers use Enter key to activate button

## Files Modified
1. `src/ui/MainMenu.js` (new file, created from LoadingScreen.js)
2. `src/main.js`
3. `src/core/GameInitializer.js`
4. `src/core/initializers/AudioAndUISystemsInitializer.js`
5. `src/core/initializers/UnifiedInitializer.js`
6. `src/core/initializers/SettingsInitializationHelper.js`
7. `tests/helpers/gameHelpers.js`

## Files Not Modified (Intentionally)
- `src/ui/RoomTransitionUI.js` - Uses different loading screen for room transitions
- `src/scene/RoomTransition.js` - Uses different loading screen for room transitions
- `src/ui/LoadingScreen.js` - Old file, kept for reference (not imported anywhere)

## Verification Checklist
- [x] MainMenu class created and exported
- [x] Design system constants integrated
- [x] Button text changed to "Start Game"
- [x] Progress bar hides at 100%
- [x] Button shows only at 100%
- [x] All imports updated
- [x] All variable references updated
- [x] Test helpers updated
- [x] Enter key support maintained
- [x] DOM element IDs updated
- [x] Error handling updated

## Testing Notes
- Playwright tests should look for `#main-menu` element
- Button text should be "Start Game" (case-insensitive check: "START GAME" or "START")
- Enter key should activate the button
- Progress bar should disappear when loading completes

