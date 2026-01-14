# ErrlStory - Controls & Gameplay Mechanics

## Controls Reference

### Movement
| Action | Keys |
|--------|------|
| Move Left | `Arrow Left` or `A` |
| Move Right | `Arrow Right` or `D` |
| Jump | `Space`, `Arrow Up`, or `W` |
| Dash | `Shift` |
| Crouch | `Arrow Down` or `S` (hold) |
| Drop Through Platform | Hold `Down` + `Jump` |
| Jump Through Platform | Jump up from below platform |

### Combat
| Action | Keys |
|--------|------|
| Melee Attack | `Z` or `K` |
| Magic Attack | `X` or `L` (unlocked at level 5) |
| Charge Magic | Hold `X` or `L` (scales damage) |

### Items & Quick Slots
| Slot | Default Item | Key |
|------|--------------|-----|
| Quick Slot H | Potion (HP) | `H` |
| Quick Slot J | Ether (MP) | `J` |
| Quick Slot K | (Empty) | `K` |
| Quick Slot L | (Empty) | `L` |

**Note**: `K` and `L` can also be used for combat if no item is assigned.

### UI Navigation
| Action | Key |
|--------|-----|
| Open Inventory | `I` |
| Open Quest Log | `Q` |
| Close UI / Back | `Escape` |
| Interact (NPC/Portal) | `Arrow Up` or `W` (when near) |

### Scene Navigation
| Action | Key | Scene |
|--------|-----|-------|
| Start Game | `Enter` or `Space` | Title |
| Go to Field | `F` | Town |
| Go to Boss | `B` | Town |
| Return to Town | `T` | Field / Boss |
| Return to Title | `Escape` | Town |

---

## Gameplay Mechanics

### Movement

#### Horizontal Movement
- **Acceleration-based**: Hold direction to accelerate
- **Friction**: Slows down when not inputting
- **Air Resistance**: Less friction in air
- **Max Speed**: 280 pixels/second

#### Jumping
- **Jump Force**: Instant upward velocity
- **Variable Height**: Release early for shorter jump
- **Coyote Time**: Can jump briefly after leaving platform
- **Jump Buffering**: Input forgiveness for better feel
- **Drop-through**: Hold down + jump to fall through platforms
- **Jump-through**: Can jump up through platforms from below

#### Dash
- **Duration**: 0.15 seconds
- **Speed**: 600 pixels/second
- **Cooldown**: 1.0 second
- **Direction**: Current facing direction
- **Effect**: Ghost trail particles

#### Wall Sliding
- **Activation**: Press against wall while in air
- **Speed**: 100 pixels/second downward
- **Wall Jump**: Jump away from wall
- **Disabled**: In Town/Mayday Plaza (no wall climbing)

### Combat

#### Melee Attack
- **Input**: Z or K
- **Duration**: 0.25 seconds
- **Cooldown**: 0.1 seconds
- **Hitbox**: Arc in front of player
- **Damage**: Level × 2 + weapon bonus (with variance)
- **Effect**: Screen shake, particles, sound

#### Magic Attack
- **Input**: X or L (unlocked at level 5)
- **Cost**: 5 MP (base), scales with charge level
- **Cooldown**: 0.4 seconds
- **Projectile**: Travels forward, damages on hit
- **Damage**: Level × 8 + 10 (base), scales with charge
- **Charge**: Hold button to charge (up to 3 levels)
- **Effect**: Particle trail, impact effects, charge glow

#### Taking Damage
- **Invulnerability**: 1 second after hit
- **Visual**: Flicker effect during invuln
- **Knockback**: Directional push
- **Death**: When HP reaches 0

### Items

#### Consumables

**Potion** (Hotkey: H)
- Restores 20 HP
- Cannot exceed max HP
- Consumed on use

**Ether** (Hotkey: J)
- Restores 20 MP
- Cannot exceed max MP
- Consumed on use

#### Equipment
- **Weapons**: Equip for attack bonus
- **Armor**: Equip for defense bonus
- **Toggle**: Click to equip/unequip
- **Visual**: Changes player appearance

#### Cosmetics
- **Hats**: Visual only
- **Auras**: Visual effect around player
- **Trails**: Dash trail effect
- **Body Colors**: Change player color
- **Toggle**: Click to equip/unequip

### Interaction

#### NPCs
- **Range**: Stand near NPC (interaction radius)
- **Prompt**: "[▲] Talk" appears
- **Action**: Press `Arrow Up` or `W`
- **Dialogue**: Text conversation
- **Quests**: Accept/decline quests

