# Comprehensive Testing Plan - Errl Club Simulator

## Overview
This document outlines a systematic testing plan for all systems in the Errl Club Simulator before continuing with Chapter 6 development.

```mermaid
flowchart TD
  Unit[Unit/Smoke] --> Integration[Integration (avatar+camera+audio)]
  Integration --> Runtime[Runtime Playthrough]
  Runtime --> Perf[Performance/Memory]
  Perf --> Bugfix[Bug Fix & Re-run]
```

## Testing Methodology
1. **Code Review**: Verify all systems are properly integrated
2. **Runtime Testing**: Test all functionality in the browser
3. **Performance Testing**: Monitor FPS, memory usage, console errors
4. **Integration Testing**: Verify systems work together correctly
5. **Bug Fixing**: Address any issues found

## Test Categories

### 1. Avatar Systems Testing

#### Movement Controls
- [ ] **WASD Movement**
  - W moves forward (toward stage, negative Z)
  - S moves backward (away from stage, positive Z)
  - A moves left (negative X)
  - D moves right (positive X)
  - Movement is smooth with acceleration/deceleration
  - Avatar rotates to face movement direction

- [ ] **Running (Shift + Movement)**
  - Hold Shift while moving to run
  - Running is faster than walking
  - Avatar state changes to 'run'
  - Visual feedback (speed, animation)

- [ ] **Crouching (Ctrl)**
  - Hold Ctrl to crouch
  - Avatar squishes down
  - Movement speed reduced while crouching
  - Avatar state changes appropriately

- [ ] **Hopping/Jumping (Space)**
  - Press Space to hop
  - Avatar jumps up and lands
  - Landing particles appear
  - Jump buffering works (press Space before landing)
  - Can't jump while in air

- [ ] **Dashing (Shift + Space)**
  - Press Shift+Space to dash
  - Dash has cooldown
  - Dash streak particles appear
  - Avatar moves quickly in facing direction

- [ ] **Dancing (Shift + D)**
  - Press Shift+D to trigger random dance
  - Avatar cycles through dance animations
  - Can interrupt dance with movement

#### State Machine
- [ ] State transitions work correctly:
  - idle → walk → run → idle
  - idle → hop → idle
  - idle → dance → idle
  - walk → run (when Shift pressed)
  - run → walk (when Shift released)
  - Any state → sit (when E pressed near seatable)

#### Visual Features
- [ ] Face expressions change with movement
- [ ] Color variants work (randomized on load)
- [ ] Forward indicator (green cone) shows facing direction
- [ ] Shadow renders correctly
- [ ] Glow effects work

#### Physics
- [ ] Avatar doesn't fall through floor
- [ ] Avatar doesn't clip through walls
- [ ] Collision detection works on all surfaces
- [ ] Avatar stays on stage when on stage area

### 2. Camera System Testing

#### Basic Controls
- [ ] **Mouse Orbit**
  - Drag mouse to orbit around avatar
  - Camera follows avatar smoothly
  - No jitter or stuttering

- [ ] **Zoom (Scroll Wheel)**
  - Scroll up to zoom in
  - Scroll down to zoom out
  - Zoom limits work (min/max distance)
  - Camera doesn't clip through geometry

- [ ] **Camera Presets**
  - Press '1' for normal preset
  - Press '2' for intimate preset
  - Press '3' for wide preset
  - Presets transition smoothly

- [ ] **Camera Snap (R key)**
  - Press R to snap camera behind avatar
  - Instant repositioning
  - Camera aligns correctly

#### Advanced Camera Modes
- [ ] **Cinematic Mode (C key)**
  - Press C to toggle cinematic mode
  - Camera follows smooth cinematic path
  - Works correctly with avatar movement

- [ ] **Freecam Mode (F key)**
  - Press F to toggle freecam
  - WASD moves camera independently
  - Mouse controls camera rotation
  - Can exit freecam mode

- [ ] **Lock-on Mode (L key)**
  - Press L to toggle lock-on
  - Locks onto nearest interactable or avatar
  - Camera follows target smoothly
  - Can exit lock-on mode

#### Auto-alignment
- [ ] Camera auto-aligns after movement stops
- [ ] Auto-align delay works correctly
- [ ] Smooth transitions

### 3. Input System Testing

