# Complete Keybinds Reference

**Last Updated**: December 10, 2025  
**Status**: Complete Reference

## Overview

This document provides a comprehensive reference of all keyboard shortcuts and keybinds available in Errl Club. Keybinds are organized by category for easy reference.

## Movement & Camera

| Keybind | Action | Description |
|---------|--------|-------------|
| `W` `A` `S` `D` | Move | Move avatar forward/left/backward/right |
| `Shift` | Run | Hold to run (faster movement) |
| `Ctrl` | Crouch | Hold to crouch (slower movement) |
| `Space` | Jump/Hop | Jump or hop |
| `Shift + Space` | Dash | Dash forward |
| `R` | Snap Camera | Snap camera behind avatar |
| `1` | Camera Preset 1 | Normal camera preset |
| `2` | Camera Preset 2 | Intimate camera preset |
| `3` | Camera Preset 3 | Wide camera preset |
| `C` | Camera Mode | Toggle camera mode |
| `F` | Follow Mode | Toggle follow camera mode |
| `L` | Lock Camera | Toggle camera lock |

## Interactions

| Keybind | Action | Description |
|---------|--------|-------------|
| `E` | Interact | Interact with objects/items |
| `Q` | Use Item | Use equipped item |
| `Tab` | Inventory | Toggle inventory/collection view |

## Visual Effects & Modes

| Keybind | Action | Description |
|---------|--------|-------------|
| `U` | UV/Blacklight Mode | Toggle UV/blacklight visual mode |
| `V` | Visualizer Style | Toggle visualizer style picker |
| `Shift + G` | Glitch Mode | Toggle glitch visual effect |
| `I` | Color Inversion | Trigger color inversion flash |
| `Ctrl + R` | Rest Mode | Toggle rest mode (reduces particles/intensity) |

## Events & Effects

| Keybind | Action | Description |
|---------|--------|-------------|
| `B` | Blackout Event | Trigger blackout event |
| `Shift + S` | Strobe Event | Trigger strobe event |
| `Shift + W` | Wave Event | Trigger wave event |
| `Shift + D` | Dance | Trigger dance emote |

## UI & Menus

| Keybind | Action | Description |
|---------|--------|-------------|
| `F1` | Debug Info | Toggle debug overlay (FPS, stats) |
| `F2` | Debug Overlay | Toggle 3D debug overlay |
| `F3` | Collection Progress | Open collection progress UI |
| `F4` | Quick Settings | Toggle quick settings menu |
| `F5` | Restart Tutorial | Restart tutorial system |
| `F6` | Audio Settings | Open audio settings UI |
| `?` or `Shift + F1` | Controls Help | Show controls help |
| `Escape` | Close Menus | Close open menus/panels |
| `Ctrl + D` | Dev Menu | Toggle development menu |
| `Ctrl + G` | Collection Goals | Toggle collection goals UI |
| `Ctrl + Shift + A` | Asset Attribution | Toggle asset attribution panel |
| `Ctrl + L` | Replay Library | Toggle replay library UI |

## Replay & Recording

| Keybind | Action | Description |
|---------|--------|-------------|
| `T` | Toggle Replay Recording | Start/stop replay recording |
| `G` | Spawn Ghost Replay | Spawn ghost replay from recording |
| `Y` | Play Replay | Play recorded replay |
| `Ctrl + R` | Visual Recording | Toggle visual recording (note: conflicts with Rest Mode) |

## Codex Features

| Keybind | Action | Description |
|---------|--------|-------------|
| `Ctrl + R` | Rest Mode | Toggle rest mode for Codex assets |
| `Ctrl + Shift + A` | Asset Attribution | View Codex asset credits |
| `Ctrl + G` | Collection Goals | View collection goals (includes Codex collectibles) |

## Debug & Development

| Keybind | Action | Description |
|---------|--------|-------------|
| `Ctrl + D` | Dev Menu | Open development menu |
| `F1` | Debug Overlay | Toggle FPS and stats overlay |
| `F2` | Debug 3D Overlay | Toggle 3D visual debugging |
| `Ctrl + G` | Collection Goals | Collection goals UI (dev feature) |
| `Ctrl + L` | Replay Library | Replay library UI (dev feature) |

## Keybind Conflicts

### Known Conflicts
- **`Ctrl + R`**: Used for both Rest Mode and Visual Recording
  - **Resolution**: Rest Mode takes priority for Codex features
  - **Workaround**: Use visual recorder UI for recording controls

### Modifier Key Combinations
- **`Ctrl + [Key]`**: System/UI controls
- **`Shift + [Key]`**: Event triggers and special actions
- **`Alt + [Key]`**: Currently unused (available for future features)

## Keybind Customization

### Current Status
- Keybinds are defined in `src/config/KeybindSettings.js`
- Default keybinds are stored in `SettingsManager`
- Customization UI: Planned for future release

### Default Keybinds Storage
Keybinds are persisted in `localStorage` under the `keybinds` key via `SettingsManager`.

## Quick Reference by Category

### Essential Controls
- **Movement**: `W` `A` `S` `D`, `Shift` (run), `Space` (jump)
- **Camera**: `R` (snap), `1` `2` `3` (presets)
- **Interact**: `E`

### Visual Effects
- **Modes**: `U` (UV), `V` (visualizer), `Shift + G` (glitch)
- **Events**: `B` (blackout), `Shift + S` (strobe), `Shift + W` (wave)

### UI Access
- **Menus**: `F3` (collection), `F4` (settings), `F6` (audio)
- **Help**: `?` or `Shift + F1` (controls help)
- **Debug**: `F1` (stats), `F2` (3D debug), `Ctrl + D` (dev menu)

### Codex Features
- **Rest Mode**: `Ctrl + R`
- **Asset Info**: `Ctrl + Shift + A`
- **Collection Goals**: `Ctrl + G`
- **Replay Library**: `Ctrl + L`

## Tips

1. **Help System**: Press `?` or `Shift + F1` to see all controls in console
2. **Camera Presets**: Use `1`, `2`, `3` to quickly switch camera styles
3. **Rest Mode**: Use `Ctrl + R` to reduce visual intensity for a calmer experience
4. **Debug Tools**: `F1` and `F2` are useful for performance monitoring
5. **Quick Access**: `F4` provides quick access to common settings

## Related Documentation

- **Codex Features Guide**: `docs/CODEX_FEATURES_GUIDE.md` - Codex-specific keybinds
- **Player Workflows**: `docs/PLAYER_WORKFLOWS.md` - Workflow-based keybind usage
- **Keybind Settings**: `src/config/KeybindSettings.js` - Keybind configuration

## Future Enhancements

- [ ] Keybind customization UI
- [ ] Keybind conflict detection
- [ ] Keybind presets (gamer, casual, accessibility)
- [ ] Context-sensitive keybind hints
- [ ] Keybind search/filter in help system

---

**Note**: This reference is updated as new keybinds are added. Check the codebase for the most current keybind definitions.

