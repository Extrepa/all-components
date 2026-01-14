# Feature Framework Verification

Use this checklist whenever you revisit Errl Club so you can be confident each systems’ controller, toggle, and dev surface still exists before you dive into testing.

## UI & Activation Controls
| Feature | Controller | How to exercise |
| --- | --- | --- |
| Vibe Meter milestones | `src/ui/VibeMeter.js` | The HUD now shows milestone name, reward text, and a progress bar below the meter (`#vibe-next-progress`). Watch these fields change as movement, dancing, or bass-reactive boosts drive `VibeMeter` levels. |
| Visual effect presets | `src/ui/ControlDock.js`, `src/ui/QuickSettingsMenu.js`, `src/ui/VisualEffectSettingsUI.js` | The bottom dock exposes drawers for “Interaction & Effects” and “Settings”. Open those drawers, toggle the Quick Settings tiles, or open Visual Effect Settings (`F4`/control dock) to adjust UV, glitch, bloom, distortion, and chromatic sliders while the composer runs. |
| Camera controls | `src/ui/ControlDock.js` | Buttons (“Reset”, “Intimate”, “Wide”, “Look Behind”) call `cameraController` presets. Use them or bound keys/backbone (e.g., `Shift+C`, `F3`) to ensure the camera behaves and the `CameraIntensityIndicator` updates. |
| Fragment progress | `src/ui/ControlDock.js` + `src/core/UpdateManager.js` | `fragment-progress` progress bar and helper text render below the dock when collectibles are collected; the update loop in `UpdateManager.updateCollectibles` keeps the UI in sync. |

## Dev/Test Instrumentation
- **Debug commands** (`src/dev/DebugCommands.js`): open the console and use `window.debug` (e.g., `window.debug.moveTo(5,1,-3)`, `window.debug.toggleDebug()`, `window.debug.testMovement()`) to teleport, rig speeds, toggle overlays, and log state.
- **Multiplayer manager hooks** (`src/network/MultiplayerManager.js`): the `multiplayerManager` living in `systems.multiplayerManager` subscribes to `player.*` events, exposes `syncLocalState()` from the UpdateManager, and can be wired to `window.networkConfig` before init. When a network config is provided, it automatically emits `player.joined/player.updated` via `NetworkEventBus`.

## Manual Check Routine
1. Launch `npm run dev`, open the console, and confirm `window.gameSystems`, `window.stateManager`, and `window.eventBus` are populated (GameInitializer log).
2. Use `controlDock` drawers to toggle each drawer’s buttons, then verify the corresponding system (audio effects, interactions, settings managers) receives the update.
3. Trigger a vibe milestone (dance, move fast, or manually `systems.vibeMeter.addVibe(0.6)` from console) to confirm the milestone label, reward text, and progress bar all refresh.
4. If multiplayer config is available, set `window.networkConfig`, refresh, and watch `systems.multiplayerManager` emit `player.joined` in the console; use `window.debug.moveTo()` to reposition and confirm the avatar state flows through the new manager.

## Notes
- Every UI surface now routes through a shared `ControlDock`/keybind manager, making it easy to prove that each button, slider, and drawer exists before testing.  
- Keep the HUD/Control Dock visible when validating so you can match physical buttons to code paths.  