#### Keyboard Controls
- [ ] All movement keys work (W, A, S, D)
- [ ] Modifier keys work (Shift, Ctrl)
- [ ] Space for hop
- [ ] Shift+Space for dash
- [ ] Shift+D for dance
- [ ] E for interact/sit
- [ ] Q for throw drip
- [ ] Tab for emote wheel
- [ ] T for replay record/stop
- [ ] G for ghost spawn
- [ ] Y for teleport
- [ ] B for blackout event
- [ ] Shift+S for strobe event
- [ ] Shift+W for wave event
- [ ] 1, 2, 3 for camera presets
- [ ] R for camera snap
- [ ] C, L, F for camera modes
- [ ] No input conflicts

#### Mouse Controls
- [ ] Mouse drag for camera orbit
- [ ] Scroll wheel for zoom
- [ ] Mouse doesn't interfere with keyboard

### 4. Particle Systems Testing

- [ ] **Dust Particles**
  - Appear when walking/running
  - Clean up properly (no memory leaks)
  - Visual quality is good

- [ ] **Landing Particles**
  - Appear when avatar lands from hop
  - Multiple particles spawn
  - Clean up properly

- [ ] **Dash Streak Particles**
  - Appear during dash
  - Follow dash direction
  - Clean up properly

- [ ] **General Particle Behavior**
  - Particles fade out correctly
  - No performance issues with many particles
  - No visual glitches

### 5. Collision System Testing

- [ ] **Wall Collisions**
  - Avatar stops at walls
  - Avatar slides along walls when moving diagonally
  - No clipping through walls

- [ ] **Floor Collision**
  - Avatar stays on floor
  - Avatar doesn't fall through
  - Stage height works correctly

- [ ] **Stage Boundaries**
  - Avatar can move on and off stage
  - Stage collision works correctly

- [ ] **Object Collisions**
  - Collision with interactive objects
  - Collision with collectibles (should collect, not collide)
  - Collision with pushable props

### 6. Collectibles System Testing

- [ ] **Drips**
  - Spawn around room
  - Can be collected by touching
  - Visual feedback on collection
  - Respawn or have proper limits

- [ ] **Bubbles**
  - Float around room
  - Can be popped by touching
  - Visual/audio feedback on pop
  - Respawn or have proper limits

- [ ] **Fragments**
  - Spawn (rarer than drips)
  - Can be collected
  - Progress bar updates
  - Fragment count displays correctly

- [ ] **Glow Balls**
  - Spawn (power-up collectible)
  - Apply effects when collected
  - Visual feedback
  - Effects work correctly

### 7. Interactive Objects Testing

- [ ] **Doors**
  - Open when avatar approaches
  - Close when avatar moves away
  - Animation is smooth
  - Multiple doors work independently

- [ ] **Teleporters**
  - Activate when avatar steps on
  - Teleport avatar to target location
  - Visual effects during teleport
  - Multiple teleporters work

- [ ] **Fog Vents**
  - Puff fog based on bass energy
  - Visual effects work
  - Multiple vents work independently

- [ ] **Seatable Objects**
  - Can sit with E key when near
  - Can stand with E key when sitting
  - Sit animation plays
  - Multiple seats work

- [ ] **Moving Platforms**
  - Move between positions
  - Avatar can ride platforms
  - Collision detection works
  - Multiple platforms work

- [ ] **Ventilation Fans**
  - Spin continuously
  - Nudge avatar when touched
  - Collision detection works
  - Multiple fans work

- [ ] **Interactive Screens**
  - Change patterns when clicked
  - Visual feedback
  - Multiple screens work

- [ ] **Camera Console**
  - Switches camera viewpoints
  - Unique viewpoints work
  - Can exit console mode

- [ ] **Lighting Console**
  - Toggles lighting effects
  - Effects apply correctly
  - Multiple toggles work

- [ ] **Portal Rifts**
  - Swirling shader effects
  - Can teleport through
  - Visual effects work

- [ ] **Pushable Props**
  - Can be pushed by avatar
  - Physics work correctly
  - Multiple props work

- [ ] **Throwable Drips (Q key)**
  - Can throw drip orbs
  - Splat decals appear on impact
  - Physics work correctly

### 8. UI Systems Testing

