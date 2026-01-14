# ErrlStory - AI Agent Instructions

## Role
You are extending ErrlStory, a MapleStory-like 2D action RPG. 
**Goal**: Build a "Vertical Slice" that feels juicy and responsive.
**Stack**: React (Shell) + HTML5 Canvas (Game) + TypeScript.

---

## Core Architecture (DO NOT BREAK)

### 1. Game Loop (`Loop.ts`)
- **Fixed Timestep**: Logic updates exactly 60 times per second (`dt` is constant).
- **Variable Render**: Rendering happens as fast as `requestAnimationFrame` allows.
- **Input**: Inputs are buffered between frames and cleared at the very end of a frame.

**Critical**: Never change the fixed timestep or input buffering logic. This is the foundation of responsive gameplay.

### 2. Scene System (`SceneManager.ts`)
- The game is split into distinct Scenes (`Title`, `Town`, `Field`, `Boss`).
- Only one scene is active at a time.
- Scenes implement: `update(dt)`, `render(ctx)`, `onEnter(data)`, `onExit()`.

**Critical**: Always use `this.game.sceneManager.setScene()` to switch scenes. Never directly manipulate scene state.

### 3. State Management
- `Game.ts` holds the `GameState` (Player stats, global flags).
- Scenes read/write to `this.game.state`.
- All state changes go through `Game` methods when possible.

**Critical**: Don't mutate `GameState` directly from entities. Use `Game` methods like `addItem()`, `gainXp()`, etc.

---

## Rules for Code Generation

### 1. Keep it Simple
- No complex ECS (Entity Component System) yet.
- Use OOP inheritance for Entities (`Entity` -> `Mob` -> `Player`).
- Prefer composition over complex inheritance trees.

### 2. No External Game Libs
- Do not import Phaser, Pixi, or Three.js.
- We are building the engine ourselves.
- Use only: React, TypeScript, HTML5 Canvas API, WebAudio API.

### 3. Strict Typing
- Use the interfaces in `types.ts`.
- Add new types to `types.ts` if needed.
- Avoid `any` types. Use `unknown` if type is truly unknown.

### 4. Aesthetics
- When rendering, use the `Inter` font and the defined color palette (Neon/Dark).
- Pixel-art style: Use `imageRendering: 'pixelated'` on canvas.
- Color scheme: Dark backgrounds (#050811, #162447) with neon accents (#8afff2, #34e1ff).

### 5. File Organization
- One class per file (usually).
- Related utilities can be in the same file.
- Data files (`quests.ts`, `cosmetics.ts`) separate from logic.

### 6. Naming Conventions
- **Classes**: PascalCase (`Player`, `GameState`)
- **Methods**: camelCase (`update()`, `takeDamage()`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_HP`, `GRAVITY`)
- **Private Members**: No prefix (TypeScript handles visibility)

---

## Common Patterns

### Adding a New Entity
```typescript
// 1. Extend Entity or Mob
export class NewEntity extends Mob {
  constructor(game: Game, x: number, y: number) {
    super(x, y, width, height, hp);
    this.game = game;
  }
  
  // 2. Implement update
  public update(dt: number, platforms: Rect[]): void {
    super.update(dt, platforms);
    // Your logic here
  }
  
  // 3. Implement render
  public render(ctx: CanvasRenderingContext2D): void {
    // Your rendering here
  }
}
```

### Adding a New Item
```typescript
// 1. Add to data file (or create new one)
export const ITEMS = {
  'new_item': {
    id: 'new_item',
    name: 'New Item',
    type: 'consumable',
    // ...
  }
};

// 2. Add icon rendering
// In IconRenderer.ts, add case in renderItem()

// 3. Add usage logic
// In Game.useItem(), add handling for new item
```

### Adding a New Scene
```typescript
// 1. Create scene file
export class NewScene implements Scene {
  private game: Game;
  
  constructor(game: Game) {
    this.game = game;
  }
  
  onEnter(data?: any): void { }
  update(dt: number): void { }
  render(ctx: CanvasRenderingContext2D): void { }
  onExit(): void { }
}

// 2. Register in Game._registerScenes()
this.sceneManager.add("newscene", new NewScene(this));
```

### Adding a New UI
```typescript
// 1. Create UI class
export class NewUI {
  private game: Game;
  public isActive: boolean = false;
  
  constructor(game: Game) {
    this.game = game;
  }
  
  public update(dt: number): void {
    if (!this.isActive) return;
    // Handle input, animations
  }
  
  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive) return;
    // Render UI
  }
  
  public open(): void {
    this.isActive = true;
  }
  
  public close(): void {
    this.isActive = false;
  }
}

