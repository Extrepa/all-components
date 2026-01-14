# Phase 3 Implementation Plan - Flash Nostalgia Gameplay

## Overview
Phase 3 focuses on gameplay mechanics that add Flash-era movement and platforming features. These are more complex than Phase 1 but add significant depth to the game feel.

**Estimated Total Time**: 6-8 hours
**Priority**: Low (but high impact on gameplay)
**Impact**: Medium-High

---

## Feature 1: Wall Sliding

### Goal
Add wall sliding mechanic where player slides down walls when holding against them, like "buttered toast" - a classic Flash platformer feature.

### Current State
- Player has normal collision detection
- No wall detection or sliding behavior
- Player stops immediately when hitting walls

### Implementation Steps

#### Step 1.1: Add Wall Detection
**File**: `game/entities/Player.ts`
- Add `isOnWall: boolean` state
- Add `wallSide: 'left' | 'right' | null` to track which wall
- In `handleCollisionsX()`, detect if player is pressing against wall
- Set `isOnWall = true` when:
  - Colliding with wall AND
  - Input is pressed in direction of wall

**Code Changes**:
```typescript
public isOnWall: boolean = false;
private wallSide: 'left' | 'right' | null = null;
private readonly WALL_SLIDE_SPEED = 100; // Pixels per second

private handleCollisionsX(platforms: Rect[]): void {
  const bounds = this.getBounds();
  let hitWall = false;
  
  for (const p of platforms) {
    if (this.aabb(bounds, p)) {
      if (this.vx > 0) {
        this.x = p.x - this.width;
        hitWall = true;
        this.wallSide = 'right';
      } else if (this.vx < 0) {
        this.x = p.x + p.width;
        hitWall = true;
        this.wallSide = 'left';
      }
      this.vx = 0;
    }
  }
  
  // Check if pressing against wall
  const input = this.game.input;
  const pressingLeft = input.isDown("ArrowLeft") || input.isDown("a") || input.isDown("A");
  const pressingRight = input.isDown("ArrowRight") || input.isDown("d") || input.isDown("D");
  
  this.isOnWall = hitWall && (
    (this.wallSide === 'left' && pressingLeft) ||
    (this.wallSide === 'right' && pressingRight)
  );
  
  if (!this.isOnWall) {
    this.wallSide = null;
  }
}
```

#### Step 1.2: Implement Wall Slide Physics
**File**: `game/entities/Player.ts`
- In `update()`, if `isOnWall` and not grounded:
  - Apply wall slide velocity (slower than normal fall)
  - Reduce gravity effect while sliding
  - Allow jump off wall (wall jump)

**Code Changes**:
```typescript
// In update(), after gravity application:
if (this.isOnWall && !this.isGrounded) {
  // Wall slide: slower fall speed
  if (this.vy > this.WALL_SLIDE_SPEED) {
    this.vy = this.WALL_SLIDE_SPEED;
  }
  
  // Wall jump: jump away from wall
  if (this.jumpBufferTimer > 0) {
    this.vy = -this.JUMP_FORCE;
    this.vx = this.wallSide === 'left' ? 200 : -200; // Push away
    this.jumpBufferTimer = 0;
    this.isOnWall = false;
    this.wallSide = null;
    this.game.audio.playSfx('jump');
    this.game.particles.emit('dust', this.x + this.width/2, this.y + this.height, 3);
  }
}
```

#### Step 1.3: Visual Feedback
**File**: `game/entities/Player.ts`
- Add visual indicator when wall sliding (particles, slight color change)
- Optional: Add wall slide particles

### Testing Checklist
- [ ] Player slides down walls when holding against them
- [ ] Wall slide is slower than normal fall
- [ ] Wall jump works (jump away from wall)
- [ ] Visual feedback is clear
- [ ] Doesn't interfere with normal movement

### Estimated Time: 2-3 hours

---

## Feature 2: Bounce Pads

### Goal
Add glowing platforms that launch the player upward - classic Flash platformer element.

### Current State
- Platforms are static rectangles
- No special platform types
- No bounce/jump pad mechanics

### Implementation Steps

#### Step 2.1: Create BouncePad Entity
**File**: `game/entities/BouncePad.ts` (new file)
- Extend `Entity` class
- Add bounce force property
- Add visual glow animation
- Add collision detection for player

