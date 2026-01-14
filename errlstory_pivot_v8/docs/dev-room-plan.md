# ErrlStory Dev Room Implementation Plan

## Overview

The Dev Room is a secret debug/testing chamber that provides rapid development tools, combat testing, performance monitoring, and nostalgic Flash-era debug features. This document outlines the phased implementation plan.

---

## Access Methods (Multiple Creative Options)

### Method 1: The Version Glitch (Title Screen)
**Flash-era classic easter egg:**
- On the Title Screen, rapidly click the version number (`v0.1.1...`) in the bottom-right **7 times** within 3 seconds
- Screen "glitches" with a flash effect and error-like text: `[DEV_MODE_ACTIVATED]`
- Teleports directly to Dev Room
- **Visual feedback:** Version number flickers red/cyan, screen shakes slightly

### Method 2: The Hidden Wall (Town Scene)
**MapleStory Hidden Street vibes:**
- In Town Scene, walk to the **left wall** at exactly **Y position 300-350**
- Hold `Shift` (dash) and walk into the wall for 2 seconds
- Wall becomes semi-transparent, revealing a hidden passage
- Walk through to enter Dev Room
- **Visual feedback:** Wall shimmers with a cyan glow when you're in the right spot

### Method 3: The Secret Dance (Any Scene)
**Konami Code meets movement:**
- Perform this exact sequence within 5 seconds:
  1. Jump 3 times (Space x3)
  2. Dash Left (Shift + A)
  3. Jump once
  4. Dash Right (Shift + D)
  5. Jump 3 more times
- A floating text appears: `"The Debugger's Ritual Complete"`
- Screen fades to Dev Room
- **Visual feedback:** Each step creates a particle trail, final jump spawns a portal

### Method 4: The Triple-Title Tap (Title Screen)
**Simple but hidden:**
- On Title Screen, rapidly click the **"ERRLSTORY"** title text **3 times**
- Title glitches and splits into debug-style text
- Dev Room portal appears below
- **Visual feedback:** Title text distorts with scanline effect

