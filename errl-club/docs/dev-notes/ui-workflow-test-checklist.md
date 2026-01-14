# UI Workflow Test Checklist

## Game Initialization Flow
- [ ] Loading screen appears
- [ ] "PREPARING GAME..." button shows (disabled)
- [ ] Button changes to "READY?" when ready
- [ ] Clicking "READY?" starts game
- [ ] Loading screen disappears
- [ ] Canvas is visible
- [ ] No WebGL errors in console
- [ ] Avatar is visible with name label

## Errl Phone UI Workflow
- [ ] Phone starts as collapsed bubble
- [ ] Clicking bubble expands phone
- [ ] All 4 tabs present: Menu, Map, Avatar, Inventory
- [ ] Tab navigation works
- [ ] Vibe bar visible in header
- [ ] Clicking header collapses phone
- [ ] Clicking outside collapses phone
- [ ] Close button works (if present)

## Settings Workflow
- [ ] QuickSettingsMenu opens (keybind: ?)
- [ ] All sections visible: Camera, Visual Effects, Audio, Graphics
- [ ] Sliders work and update values
- [ ] Dropdowns work
- [ ] Settings persist after reload
- [ ] Camera Settings UI opens (keybind: Ctrl+C)
- [ ] Audio Settings UI opens (from QuickSettingsMenu)
- [ ] Visual Effects Settings UI opens (from QuickSettingsMenu)

## Help & Controls Workflow
- [ ] Help panel opens (keybind: H)
- [ ] Search works in help panel
- [ ] Controls Reference UI opens (keybind: K)
- [ ] All keybinds displayed correctly
- [ ] Panels close properly

## Camera Controls
- [ ] Camera preset keys work (1, 2, 3)
- [ ] Shift+1/2/3 for intensity presets
- [ ] Ctrl+I cycles intensity
- [ ] I key triggers color inversion
- [ ] R key snaps camera behind avatar
- [ ] C key toggles cinematic mode
- [ ] F key toggles freecam
- [ ] L key toggles lock-on

## Movement Controls
- [ ] WASD movement works
- [ ] Space for jump/hop
- [ ] Shift+Space for dash
- [ ] Ctrl for crouch (if not in zero-gravity)
- [ ] Space/Ctrl for vertical movement in zero-gravity rooms
- [ ] Shift+D for dance
- [ ] Tab for emote wheel

## Interaction Controls
- [ ] E key interacts with objects
- [ ] Interaction prompt appears near objects
- [ ] Q key throws drip orb
- [ ] Seating works (E on seatable objects)

## Visual Effects
- [ ] B key triggers blackout
- [ ] Shift+S triggers strobe
- [ ] Shift+W triggers wave
- [ ] Visual effects apply correctly

## Recording & Replay
- [ ] T key toggles replay recording
- [ ] G key spawns ghost replay
- [ ] Visual recording works (keybind: ?)
- [ ] Recording indicators visible

## Discovery Map
- [ ] M key opens discovery map
- [ ] Room list displays
- [ ] Statistics display
- [ ] Map navigation works

## Error Scenarios
- [ ] WebGL errors handled gracefully
- [ ] Post-processing disables on texture errors
- [ ] User notified when post-processing disabled
- [ ] Game continues without post-processing
- [ ] No console errors during normal operation