// 2. Add to Game.ts
public newUI: NewUI;

// 3. Initialize in Game constructor
this.newUI = new NewUI(this);

// 4. Update/render in Game.update() and Game.render()
```

---

## Physics Constants

### Player Movement
```typescript
SPEED = 280;           // Max horizontal speed
ACCEL = 1200;          // Horizontal acceleration
FRICTION = 0.82;       // Ground friction
AIR_RESISTANCE = 0.95; // Air friction
GRAVITY = 1500;        // Vertical acceleration
JUMP_FORCE = 600;      // Initial jump velocity
```

**Don't change these without testing**. They're tuned for "MapleStory feel".

### Combat
```typescript
ATTACK_DURATION = 0.25;  // Attack animation length
ATTACK_COOLDOWN = 0.1;   // Time between attacks
INVULN_TIME = 1.0;       // Player invulnerability after hit
```

---

## Input Keys

### Movement
- `ArrowLeft` / `A`: Move left
- `ArrowRight` / `D`: Move right
- `Space` / `ArrowUp` / `W`: Jump
- `Shift`: Dash

### Combat
- `Z` / `K`: Melee attack
- `X` / `L`: Magic attack

### Items
- `H`: Quick slot H (default: Potion)
- `J`: Quick slot J (default: Ether)
- `K`: Quick slot K
- `L`: Quick slot L

### UI
- `I`: Inventory
- `Q`: Quest Log
- `Escape`: Close modals / Return to title
- `ArrowUp` / `W` (near NPC): Interact

---

## State Management Best Practices

### Reading State
```typescript
// ✅ Good: Read directly
const hp = this.game.state.player.hp;
const level = this.game.state.player.level;

// ✅ Good: Use Game methods when available
const stats = this.game.getPlayerStats();
```

### Modifying State
```typescript
// ✅ Good: Use Game methods
this.game.addItem({ id: 'potion', name: 'Potion', type: 'consumable' });
this.game.gainXp(100);
this.game.useItem('potion');

// ❌ Bad: Direct mutation
this.game.state.player.inventory.push(item); // Use addItem() instead
this.game.state.player.hp += 20; // Use useItem() or proper method
```

### Adding New State
1. Add to `GameState` interface in `types.ts`
2. Initialize in `Game.getNewGameState()`
3. Handle in `Game.loadState()` for save compatibility
4. Update `SaveSystem` if needed

---

## Rendering Guidelines

### Canvas Context
- Always `ctx.save()` before transforms
- Always `ctx.restore()` after transforms
- Use `Math.floor()` for camera translation to avoid sub-pixel blur

### World Space vs Screen Space
```typescript
// World Space (translated by camera)
ctx.save();
ctx.translate(-Math.floor(cam.x), -Math.floor(cam.y));
// Render entities, particles
ctx.restore();

// Screen Space (no translation)
// Render UI, HUD, modals
```

### Colors
- Background: Dark (#050811, #162447)
- Player: Cyan (#8afff2)
- UI Accents: Neon blue (#34e1ff)
- Damage: Yellow (#ffcc00)
- Magic: Cyan (#34e1ff)
- Health: Red (#ff4444)
- Mana: Blue (#34e1ff)

### Text
- Font: `"bold 14px Inter, system-ui"`
- Alignment: `ctx.textAlign = "center"` (usually)
- Baseline: `ctx.textBaseline = "alphabetic"` (for UI)

---

## Audio Guidelines

### Playing Sounds
```typescript
// Use AudioSystem
this.game.audio.playSfx('hit');
this.game.audio.playSfx('jump');
```

### Available Sounds
- `attack`: Sword swing
- `hit`: Impact
- `magic`: Spell cast
- `jump`: Jump
- `step`: Landing
- `collect`: Item pickup
- `levelup`: Level up
- `die`: Death

### Adding New Sounds
1. Add case in `AudioSystem.playSfx()`
2. Generate sound wave programmatically
3. Keep sounds short (< 1 second)

---

## Particle System

### Emitting Particles
```typescript
// Dust (landing)
this.game.particles.emit('dust', x, y, count);