- [ ] **Emote Wheel (Tab key)**
  - Opens/closes with Tab
  - All 8 emotes visible
  - Can select emotes
  - Emotes trigger correctly
  - Wheel closes after selection

- [ ] **Fragment Progress Bar**
  - Displays when fragments collected
  - Progress updates correctly
  - Fragment count displays
  - Visual styling is correct

- [ ] **Interaction Reticle**
  - Appears when targeting interactable
  - Disappears when not targeting
  - Position is correct (center of screen)
  - Visual styling is correct

- [ ] **UI Doesn't Block Gameplay**
  - UI elements don't interfere with controls
  - UI is responsive
  - No visual glitches

### 9. Audio System Testing

- [ ] **Footstep Sounds**
  - Play during movement
  - Different sounds for floor/stage
  - Timing matches stride
  - Volume is appropriate

- [ ] **Distance-Based Volume**
  - Volume changes with camera distance from center
  - Volume decreases at distance
  - Volume increases when close
  - Smooth transitions

- [ ] **Beat Detection**
  - BeatDetector initializes correctly
  - Detects beats from audio
  - BPM estimation works
  - Triggers world reactions on beats

- [ ] **Audio Context**
  - Initializes on user interaction
  - No audio errors in console
  - Audio analysis works

### 10. Visual Effects Testing

- [ ] **Event System**
  - Blackout event (B key) works
  - Strobe event (Shift+S) works
  - Wave event (Shift+W) works
  - Smoke bursts work
  - Events don't conflict

- [ ] **Visual Effects**
  - Distortion rings work
  - Goo trails work
  - Laser beams work
  - Hallucination zones work
  - Effects don't cause performance issues

- [ ] **Audio-Reactive Effects**
  - Lighting reacts to bass
  - Fog reacts to bass
  - Effects sync with audio

### 11. Replay and Teleport Systems Testing

- [ ] **Replay System**
  - T key starts/stops recording
  - Records avatar movement
  - G key spawns ghost
  - Ghost replays movement
  - Multiple ghosts work

- [ ] **Teleport System**
  - Y key teleports to nearest anchor
  - Teleport anchors work
  - Respawn points work
  - Avatar respawns if falls below floor

### 12. World State Reactor Testing

- [ ] **Beat Reactions**
  - Reacts to detected beats
  - Minor reactions every 4 beats
  - Major reactions every 16 beats
  - Strong bass reactions work

- [ ] **Interaction Reactions**
  - Reacts to interactions
  - Environment changes work
  - Multiple reactions don't conflict

### 13. Performance Testing

- [ ] **FPS Performance**
  - FPS stays above 60fps
  - No significant drops
  - Performance is consistent

- [ ] **Memory Leaks**
  - No memory leaks over time
  - Objects clean up properly
  - Particle cleanup works
  - No growing object counts

- [ ] **Console Errors**
  - No errors in console
  - No warnings (except expected ones)
  - All systems initialize correctly

- [ ] **Performance with Many Objects**
  - Performance with many collectibles
  - Performance with multiple effects
  - Performance with many particles

### 14. Integration Testing

- [ ] **Systems Work Together**
  - All systems initialize in correct order
  - No initialization conflicts
  - Systems communicate correctly
  - No race conditions

- [ ] **Edge Cases**
  - Rapid key presses
  - Multiple simultaneous actions
  - Extreme camera positions
  - Avatar at room boundaries

## Testing Execution Plan

1. **Phase 1: Code Review** (Completed)
   - Review all code for obvious issues
   - Verify integrations
   - Check for missing features

2. **Phase 2: Basic Functionality** (In Progress)
   - Test avatar movement
   - Test camera controls
   - Test basic interactions

3. **Phase 3: Advanced Features**
   - Test collectibles
   - Test interactive objects
   - Test visual effects

4. **Phase 4: Performance & Polish**
   - Performance testing
   - Memory leak testing
   - Console error checking

5. **Phase 5: Bug Fixing**
   - Fix any issues found
   - Re-test fixed features
   - Document fixes

## Issues Found

### Critical Issues
- None yet

### Major Issues
- None yet

### Minor Issues
- None yet

### Missing Features
- None yet

## Next Steps After Testing

1. Fix any critical/major issues found
2. Document all fixes
3. Continue with Chapter 6 development
4. Re-test after Chapter 6 completion