#### Merchant
- **Range**: Stand near Merchant
- **Prompt**: "[▲] Shop" appears
- **Action**: Press `Arrow Up` or `W`
- **Shop UI**: Browse and buy items
- **Navigation**: Arrow keys, Enter, Escape

#### Portals
- **Range**: Stand on portal
- **Prompt**: "[▲] Enter" appears
- **Action**: Press `Arrow Up` or `W`
- **Effect**: Warp to new area
- **Sound**: Portal sound effect

### Progression

#### Leveling
- **XP Source**: Defeating enemies
- **XP Curve**: Exponential (50, 75, 112, ...)
- **Level Up**: 
  - Max HP +10
  - Max MP +5
  - HP/MP fully restored
  - Visual/audio celebration

#### Stats
- **HP**: Health points (starts at 50)
- **MP**: Mana points (starts at 20)
- **Attack**: Base (level × 2) + weapon bonus
- **Defense**: Base (level × 1) + armor bonus

#### Currency
- **Goo Bits**: Primary currency
- **Source**: Enemy drops
- **Use**: Buy items from merchant
- **Death Penalty**: Lose some Goo on death

---

## Advanced Mechanics

### Physics

#### Gravity
- **Constant**: 1500 pixels/second²
- **Effect**: Pulls player down
- **Terminal Velocity**: Capped by friction

#### Collision
- **Type**: AABB (Axis-Aligned Bounding Box)
- **Response**: Stop at walls, ground
- **Platforms**: Solid rectangles

#### Coyote Time
- **Duration**: 0.1 seconds
- **Effect**: Can jump after leaving platform
- **Purpose**: Better feel, less frustration

#### Jump Buffering
- **Duration**: 0.15 seconds
- **Effect**: Jump input remembered briefly
- **Purpose**: Forgiving input timing

### Combat Mechanics

#### Damage Calculation
- **Melee**: Base attack + variance (±20%)
- **Magic**: Fixed damage (higher than melee)
- **Defense**: Reduces incoming damage
- **Minimum**: Always deal at least 1 damage

#### Hit Detection
- **Melee**: Arc hitbox in front of player
- **Projectile**: Collision with enemy bounds
- **Contact**: Player touching enemy (damage over time)

#### Invulnerability
- **Duration**: 1.0 second after hit
- **Visual**: Flicker effect
- **Effect**: Cannot take damage during this time

### Mana System

#### Mana Regeneration
- **Rate**: 1 MP per second
- **Condition**: Only when below max MP
- **Passive**: Automatic regeneration

#### Mana Usage
- **Magic Attack**: Costs 5 MP
- **Cooldown**: 0.4 seconds between casts
- **Limitation**: Cannot cast if MP < 5

---

## Tips & Strategies

### Movement
- **Dash**: Use for quick repositioning
- **Jump Timing**: Use coyote time for edge jumps
- **Air Control**: Less friction in air, plan ahead

### Combat
- **Melee**: Quick, low cost, close range
- **Magic**: Slower, costs MP, long range
- **Mix**: Use both for efficiency
- **Dodge**: Dash away from attacks

### Items
- **Potions**: Save for low HP situations
- **Ether**: Use when MP is low
- **Quick Slots**: Assign frequently used items
- **Equipment**: Equip for stat bonuses

### Progression
- **Quests**: Complete for XP and rewards
- **Grinding**: Farm enemies for XP and Goo
- **Boss**: Challenge when ready (high HP recommended)
- **Death**: Avoid losing Goo, use potions

---

## Mobile Controls

### Touch Input
- **D-Pad Area**: Left side of screen (200x200px)
  - Left button: Move left
  - Right button: Move right
  - Jump button: Top center
- **Action Buttons**: Right side of screen (60x60px each)
  - Attack button: Bottom right
  - Magic button: Bottom right (next to attack)
- **Auto-Detection**: Automatically enabled on mobile/touch devices

---

## Known Issues & Limitations

### Current Limitations
- No key rebinding (planned)
- No controller support (planned)
- Limited input customization
- Some keys serve multiple purposes (K, L)

### Workarounds
- Use alternative keys if conflicts occur
- Check key assignments in quick slots
- Use mouse for UI navigation (where supported)
- Use touch controls on mobile devices

---

## Accessibility Notes

### Visual
- High contrast colors
- Clear UI indicators
- Damage numbers visible
- Health bars always shown

### Audio
- Sound effects for feedback
- Visual indicators for audio cues
- (Planned: Volume controls)

### Input
- Multiple key options for actions
- Forgiving input timing
- Clear control prompts

---

**Last Updated**: Based on current implementation