**Code Structure**:
```typescript
export class BouncePad extends Entity {
  private game: Game;
  private bounceForce: number = 800; // Stronger than normal jump
  private glowTimer: number = 0;
  
  constructor(game: Game, x: number, y: number) {
    super(x, y, 64, 16); // Wide, thin platform
    this.game = game;
  }
  
  public update(dt: number): void {
    this.glowTimer += dt;
  }
  
  public checkBounce(player: Player): boolean {
    const playerBounds = player.getBounds();
    const padBounds = this.getBounds();
    
    // Check if player is on top of pad
    if (this.aabb(playerBounds, padBounds) && player.vy > 0) {
      player.vy = -this.bounceForce;
      player.isGrounded = false;
      this.game.audio.playSfx('jump');
      this.game.particles.emit('spark', this.x + this.width/2, this.y, 10);
      this.game.camera.shake(1, 0.1);
      return true;
    }
    return false;
  }
  
  public render(ctx: CanvasRenderingContext2D): void {
    // Glowing platform with pulse effect
    const glow = 0.5 + Math.sin(this.glowTimer * 5) * 0.3;
    
    ctx.save();
    ctx.globalAlpha = glow;
    
    // Glow effect
    const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    gradient.addColorStop(0, "#ffff00");
    gradient.addColorStop(1, "#ff8800");
    ctx.fillStyle = gradient;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Outline
    ctx.strokeStyle = "#ffff00";
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    ctx.restore();
  }
}
```

#### Step 2.2: Add BouncePads to Scenes
**Files**: `game/scenes/FieldScene.ts`, `game/scenes/TownScene.ts` (optional)
- Create bounce pad instances
- Add to scene's entity list
- Update collision checks to include bounce pads

**Code Changes**:
```typescript
// In FieldScene constructor or onEnter
this.bouncePads = [
  new BouncePad(this.game, 400, 300),
  new BouncePad(this.game, 800, 200),
];

// In update()
for (const pad of this.bouncePads) {
  pad.update(dt);
  pad.checkBounce(this.player);
}

// In render()
this.bouncePads.forEach(p => p.render(ctx));
```

#### Step 2.3: Add to Minimap
**File**: `game/ui/Minimap.ts`
- Add bounce pad markers (optional, different color)
- Or just show as regular platforms

### Testing Checklist
- [ ] Bounce pads launch player upward
- [ ] Bounce force is stronger than normal jump
- [ ] Visual glow effect is visible
- [ ] Particles and sound on bounce
- [ ] Camera shake on bounce
- [ ] Works in multiple scenes

### Estimated Time: 2-3 hours

---

## Feature 3: Charge Attacks

### Goal
Add charge mechanic where holding X charges magic attack, releasing fires empowered projectile.

### Current State
- Magic attack is instant (press X to fire)
- No charge system
- Fixed magic damage

### Implementation Steps

#### Step 3.1: Add Charge State
**File**: `game/entities/Player.ts`
- Add `isCharging: boolean` state
- Add `chargeTimer: number` (0 to max charge time)
- Add `chargeLevel: number` (0 to 1, based on charge time)
- Track if X key is held down

**Code Changes**:
```typescript
// Magic State
private isCharging: boolean = false;
private chargeTimer: number = 0;
private readonly MAX_CHARGE_TIME = 1.0; // 1 second to full charge
private chargeLevel: number = 0; // 0 to 1

// In update(), replace magic attack logic:
if (input.isDown("x") || input.isDown("X") || input.isDown("l") || input.isDown("L")) {
  if (pStats.mp >= 5 && !this.isAttacking) {
    if (!this.isCharging) {
      this.isCharging = true;
      this.chargeTimer = 0;
    }
    
    // Charge up
    if (this.chargeTimer < this.MAX_CHARGE_TIME) {
      this.chargeTimer += dt;
      this.chargeLevel = Math.min(1, this.chargeTimer / this.MAX_CHARGE_TIME);
    }
  }
} else {
  // Release: fire if was charging
  if (this.isCharging && this.chargeTimer > 0.1) { // Minimum charge
    this.castMagic(this.chargeLevel);
    this.isCharging = false;
    this.chargeTimer = 0;
    this.chargeLevel = 0;
  }
}
```

#### Step 3.2: Modify Magic Cast
**File**: `game/entities/Player.ts`
- Update `castMagic()` to accept charge level
- Scale damage based on charge (1x to 2x)
- Scale MP cost based on charge
- Add visual charge effect

