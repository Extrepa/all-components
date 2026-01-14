# Phase 1 Implementation Plan - Flash Nostalgia Polish

## Overview
Phase 1 focuses on quick wins that add "juice" and Flash-era charm without major architectural changes. All features are high-impact, medium-effort polish improvements.

**Estimated Total Time**: 4-6 hours
**Priority**: High
**Impact**: High

---

## Feature 1: Wiggling Crit Numbers

### Goal
Enhance damage numbers to bounce/wiggle on critical hits, making crits feel more impactful and Flash-game nostalgic.

### Current State
- `FloatingTextManager` displays static damage numbers
- Damage is calculated in `Player.getMeleeDamage()` with variance
- No crit system exists yet
- Numbers spawn at mob position and float upward

### Implementation Steps

#### Step 1.1: Add Crit Detection
**File**: `game/entities/Player.ts`
- Add crit chance calculation (e.g., 10% base crit chance)
- Modify `getMeleeDamage()` to return `{ damage: number, isCrit: boolean }`
- Crit damage: 1.5x or 2x multiplier

**Code Changes**:
```typescript
public getMeleeDamage(): { damage: number; isCrit: boolean } {
    const stats = this.game.getPlayerStats();
    const base = stats.attack;
    const variance = Math.floor(base * 0.2);
    const rand = Math.floor(Math.random() * (variance * 2 + 1)) - variance;
    const damage = Math.max(1, base + rand);
    
    // Crit chance: 10% base
    const isCrit = Math.random() < 0.1;
    const finalDamage = isCrit ? Math.floor(damage * 2) : damage;
    
    return { damage: finalDamage, isCrit };
}
```

#### Step 1.2: Enhance FloatingTextManager
**File**: `game/effects/FloatingTextManager.ts`
- Add `isCrit` flag to `FloatingText` interface
- Add bounce/wiggle animation properties:
  - `bounceOffset`: X-axis wiggle
  - `bounceTimer`: Animation timer
  - `scale`: Size multiplier for crits
- Update `spawn()` to accept `isCrit` parameter
- Update `update()` to animate bounce/wiggle
- Update `render()` to use larger font and yellow color for crits

**Code Changes**:
```typescript
interface FloatingText {
  // ... existing fields
  isCrit?: boolean;
  bounceOffset: number;
  bounceTimer: number;
  scale: number;
}

public spawn(x: number, y: number, text: string, color: string = "#fff", isCrit: boolean = false): void {
  this.texts.push({
    // ... existing fields
    isCrit,
    bounceOffset: 0,
    bounceTimer: 0,
    scale: isCrit ? 1.3 : 1.0,
    color: isCrit ? "#ffcc00" : color, // Yellow for crits
    vy: isCrit ? -80 : -50, // Faster upward movement for crits
  });
}
```

**Animation Logic**:
- Bounce: `bounceOffset = Math.sin(bounceTimer * 20) * 5`
- Scale: Pulse from 1.3 to 1.0 over time
- Timer: Increment `bounceTimer` in `update()`

#### Step 1.3: Update Combat Code
**Files**: `game/scenes/FieldScene.ts`, `game/scenes/BossScene.ts`
- Update damage calls to use new return format
- Pass `isCrit` flag to `floatingText.spawn()`

**Code Changes**:
```typescript
const result = this.player.getMeleeDamage();
mob.takeDamage(result.damage);
this.floatingText.spawn(
  mob.x + mob.width/2, 
  mob.y, 
  result.damage.toString(), 
  result.isCrit ? "#ffcc00" : "#ffcc00", // Yellow for all, but crits wiggle
  result.isCrit
);
```

### Testing Checklist
- [ ] Crits appear with yellow, larger text
- [ ] Crits bounce/wiggle upward
- [ ] Crits happen ~10% of the time
- [ ] Non-crits display normally
- [ ] Animation feels smooth and Flash-like

### Estimated Time: 1.5-2 hours

---

## Feature 2: Hitstop on Big Hits

### Goal
Add brief frame freeze (1-3 frames) on critical hits or boss hits for that "crunchy" Flash game feel.

### Current State
- `Loop.ts` handles fixed timestep updates
- No pause mechanism exists
- Combat happens in scene update loops

### Implementation Steps

#### Step 2.1: Add Hitstop System to Game
**File**: `game/core/Game.ts`
- Add `hitstopFrames: number` property (default 0)
- Add `triggerHitstop(frames: number)` method
- In `update()`, check if `hitstopFrames > 0` and skip update if so
- Decrement `hitstopFrames` each frame

