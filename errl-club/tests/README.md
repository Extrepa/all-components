# Playwright Test Suite

Comprehensive end-to-end test coverage for the Errl Club Simulator.

## Test Files

### Main Application Flow Tests

1. **`app.spec.js`** - Main Application Flow Tests
   - Application startup and initialization
   - Navigation through UI menus
   - Component rendering across states
   - Complete user interaction workflows
   - Critical path testing
   - Edge cases and error handling
   - Performance testing

### Core System Tests

2. **`ui-systems.spec.js`** - UI System Tests
   - Camera Settings UI (Shift+C, Ctrl+I, presets)
   - Quick Settings Menu (F4)
   - Collection Progress UI (F3)
   - Tutorial System (F5)
   - Audio Settings UI (F6)
   - Interaction Prompts & Feedback
   - Visual Preferences (U, V, Shift+G)

### Avatar System Tests

3. **`avatar-systems.spec.js`** - Avatar System Tests
   - Movement (WASD, Shift+WASD, Ctrl, Space, Shift+Space, Shift+D)
   - Color Variants (25 variants, randomization, changes)
   - Camera Controls (mouse drag, scroll, R, C, F, L, 1/2/3)
   - Avatar Interactions (E, Tab)

### Collectibles System Tests

4. **`collectibles.spec.js`** - Collectibles System Tests
   - Collection Tracking
   - Fragment Progression
   - Collection Events
   - Collection UI

### Achievement System Tests

5. **`achievements.spec.js`** - Achievement System Tests
   - Achievement System Initialization
   - Achievement Tracking
   - Achievement Notifications
   - Achievement Persistence

### Interaction System Tests

6. **`interactions.spec.js`** - Interaction System Tests
   - Interaction System
   - Teleporter (Y key)
   - Replay System (T, G)
   - Visual Recorder (Ctrl+R)

### Visual Effects Tests

7. **`visual-effects.spec.js`** - Visual Effects Tests
   - Post-Processing
   - Visual Modes (UV, visualizer, glitch)
   - Visual Events (blackout, strobe, wave, inversion)
   - Vibe Meter

### Settings Persistence Tests

8. **`settings-persistence.spec.js`** - Settings Persistence Tests
   - Settings Manager
   - Camera Settings Persistence
   - Visual Preferences Persistence
   - Audio Settings Persistence
   - Tutorial Persistence
   - Achievement Persistence
   - Collection Progress Persistence

### Integration Tests

9. **`integration.spec.js`** - Integration Tests
   - System Integration
   - Event Bus Integration
   - Settings Integration
   - UI Integration
   - Game Loop Integration

### Network Tests

10. **`connection.spec.js`** - Network/Multiplayer Tests
   - Network Connection
   - Connection Failure Handling
   - Multiplayer Connection
   - Player Detection

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/e2e/ui-systems.spec.js

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Run tests and show report
npm test && npm run test:report
```

## Test Helpers

Located in `tests/helpers/`:

- **`gameHelpers.js`** - Game interaction utilities
  - `waitForGameReady()` - Wait for game initialization
  - `moveAvatar()` - Move avatar with WASD
  - `pressKey()` - Press keyboard keys
  - `clickCanvas()` - Click on canvas
  - `dragCanvas()` - Drag on canvas
  - `scrollCanvas()` - Zoom with scroll
  - `getAvatarPosition()` - Get avatar position
  - `getAvatarState()` - Get avatar state
  - `waitForUI()` - Wait for UI element

- **`networkHelpers.js`** - Network testing utilities
  - `waitForNetworkConnection()` - Wait for network
  - `getNetworkState()` - Get network state
  - `getRemotePlayerCount()` - Get remote player count

- **`assertionHelpers.js`** - Custom assertions
  - `expectNetworkConnected()` - Assert network connected
  - `expectPlayerCount()` - Assert player count

- **`multiplayerHelpers.js`** - Multiplayer test utilities
  - `createMultiplayerContexts()` - Create multiple contexts
  - `navigateAllPages()` - Navigate all pages
  - `waitForAllGamesReady()` - Wait for all games

## Test Coverage

### ✅ Covered Systems

- **UI Systems**: All major UI components
- **Avatar Systems**: Movement, color variants, camera
- **Collectibles**: Collection tracking, progression
- **Achievements**: Achievement system
- **Interactions**: Interaction system, teleporter, replay
- **Visual Effects**: Post-processing, visual modes, events
- **Settings**: Persistence across all systems
- **Integration**: System integration, event bus, game loop
- **Network**: Connection and multiplayer
- **Codex Assets**: Asset loading, visibility, interactions, audio-reactive features
- **Audio-Reactive Features**: Portal rifts, chromatic fog, spark trails, laser ribbons, asset reactions
- **Post-Processing Presets**: All 5 presets (off, low, medium, high, ultra)
- **Particle Presets**: All 6 presets (off, minimal, subtle, normal, intense, extreme)
- **Screen Effects Presets**: All 6 presets (off, minimal, subtle, normal, intense, extreme)
- **GraphicsSettings Integration**: Unified preset coordination across all systems
- **Performance Monitoring**: FPS tracking, asset metrics, optimization
- **Camera Audio-Reactive**: Frequency band mapping, audio-reactive camera movements
- **Visual Effect Settings**: All preset selectors and intensity controls
- **Quick Settings Menu**: Graphics quality, camera, audio controls

### Test Strategy

1. **Existence Tests**: Verify systems exist and are initialized
2. **Functionality Tests**: Test keybinds and interactions
3. **Integration Tests**: Test system interactions
4. **Persistence Tests**: Test settings persistence
5. **Error Handling**: Test graceful failure handling

## Writing New Tests

When adding new features, add tests to the appropriate spec file:

1. **UI Features** → `ui-systems.spec.js`
2. **Avatar Features** → `avatar-systems.spec.js`
3. **Game Mechanics** → Create new spec file or add to existing
4. **New Systems** → Create new spec file

### Test Template

```javascript
import { test, expect } from '@playwright/test';
import { waitForGameReady } from '../helpers/gameHelpers.js';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGameReady(page);
    await page.waitForTimeout(1000);
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    const canvas = page.locator('#club-canvas');
    await expect(canvas).toBeVisible();
  });
});
```

## Documentation

For comprehensive testing guidelines, see:
- **Playwright Testing Guide**: `docs/testing/PLAYWRIGHT_TESTING_GUIDE.md`
  - Setup and installation
  - Writing tests
  - Best practices
  - Debugging
  - CI/CD integration
  - Troubleshooting

## Notes

- Tests use `window.gameSystems` to access game systems
- Tests check for element existence rather than exact behavior (for flexibility)
- Tests include fallback checks for elements that might not always be visible
- All tests verify canvas visibility as a basic sanity check

