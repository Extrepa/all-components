

# Dev Notes / AI Instructions

## Role
You are extending ErrlStory, a MapleStory-like 2D action RPG. 
**Goal**: Build a "Vertical Slice" that feels juicy and responsive.
**Stack**: React (Shell) + HTML5 Canvas (Game) + TypeScript.

## Core Architecture (DO NOT BREAK)

1.  **Game Loop (`Loop.ts`)**
    - **Fixed Timestep**: Logic updates exactly 60 times per second (`dt` is constant).
    - **Variable Render**: Rendering happens as fast as `requestAnimationFrame` allows.
    - **Input**: Inputs are buffered between frames and cleared at the very end of a frame.

2.  **Scene System (`SceneManager.ts`)**
    - The game is split into distinct Scenes (`Title`, `Town`, `Field`, `Boss`).
    - Only one scene is active at a time.
    - Scenes implement: `update(dt)`, `render(ctx)`, `onEnter(data)`, `onExit()`.

3.  **State Management**
    - `Game.ts` holds the `GameState` (Player stats, global flags).
    - Scenes read/write to `this.game.state`.

## Roadmap & Milestones

### Milestone 1: Foundation (Done)
- [x] Basic Loop & Input
- [x] Scene Switching
- [x] Canvas Rendering Setup

### Milestone 2: Platforming Physics (Done)
- [x] Implement `Entity` class.
- [x] Implement `Player` class with AABB collision.
- [x] Add gravity, jumping, and platform collision in `FieldScene`.
- [x] Add "Coyote Time" and Jump Buffering for better feel.

### Milestone 3: Camera & Map (Done)
- [x] Implement `Camera` class to follow the player.
- [x] Load map data (platforms) from JSON or simple arrays.
- [x] Implement Parallax scrolling backgrounds.

### Milestone 4: Combat & Mobs (Done)
- [x] Create `Mob` base class (extends `Entity`).
- [x] Add simple AI (pace back and forth) to `Slime`.
- [x] Implement Player Attack (`Z` key, Hitbox generation).
- [x] Add "Damage Numbers" (FloatingTextManager).
- [x] Implement Combat Resolution (Hitbox overlap checks).

### Milestone 5: RPG Systems (Done)
- [x] XP & Leveling logic (Mob death grants XP).
- [x] Level Up visual effect.
- [x] Persistent Stats in `Game.ts`.
- [x] Inventory Data Structure.

### Milestone 6: Boss Battle (Done)
- [x] Create `RoyalSlime` Entity with unique behaviors (Jump Attack).
- [x] Implement `BossScene` with Arena geometry.
- [x] Add Boss HUD (HP Bar).
- [x] Implement Victory State (Explosion, Rewards, Warp to Town).

### Milestone 7: NPCs & Questing (Done)
- [x] Create `NPC` Entity class.
- [x] Build `DialogueManager` for text interactions.
- [x] Implement Quest Logic (Intro Quest: Collect 5 Goo).
- [x] Update Town with `Elder Errl`.

### Milestone 8: Sound & Persistence (Done)
- [x] `AudioSystem` with WebAudio API (Synth SFX).
- [x] `SaveSystem` using LocalStorage.
- [x] Title Screen Load/Continue option.
- [x] Auto-save triggers (Quest Completion, Boss Victory).

### Milestone 9: Juice & Polish (Done)
- [x] `ParticleSystem` implementation (Dust, Sparks, Ghost trails).
- [x] Player `Dash` ability (Shift key).
- [x] Camera `Shake` effect on impact.
- [x] Integrated particles into combat and movement loops.

### Milestone 9.5 & 9.6: Fixes & Portals (Done)
- [x] Safe State Loading (Fix crashes on old saves).
- [x] Fix Spacebar detection issue.
- [x] Add Physical `Portal` entities to Town, Field, and Boss scenes.

### Milestone 10: Loot Drops & Consumables (Done)
- [x] Create `Drop` entity class with bounce physics.
- [x] Implement `Game.addItem` and `Game.useItem`.
- [x] Mobs drop physical items (Goo, Potions) on death.
- [x] Player can use `[H]` to heal with potions.
- [x] HUD updates for Potion count.

### Milestone 11: Magic & Mana (Done)
- [x] Implement `Projectile` entity logic.
- [x] Add "Magic Bolt" (key `X` or `L`) consuming MP.
- [x] Add Mana Regen logic.
- [x] Update HUDs to display MP bar.
- [x] Implement Magic Sound Effect.

### Milestone 12: Economy & Merchant (Done)
- [x] Create `Merchant` NPC entity.
- [x] Implement `ShopUI` overlay with navigation.
- [x] Add `Ether` (MP Potion) item and `J` hotkey.
- [x] Implement Buying logic with Goo currency.

### Milestone 13: Death & Respawn (Done)
- [x] Player `isDead` state and death visuals.
- [x] `GameOverScene` implementation.
- [x] Death Penalty logic (Goo loss).
- [x] Respawn loop.

### Milestone 14: Flash Nostalgia - Phase 1 (Done)
- [x] Wiggling crit numbers (enhanced FloatingTextManager).
- [x] Hitstop on big hits (frame freeze effect).
- [x] Screen vignette on low HP.
- [x] Sarcastic item descriptions.

### Milestone 15: Flash Nostalgia - Phase 3 (Done)
- [x] Wall sliding mechanic (disabled in Town, enabled in Field/Boss).
- [x] Bounce pads (glowing platforms).
- [x] Charge attacks (hold to empower magic).
- [x] Charged attack unlock at level 5.

### Milestone 16: Mobile Controls (Done)
- [x] Device detection (touch capability).
- [x] Virtual touch controls (D-pad, buttons).
- [x] Touch input handling.
- [x] Mobile-optimized UI layout.

### Milestone 17: Dev Room (Done)
- [x] Dev Room scene with debug tools.
- [x] Dev Menu UI (APC40-style controller layout).
- [x] Dev State management (God Mode, Infinite MP, etc.).
- [x] Invisible portal access from Town.
- [x] Scene teleporter, enemy spawning, physics controls.

### Milestone 18: Quest Tracker UI (Done)
- [x] Unified Quest Tracker (regular + daily quests).
- [x] Minimizable/expandable UI.
- [x] Dynamic width for text content.
- [x] Compact, optimized layout.

### Milestone 19: Errl Sprite & Platform Mechanics (Done)
- [x] Player sprite swap (Errl.png).
- [x] Sprite loading system (AssetLoader).
- [x] Drop-through platforms (hold down + jump).
- [x] Jump-through platforms (from below).
- [x] Crouch mechanic (squish effect).
- [x] Updated MainHUD badge with Errl sprite.

## Rules for Code Generation
1.  **Keep it Simple**: No complex ECS (Entity Component System) yet. Use OOP inheritance for Entities (`Entity` -> `Actor` -> `Player`).
2.  **No External Game Libs**: Do not import Phaser, Pixi, or Three.js. We are building the engine.
3.  **Strict Typing**: Use the interfaces in `types.ts`.
4.  **Aesthetics**: When rendering, use the `Inter` font and the defined color palette (Neon/Dark) to match the UI.