**Code Changes**:
```typescript
export class Game {
  public hitstopFrames: number = 0;
  
  public triggerHitstop(frames: number = 2): void {
    this.hitstopFrames = Math.max(this.hitstopFrames, frames);
  }
  
  public update(dt: number): void {
    // Hitstop: skip updates but continue rendering
    if (this.hitstopFrames > 0) {
      this.hitstopFrames--;
      return; // Skip this update frame
    }
    
    // ... existing update code
  }
}
```

#### Step 2.2: Trigger Hitstop on Crits
**Files**: `game/scenes/FieldScene.ts`, `game/scenes/BossScene.ts`
- After crit damage, call `this.game.triggerHitstop(2)`
- For boss hits, always trigger hitstop (even non-crits)

**Code Changes**:
```typescript
if (result.isCrit) {
  this.game.triggerHitstop(2); // 2 frame freeze
}

// Boss hits always get hitstop
if (this.boss) {
  this.game.triggerHitstop(1); // 1 frame for normal boss hits
  if (result.isCrit) {
    this.game.triggerHitstop(3); // 3 frames for crits
  }
}
```

### Testing Checklist
- [ ] Crits cause brief freeze (2 frames = ~33ms)
- [ ] Boss hits cause freeze (1-3 frames)
- [ ] Freeze doesn't affect rendering (visual continues)
- [ ] Freeze feels "crunchy" not laggy
- [ ] Multiple hits don't stack hitstop incorrectly

### Estimated Time: 1 hour

---

## Feature 3: Screen Vignette on Low HP

### Goal
Add red vignette overlay when player HP drops below 30% for dramatic Flash-game effect.

### Current State
- `Game.render()` handles all rendering
- Player HP is in `Game.state.player.hp`
- No screen overlay system exists

### Implementation Steps

#### Step 3.1: Add Vignette Rendering
**File**: `game/core/Game.ts`
- In `render()`, after scene rendering but before UI
- Check if `player.hp / player.maxHp < 0.3`
- Draw radial gradient vignette (dark red at edges, transparent center)
- Use `ctx.globalCompositeOperation = 'multiply'` for blending

**Code Changes**:
```typescript
public render(): void {
  // ... existing render code (scene, HUD)
  
  // Vignette on low HP
  const hpPercent = this.state.player.hp / this.state.player.maxHp;
  if (hpPercent < 0.3 && hpPercent > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const radius = Math.max(this.width, this.height) * 0.8;
    const intensity = 1 - (hpPercent / 0.3); // 0 to 1 as HP drops
    
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius
    );
    gradient.addColorStop(0, `rgba(255, 0, 0, ${0.3 * intensity})`);
    gradient.addColorStop(0.5, `rgba(200, 0, 0, ${0.2 * intensity})`);
    gradient.addColorStop(1, `rgba(150, 0, 0, ${0.1 * intensity})`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  }
  
  // ... rest of render
}
```

### Testing Checklist
- [ ] Vignette appears when HP < 30%
- [ ] Vignette intensity increases as HP drops
- [ ] Vignette doesn't obscure UI
- [ ] Vignette blends nicely with scene
- [ ] Performance is acceptable

### Estimated Time: 30-45 minutes

---

## Feature 4: Sarcastic Item Descriptions

### Goal
Add witty, humorous descriptions to items for Flash-game charm.

### Current State
- Items defined in `game/data/cosmetics.ts`
- Items have basic `description` field
- `InventoryUI` displays item info
- No item descriptions shown in shop yet

### Implementation Steps

#### Step 4.1: Add Descriptions to Items
**File**: `game/data/cosmetics.ts` (and create `game/data/items.ts` if needed)
- Add sarcastic descriptions to existing items
- Create new data file for consumables/equipment if needed
- Examples:
  - Potion: "Red goo in a bottle. Probably safe."
  - Ether: "Blue goo in a bottle. Tastes like static."
  - Iron Sword: "Pointy metal stick. Very effective against goo."
  - Slime Jelly: "Slightly illegal in 12 provinces."

**Code Changes**:
```typescript
// In cosmetics.ts or new items.ts
export const ITEM_DESCRIPTIONS: Record<string, string> = {
  'potion': "Red goo in a bottle. Probably safe.",
  'ether': "Blue goo in a bottle. Tastes like static.",
  'iron_sword': "Pointy metal stick. Very effective against goo.",
  'leather_armor': "Made from real leather. The slimes are not happy.",
  'hat_crown': "Fit for a (slime) king. Made of paper.",
  'hat_viking': "For the warrior spirit. Horns not included.",
  // ... etc
};
```