### Method 5: The Elder's Secret (Town Scene)
**NPC interaction easter egg:**
- Stand next to **Elder Errl**
- Rapidly press `W` (interact) **10 times** within 2 seconds
- Elder says: `"Ah, you've found the secret path, developer..."` (only if you've done this before, otherwise just unlocks)
- Dev Room portal spawns next to Elder
- **Visual feedback:** Elder's marker flashes rainbow colors

### Method 6: The Slime Ritual (Field Scene)
**Thematic to the game:**
- Collect exactly **7 Goo Bits** (no more, no less)
- Jump **7 times** in place without moving horizontally
- A giant slime appears and "swallows" you, teleporting to Dev Room
- **Visual feedback:** Goo bits orbit around player, slime spawns with particle burst

### Recommended Primary Method:
**Method 1 (Version Glitch)** - Most nostalgic, easiest to discover accidentally, fits Flash-era perfectly.

---

## Phase 1: Core Infrastructure (Foundation)

### 1.1 Dev Room Scene
- **File:** `game/scenes/DevRoomScene.ts`
- **Features:**
  - Empty sandbox environment with platforms
  - Player spawns in center
  - Basic camera setup
  - Dev menu toggle (press `~` or `F1`)

### 1.2 Dev Menu UI
- **File:** `game/ui/dev/DevMenu.ts`
- **Features:**
  - Toggleable overlay panel
  - Tabbed interface (Spawn, Tools, Physics, Visuals)
  - Keyboard shortcuts for common actions
  - Close button (ESC or `~`)

### 1.3 Dev State Manager
- **File:** `game/dev/DevState.ts`
- **Features:**
  - Tracks god mode, infinite MP, freeze AI, etc.
  - Persists dev settings across scene changes
  - Resets on game restart

---

## Phase 2: Core Debug Toggles

### 2.1 God Mode
- Invincibility flag
- No knockback
- Infinite jumps
- MP costs ignored
- Visual indicator (glowing aura or text)

### 2.2 Infinite MP / No Cooldowns
- MP never decreases
- Skills can be spammed
- Cooldown timers bypassed

### 2.3 Freeze AI
- Pauses all enemy updates
- Shows current AI state above mobs
- Toggle on/off

### 2.4 Stun All Mobs
- Temporarily disables enemy actions
- Useful for testing hit reactions

---

## Phase 3: Enemy Spawning System

### 3.1 Spawn Controls
- **Buttons for each mob type:**
  - Slime
  - RoyalSlime (Boss)
  - (Future: HopperSlime, ChameleonSlime, etc.)

### 3.2 Spawn Modes
- **At Player:** Spawn at player position
- **At Mouse:** Spawn at mouse cursor (world coordinates)
- **Random:** Spawn at random platform positions
- **Formation:** Line, circle, stack

### 3.3 Batch Spawning
- Quantity buttons: 1, 5, 10, 25
- Chaos button: 100+ random mobs

### 3.4 Spawn Presets
- Slime Swarm (10 slimes)
- Boss Battle (1 Royal Slime)
- Gauntlet (one of each type)
- Randomized Chaos

---

## Phase 4: Enemy Management

### 4.1 Kill Tools
- Kill All button
- Kill Selected Type
- Kill on Spawn (auto-instagib toggle)

### 4.2 Puppet Mode (Future)
- Select mob
- Control with WASD
- Debug movement/collisions

---

## Phase 5: Currency, Items, XP

### 5.1 Currency Buttons
- +10 Goo
- +100 Goo
- +1,000 Goo
- +1,000,000 Goo

### 5.2 Item Spawner
- Health potion
- Mana potion
- Quest items (Goo Bits, etc.)
- Debug items

### 5.3 XP Management
- +100 XP
- +1,000 XP
- Level Up button
- Set Level input

### 5.4 Quest Editing
- For each quest:
  - Set: Not Started / Started / Completed
  - Force Turn-In

---

## Phase 6: Map/Scene Utilities

### 6.1 Teleporter Panel
- Buttons for each scene:
  - Town
  - Field (Slimey Hills)
  - Boss Arena
  - Dev Room (return)

### 6.2 Reload Current Scene
- Resets mobs, items, player position

### 6.3 Collision Toggles
- No-clip mode
- Ground-only collision
- Full physics
- "Everything Hurts You" mode

---

## Phase 7: Physics Manipulators

### 7.1 Gravity Slider
- Range: -200% to 200%
- 0% = floaty
- 100% = normal
- 200% = heavy
- Negative = ascend

### 7.2 Player Modifiers
- Walk speed multiplier
- Jump strength multiplier
- Dash speed multiplier
- Attack speed multiplier

### 7.3 Time Scale
- Slow motion (0.1x)
- Normal (1x)
- Fast motion (3x)
- Frame-by-frame stepping (future)

---

## Phase 8: Visual Debugging Tools

### 8.1 Hitbox Overlays
- Show player hitbox
- Show mob hitboxes
- Show attack arcs
- Show platform collision boxes

### 8.2 AI State Overlays
- Show AI state text above mobs
- Show target lines (mob → player)
- Show aggro circles

### 8.3 Performance Readout
- FPS counter
- Entity count
- Draw call estimate
- Memory usage (if available)

---

## Phase 9: Fun Features & Easter Eggs

### 9.1 Break-The-Game Button
- Random chaos event:
  - Spawns 100 mobs
  - Turns gravity off
  - Makes player huge
  - Changes background color
  - Plays wrong music

### 9.2 Shader Playground (Future)
- CRT mode
- VHS distortion
- Bloom mode
- Rainbow pulse

### 9.3 Dev Secrets
- Hidden wall (walk through)
- "Do Not Press" button
- Debugger Errlincton III (floating cube pet)

---

## Implementation Priority

### Must-Have (MVP):
1. ✅ Phase 1: Core Infrastructure
2. ✅ Phase 2: Core Debug Toggles
3. ✅ Phase 3: Enemy Spawning (basic)
4. ✅ Phase 4: Kill Tools
5. ✅ Phase 5: Currency/XP (basic)

### Should-Have:
6. Phase 6: Map/Scene Utilities
7. Phase 7: Physics Manipulators (basic)
8. Phase 8: Visual Debugging (hitboxes)

### Nice-to-Have:
9. Phase 9: Fun Features
10. Advanced spawn modes
11. Puppet mode
12. Shader playground

---

## File Structure

```
game/
  scenes/
    DevRoomScene.ts          # Main dev room scene
  ui/
    dev/
      DevMenu.ts             # Main dev menu UI
      DevButtons.ts          # Button components
  dev/
    DevState.ts              # Dev state manager
    DevCommands.ts           # Command handler
    SpawnPresets.ts          # Spawn preset definitions
    DebugPhysics.ts          # Physics manipulation
    DebugVisuals.ts          # Visual debugging overlays
```

---

## Technical Considerations

### Access Control
- Dev Room only accessible in development builds
- Or: Check for special flag in localStorage: `devModeEnabled`
- Or: Always accessible but hidden (secret key combo)

### State Management
- Dev settings persist in `DevState` singleton
- Settings reset on game restart (or option to save)

### Performance
- Dev Room should handle 100+ entities smoothly
- Use object pooling for spawned mobs if needed
- Limit visual overlays to prevent lag

### Integration
- Dev Room integrates with existing systems:
  - `Game.state` for currency/XP
  - `SceneManager` for teleporting
  - `Player` for god mode flags
  - `Mob` classes for spawning

---

## Next Steps

1. Create Phase 1 implementation (Core Infrastructure)
2. Test Dev Room access and basic menu
3. Implement Phase 2 (Debug Toggles)
4. Add Phase 3 (Enemy Spawning)
5. Iterate based on testing needs

