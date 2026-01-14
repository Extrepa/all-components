# Errl FX Lab Modular Refactoring Status

## Completed Modules

1. ✅ `js/utils.js` - Utility functions (beeps, status, helpers)
2. ✅ `js/app.js` - Core app initialization, DOM refs, global state
3. ✅ `js/svg-handler.js` - SVG parsing, normalization, inspector

## Remaining Modules to Create

4. `js/p5-fx.js` - p5.js integration, presets, animation
5. `js/html-fx.js` - CSS filter effects, presets
6. `js/three-d.js` - Three.js wireframe & 3D voxels
7. `js/voxels.js` - 2D voxel rendering
8. `js/capture.js` - Frame capture, gallery, VS mode
9. `js/export.js` - Spritesheets, timelines, animation packs
10. `js/audio.js` - Audio reactive mode, Web Audio API
11. `js/projects.js` - Project save/load from localStorage
12. `js/session.js` - Session snapshot export/import
13. `js/ai-handoff.js` - AI prompt generator
14. `js/command-palette.js` - Command palette UI & search
15. `js/diagnostics.js` - FPS tracking, memory estimation
16. `js/ui.js` - Overlays, navigation, helpers
17. `js/storage.js` - localStorage helpers
18. `js/events.js` - Event handlers
19. `js/keyboard.js` - Keyboard shortcuts
20. `js/sandbox.js` - Sandbox snippet generation
21. `js/fx-dice.js` - FX randomizer

## Next Steps

1. Extract remaining code from `index.html` into modules
2. Update `index.html` to load all modules via `<script>` tags
3. Remove inline JavaScript from `index.html`
4. Test that all features work with modular structure

## Module Dependencies

- All modules depend on `utils.js` and `app.js`
- Modules should use `window.ErrlFX.App.state` for shared state
- Modules should use `window.ErrlFX.Utils` for utility functions
- Modules should access DOM via `window.ErrlFX.App.dom`

