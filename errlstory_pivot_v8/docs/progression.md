# ErrlStory - Progression & Milestones

## Development Roadmap

This document tracks completed milestones and future development plans.

---

## Completed Milestones

### Milestone 1: Foundation ✅
**Status**: Complete
- [x] Basic Loop & Input system
- [x] Scene Switching mechanism
- [x] Canvas Rendering Setup
- [x] React integration

**Key Files**: `Loop.ts`, `Input.ts`, `SceneManager.ts`, `GameCanvas.tsx`

---

### Milestone 2: Platforming Physics ✅
**Status**: Complete
- [x] Implement `Entity` base class
- [x] Implement `Player` class with AABB collision
- [x] Add gravity, jumping, and platform collision
- [x] Add "Coyote Time" for edge forgiveness
- [x] Add Jump Buffering for better feel

**Key Files**: `Entity.ts`, `Player.ts`, `FieldScene.ts`

---

### Milestone 3: Camera & Map ✅
**Status**: Complete
- [x] Implement `Camera` class to follow player
- [x] Load map data (platforms) from arrays
- [x] Implement Parallax scrolling backgrounds
- [x] Map boundary clamping

**Key Files**: `Camera.ts`, Scene files

---

### Milestone 4: Combat & Mobs ✅
**Status**: Complete
- [x] Create `Mob` base class (extends `Entity`)
- [x] Add simple AI (pace back and forth) to `Slime`
- [x] Implement Player Attack (`Z` key, Hitbox generation)
- [x] Add "Damage Numbers" (FloatingTextManager)
- [x] Implement Combat Resolution (Hitbox overlap checks)

**Key Files**: `Mob.ts`, `Slime.ts`, `FloatingTextManager.ts`

---

### Milestone 5: RPG Systems ✅
**Status**: Complete
- [x] XP & Leveling logic (Mob death grants XP)
- [x] Level Up visual effect
- [x] Persistent Stats in `Game.ts`
- [x] Inventory Data Structure

**Key Files**: `Game.ts`, `types.ts`

---

### Milestone 6: Boss Battle ✅
**Status**: Complete
- [x] Create `RoyalSlime` Entity with unique behaviors (Jump Attack)
- [x] Implement `BossScene` with Arena geometry
- [x] Add Boss HUD (HP Bar)
- [x] Implement Victory State (Explosion, Rewards, Warp to Town)

**Key Files**: `RoyalSlime.ts`, `BossScene.ts`

---

### Milestone 7: NPCs & Questing ✅
**Status**: Complete
- [x] Create `NPC` Entity class
- [x] Build `DialogueManager` for text interactions
- [x] Implement Quest Logic (Intro Quest: Collect 5 Goo)
- [x] Update Town with `Elder Errl`

**Key Files**: `NPC.ts`, `DialogueManager.ts`, `QuestSystem.ts`, `quests.ts`

---

### Milestone 8: Sound & Persistence ✅
**Status**: Complete
- [x] `AudioSystem` with WebAudio API (Synth SFX)
- [x] `SaveSystem` using LocalStorage
- [x] Title Screen Load/Continue option
- [x] Auto-save triggers (Quest Completion, Boss Victory)

**Key Files**: `AudioSystem.ts`, `SaveSystem.ts`, `TitleScene.ts`

---

### Milestone 9: Juice & Polish ✅
**Status**: Complete
- [x] `ParticleSystem` implementation (Dust, Sparks, Ghost trails)
- [x] Player `Dash` ability (Shift key)
- [x] Camera `Shake` effect on impact
- [x] Integrated particles into combat and movement loops

**Key Files**: `ParticleSystem.ts`, `Player.ts`, `Camera.ts`

---

### Milestone 9.5 & 9.6: Fixes & Portals ✅
**Status**: Complete
- [x] Safe State Loading (Fix crashes on old saves)
- [x] Fix Spacebar detection issue
- [x] Add Physical `Portal` entities to Town, Field, and Boss scenes

**Key Files**: `Portal.ts`, `SaveSystem.ts`, `Input.ts`

---

### Milestone 10: Loot Drops & Consumables ✅
**Status**: Complete
- [x] Create `Drop` entity class with bounce physics
- [x] Implement `Game.addItem` and `Game.useItem`
- [x] Mobs drop physical items (Goo, Potions) on death
- [x] Player can use `[H]` to heal with potions
- [x] HUD updates for Potion count

**Key Files**: `Drop.ts`, `Game.ts`, `MainHUD.ts`

---

### Milestone 11: Magic & Mana ✅
**Status**: Complete
- [x] Implement `Projectile` entity logic
- [x] Add "Magic Bolt" (key `X` or `L`) consuming MP
- [x] Add Mana Regen logic
- [x] Update HUDs to display MP bar
- [x] Implement Magic Sound Effect

**Key Files**: `Projectile.ts`, `Player.ts`, `MainHUD.ts`

---

### Milestone 12: Economy & Merchant ✅
**Status**: Complete
- [x] Create `Merchant` NPC entity
- [x] Implement `ShopUI` overlay with navigation
- [x] Add `Ether` (MP Potion) item and `J` hotkey
- [x] Implement Buying logic with Goo currency

**Key Files**: `Merchant.ts`, `ShopUI.ts`, `Game.ts`

---

### Milestone 13: Death & Respawn ✅
**Status**: Complete
- [x] Player `isDead` state and death visuals
- [x] `GameOverScene` implementation
- [x] Death Penalty logic (Goo loss)
- [x] Respawn loop