// Sparks (combat)
this.game.particles.emit('spark', x, y, count);

// Ghost (dash/death)
this.game.particles.emit('ghost', x, y);
```

### Particle Types
- `dust`: Brown/gray, falls down
- `spark`: Yellow/white, explodes outward
- `ghost`: White/transparent, rises up

---

## Quest System

### Quest Types
- `KILL`: Defeat mobs (tracked by mob ID)
- `COLLECT`: Gather items (tracked by item count in inventory)

### Adding Quests
1. Add definition to `quests.ts`
2. Quest system handles tracking automatically
3. NPC dialogue in quest definition

### Quest States
- **Not Started**: Not in quest log
- **Active**: In `questLog.active[]`
- **Ready to Turn In**: `isReadyToTurnIn = true`
- **Completed**: In `questLog.completed[]`

---

## Save System

### Save Triggers
- Quest completion
- Boss victory
- (Planned: Manual save)

### Save Compatibility
- Always use `Game.loadState()` to load saves
- Handle missing fields gracefully
- Migrate old save formats if needed

### Save Data Structure
- Player stats, inventory, equipment, cosmetics
- Quest progress (active and completed)
- Daily challenge state
- Quick slot assignments

---

## Common Pitfalls

### ❌ Don't Do This
```typescript
// Direct state mutation
this.game.state.player.hp = 100;

// Changing fixed timestep
const dt = 1/30; // NO! Use 1/60

// Skipping input buffering
if (keyPressed) { } // Use wasPressed() instead

// Rendering without camera transform
ctx.fillRect(entity.x, entity.y, ...); // Missing translate!
```

### ✅ Do This Instead
```typescript
// Use Game methods
this.game.useItem('potion');

// Use fixed timestep
const dt = 1/60; // Or use the constant

// Use input buffering
if (this.game.input.wasPressed('z')) { }

// Apply camera transform
ctx.save();
ctx.translate(-cam.x, -cam.y);
ctx.fillRect(entity.x, entity.y, ...);
ctx.restore();
```

---

## Testing Your Changes

### Manual Testing Checklist
- [ ] Game loop runs at 60Hz (check console for frame times)
- [ ] Input feels responsive (no lag)
- [ ] Camera follows smoothly
- [ ] Collision detection works
- [ ] Save/load works
- [ ] UI doesn't break game loop
- [ ] Particles clean up properly
- [ ] Audio doesn't overlap weirdly

### Common Issues
- **Janky movement**: Check fixed timestep, don't use variable dt
- **Input lag**: Check input buffering, use `wasPressed()` not direct key checks
- **Entities disappearing**: Check camera transform
- **Save crashes**: Check `loadState()` handles missing fields
- **UI not showing**: Check `isActive` flag, check render order

---

## When in Doubt

1. **Check existing code**: Look at similar features for patterns
2. **Follow the architecture**: Don't break the core systems
3. **Keep it simple**: Prefer straightforward solutions
4. **Test incrementally**: Make small changes, test often
5. **Ask for clarification**: If architecture is unclear, ask

---

## Quick Reference

### File Locations
- Core systems: `game/core/`
- Entities: `game/entities/`
- Scenes: `game/scenes/`
- UI: `game/ui/`
- Data: `game/data/`
- Types: `types.ts`

### Key Classes
- `Game`: Main game class, state management
- `Player`: Player entity
- `Mob`: Base enemy class
- `SceneManager`: Scene transitions
- `Input`: Input handling
- `Camera`: Camera system
- `AudioSystem`: Sound effects
- `SaveSystem`: Persistence

### Key Methods
- `Game.addItem()`: Add item to inventory
- `Game.useItem()`: Use consumable or equip item
- `Game.gainXp()`: Add XP, handles leveling
- `Game.getPlayerStats()`: Get calculated stats
- `SceneManager.setScene()`: Switch scenes

---

## Notes for AI Agents

- **Read the codebase first**: Understand existing patterns before adding features
- **Maintain consistency**: Follow existing code style and patterns
- **Don't over-engineer**: Simple solutions are better
- **Test your changes**: Make sure things work before moving on
- **Document complex logic**: Add comments for non-obvious code
- **Respect the architecture**: Don't break core systems

---

**Last Updated**: Based on Milestone 19 completion (Errl Sprite & Platform Mechanics)