#### Step 4.2: Display Descriptions in UI
**Files**: `game/ui/InventoryUI.ts`, `game/ui/ShopUI.ts`
- Show description when hovering/selecting item
- Add description text below item name
- Use smaller, italic font for descriptions

**Code Changes**:
```typescript
// In InventoryUI render method
if (selectedItem) {
  const desc = ITEM_DESCRIPTIONS[selectedItem.id] || "No description available.";
  ctx.fillStyle = "#aaa";
  ctx.font = "italic 12px Inter, system-ui";
  ctx.fillText(desc, x, y + 40);
}
```

### Testing Checklist
- [ ] Descriptions appear in inventory
- [ ] Descriptions appear in shop
- [ ] Descriptions are humorous/sarcastic
- [ ] Descriptions don't break layout
- [ ] All items have descriptions

### Estimated Time: 1 hour

---

## Implementation Order

### Recommended Sequence
1. **Sarcastic Descriptions** (Easiest, no dependencies)
2. **Screen Vignette** (Simple, visual only)
3. **Wiggling Crit Numbers** (More complex, affects combat)
4. **Hitstop** (Requires crit system, most complex)

### Why This Order?
- Start with easiest wins for momentum
- Build up to more complex features
- Each feature can be tested independently
- Hitstop depends on crit system, so do it last

---

## Testing Strategy

### Unit Testing
- Test crit chance calculation
- Test hitstop frame counting
- Test vignette intensity calculation
- Test description lookup

### Integration Testing
- Test crit + hitstop together
- Test vignette + combat together
- Test descriptions in all UI contexts
- Test save/load compatibility

### Playtesting
- Feel test: Do crits feel satisfying?
- Visual test: Does vignette look good?
- Performance test: Any frame drops?
- Balance test: Is crit chance fair?

---

## Rollback Plan

### If Issues Arise
1. **Crit System**: Can disable by setting crit chance to 0%
2. **Hitstop**: Can disable by not calling `triggerHitstop()`
3. **Vignette**: Can disable by checking `hpPercent < 0`
4. **Descriptions**: Can revert to empty strings

### Feature Flags (Optional)
Add config flags to enable/disable each feature:
```typescript
export const FEATURES = {
  CRIT_SYSTEM: true,
  HITSTOP: true,
  VIGNETTE: true,
  DESCRIPTIONS: true,
};
```

---

## Success Criteria

### Phase 1 Complete When:
- [ ] Crits bounce/wiggle with yellow text
- [ ] Crits trigger 2-frame hitstop
- [ ] Boss hits trigger hitstop
- [ ] Vignette appears at <30% HP
- [ ] All items have sarcastic descriptions
- [ ] All features work together smoothly
- [ ] No performance degradation
- [ ] Save/load still works

### Quality Metrics
- Crits feel impactful and satisfying
- Hitstop feels "crunchy" not laggy
- Vignette adds drama without obscuring gameplay
- Descriptions add charm without being annoying

---

## Documentation Updates

### Files to Update
- `docs/features.md`: Add new features
- `docs/progression.md`: Mark Phase 1 complete
- `docs/ai-notes.md`: Document new patterns
- `docs/future-ideas.md`: Move Phase 1 to completed

### Code Comments
- Document crit chance calculation
- Document hitstop frame timing
- Document vignette intensity formula
- Document description system

---

## Future Enhancements (Post-Phase 1)

### Potential Improvements
- **Crit System**: Add crit chance scaling with stats
- **Hitstop**: Different durations for different hit types
- **Vignette**: Add pulsing effect
- **Descriptions**: Add flavor text variations

### Integration with Phase 2
- Crit system works with rarity system
- Hitstop works with achievement popups
- Vignette could trigger achievement
- Descriptions could show rarity info

---

## Notes

### Design Decisions
- **Crit Chance**: 10% base (can be adjusted)
- **Crit Multiplier**: 2x (can be adjusted)
- **Hitstop Duration**: 1-3 frames (33-50ms)
- **Vignette Threshold**: 30% HP (can be adjusted)
- **Description Style**: Sarcastic, Flash-game humor

### Technical Notes
- Hitstop pauses logic but not rendering
- Vignette uses multiply blend mode
- Crit system extends existing damage calculation
- Descriptions are data-driven (easy to modify)

---

**Created**: Based on Phase 1 requirements
**Status**: Ready for Implementation
**Estimated Completion**: 4-6 hours