**Key Files**: `Player.ts`, `GameOverScene.ts`, `Game.ts`

---

### Milestone 23: Icons & Layout ✅
**Status**: Complete
- [x] `IconRenderer` utility class for item types
- [x] Pixel-art icons for Flasks, Swords, Armor, Hats, Auras, Trails
- [x] `renderUiIcon` for HUD buttons (Bag, Scroll, Gear)
- [x] MainHUD layout: buttons moved to bottom-right
- [x] Menu Group (Menu, Quest, Inventory) and Quick Slots (L, K, J, H)
- [x] InventoryUI: miniature icons next to item names
- [x] Drag & Drop: item icon as ghost image

**Key Files**: `IconRenderer.ts`, `MainHUD.ts`, `InventoryUI.ts`

---

### Milestone 14: Flash Nostalgia - Phase 1 ✅
**Status**: Complete
- [x] Wiggling crit numbers (enhanced FloatingTextManager)
- [x] Hitstop on big hits (frame freeze effect)
- [x] Screen vignette on low HP
- [x] Sarcastic item descriptions

**Key Files**: `FloatingTextManager.ts`, `Game.ts`, `items.ts`

---

### Milestone 15: Flash Nostalgia - Phase 3 ✅
**Status**: Complete
- [x] Wall sliding mechanic (disabled in Town, enabled in Field/Boss)
- [x] Bounce pads (glowing platforms)
- [x] Charge attacks (hold to empower magic)
- [x] Charged attack unlock at level 5

**Key Files**: `Player.ts`, `BouncePad.ts`, `FieldScene.ts`

---

### Milestone 16: Mobile Controls ✅
**Status**: Complete
- [x] Device detection (touch capability)
- [x] Virtual touch controls (D-pad, buttons)
- [x] Touch input handling
- [x] Mobile-optimized UI layout

**Key Files**: `DeviceDetector.ts`, `TouchControls.ts`, `Input.ts`

---

### Milestone 17: Dev Room ✅
**Status**: Complete
- [x] Dev Room scene with debug tools
- [x] Dev Menu UI (APC40-style controller layout)
- [x] Dev State management (God Mode, Infinite MP, etc.)
- [x] Invisible portal access from Town
- [x] Scene teleporter, enemy spawning, physics controls

**Key Files**: `DevRoomScene.ts`, `DevMenu.ts`, `DevState.ts`

---

### Milestone 18: Quest Tracker UI ✅
**Status**: Complete
- [x] Unified Quest Tracker (regular + daily quests)
- [x] Minimizable/expandable UI
- [x] Dynamic width for text content
- [x] Compact, optimized layout

**Key Files**: `QuestTrackerUI.ts`, `Game.ts`

---

### Milestone 19: Errl Sprite & Platform Mechanics ✅
**Status**: Complete
- [x] Player sprite swap (Errl.png)
- [x] Sprite loading system (AssetLoader)
- [x] Drop-through platforms (hold down + jump)
- [x] Jump-through platforms (from below)
- [x] Crouch mechanic (squish effect)
- [x] Updated MainHUD badge with Errl sprite

**Key Files**: `Player.ts`, `AssetLoader.ts`, `MainHUD.ts`

---

## Future Milestones

### Milestone 20: Flash Nostalgia - Phase 2 (Systems)
**Status**: Planned
- [ ] Loot rarity system (white/green/blue/purple)
- [ ] Flash-style achievement popups
- [ ] Enhanced level-up animation (bigger, flashier)

**Priority**: Medium
**Estimated Effort**: Medium

---

### Milestone 21: More Content
**Status**: Planned
- [ ] Additional quests
- [ ] New enemy types
- [ ] More cosmetic items
- [ ] Additional areas/maps

**Priority**: Medium
**Estimated Effort**: High

---

### Milestone 22: Audio Enhancement
**Status**: Planned
- [ ] Background music system
- [ ] Volume controls
- [ ] More sound effects
- [ ] Spatial audio

**Priority**: Low
**Estimated Effort**: Medium

---

### Milestone 23: UI/UX Improvements
**Status**: Planned
- [ ] Typewriter dialogue effect
- [ ] Settings menu
- [ ] Key rebinding
- [ ] Fullscreen mode

**Priority**: Medium
**Estimated Effort**: Medium

---

### Milestone 24: Advanced Features
**Status**: Planned
- [ ] Skill tree system
- [ ] Crafting system
- [ ] Pet/companion system
- [ ] Multiplayer (long-term)

**Priority**: Low
**Estimated Effort**: Very High

---

## Development Philosophy

### Core Principles
1. **Keep it Simple**: No complex ECS yet. Use OOP inheritance.
2. **No External Game Libs**: Build the engine ourselves.
3. **Strict Typing**: Use TypeScript interfaces.
4. **Juice First**: Polish and feel over features.
5. **Vertical Slice**: Focus on making a small part feel great.

### Technical Constraints
- Fixed timestep game loop (60Hz)
- HTML5 Canvas 2D rendering
- React for UI shell
- TypeScript for type safety
- LocalStorage for persistence

---

## Version History

- **v0.1**: React Prototype (Current)
  - All milestones 1-19 completed
  - Core gameplay loop functional
  - Basic RPG systems in place
  - Dev tools and mobile support added

---

## Notes

- Milestones are numbered but not necessarily sequential
- Some milestones may be combined or split
- Priority and effort estimates are subject to change
- Focus remains on polish and "juice" over feature bloat