**Code Changes**:
```typescript
private castMagic(chargeLevel: number = 0): void {
  const baseCost = 5;
  const cost = Math.floor(baseCost * (1 + chargeLevel)); // 5 to 10 MP
  const pStats = this.game.state.player;
  
  if (pStats.mp < cost) return;
  
  pStats.mp -= cost;
  this.magicTimer = this.magicCooldown;
  this.game.audio.playSfx('magic');
  
  const dir = this.facingRight ? 1 : -1;
  const baseDamage = (this.game.state.player.level * 8) + 10;
  const damage = Math.floor(baseDamage * (1 + chargeLevel)); // 1x to 2x
  
  const px = this.facingRight ? this.x + this.width + 5 : this.x - 25;
  const py = this.y + 6;
  
  this.lastFiredProjectile = new Projectile(this.game, px, py, dir, damage);
}
```

#### Step 3.3: Visual Charge Effect
**File**: `game/entities/Player.ts`
- In `render()`, show charge glow around player
- Scale glow intensity with charge level
- Add particles during charge

**Code Changes**:
```typescript
// In render(), after player body:
if (this.isCharging) {
  ctx.save();
  ctx.globalAlpha = this.chargeLevel * 0.5;
  const glowSize = 20 + (this.chargeLevel * 20);
  const gradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, glowSize
  );
  gradient.addColorStop(0, "#34e1ff");
  gradient.addColorStop(1, "rgba(52, 225, 255, 0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, glowSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  // Charge particles
  if (Math.random() < 0.3) {
    this.game.particles.emit('spark', centerX, centerY, 1);
  }
}
```

### Testing Checklist
- [ ] Holding X starts charging
- [ ] Charge level increases over time
- [ ] Releasing X fires charged projectile
- [ ] Damage scales with charge level
- [ ] MP cost scales with charge level
- [ ] Visual charge effect is visible
- [ ] Minimum charge required to fire

### Estimated Time: 2-3 hours

---

## Implementation Order

### Recommended Sequence
1. **Bounce Pads** (Easiest, standalone feature)
2. **Wall Sliding** (More complex, affects movement)
3. **Charge Attacks** (Most complex, affects combat system)

### Why This Order?
- Bounce pads are simple entities, easy to test
- Wall sliding requires careful physics tuning
- Charge attacks need UI feedback and balance

---

## Testing Strategy

### Unit Testing
- Test wall slide detection
- Test bounce pad collision
- Test charge level calculation

### Integration Testing
- Test wall slide + bounce pad interaction
- Test charge attack + crit system
- Test all features together

### Playtesting
- Feel test: Does wall sliding feel good?
- Balance test: Are bounce pads fun?
- Feedback test: Is charge system clear?

---

## Rollback Plan

### If Issues Arise
1. **Wall Sliding**: Can disable by not setting `isOnWall`
2. **Bounce Pads**: Can remove from scenes
3. **Charge Attacks**: Can revert to instant cast

### Feature Flags (Optional)
```typescript
export const FEATURES = {
  WALL_SLIDING: true,
  BOUNCE_PADS: true,
  CHARGE_ATTACKS: true,
};
```

---

## Success Criteria

### Phase 3 Complete When:
- [ ] Player can slide down walls
- [ ] Player can wall jump
- [ ] Bounce pads launch player upward
- [ ] Bounce pads have visual glow effect
- [ ] Charge attacks work (hold to charge, release to fire)
- [ ] Charge damage scales properly
- [ ] All features work together smoothly
- [ ] No performance degradation
- [ ] Save/load still works

### Quality Metrics
- Wall sliding feels responsive and useful
- Bounce pads are fun and satisfying
- Charge attacks add strategic depth
- Visual feedback is clear for all features

---

## Future Enhancements (Post-Phase 3)

### Potential Improvements
- **Wall Sliding**: Add wall slide speed upgrades
- **Bounce Pads**: Different bounce pad types (horizontal, diagonal)
- **Charge Attacks**: Charge level indicators in UI
- **Combos**: Wall jump + bounce pad combos

### Integration with Other Systems
- Wall sliding works with dash
- Bounce pads work with trails
- Charge attacks work with crit system

---

## Notes

### Design Decisions
- **Wall Slide Speed**: 100 px/s (slower than normal fall)
- **Bounce Force**: 800 (stronger than normal jump 600)
- **Max Charge Time**: 1.0 second
- **Charge Damage**: 1x to 2x multiplier

### Technical Notes
- Wall sliding requires input state tracking
- Bounce pads are separate entities
- Charge attacks modify existing magic system
- All features are additive (don't break existing systems)

---

**Created**: Based on Phase 3 requirements from future-ideas.md
**Status**: Ready for Implementation
**Estimated Completion**: 6-8 hours

