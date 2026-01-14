# ErrlStory - Features Documentation

## Overview
ErrlStory is a 2D side-scrolling action RPG inspired by MapleStory, featuring a goo creature protagonist named Errl. This document catalogs all implemented features.

---

## Core Systems

### Game Loop
- **Fixed Timestep**: Logic updates at exactly 60Hz (16.67ms per frame)
- **Variable Rendering**: Visual rendering runs at display refresh rate
- **Input Buffering**: Inputs are captured and cleared at frame boundaries

### Scene Management
- **Title Scene**: Main menu with New Game / Continue options
- **Town Scene**: Hub area with NPCs, Merchant, and Portals
- **Field Scene**: Combat/grind area with mobs and loot
- **Boss Scene**: Arena with Royal Slime boss battle
- **Game Over Scene**: Death screen with respawn options

### Camera System
- Follows player with smooth interpolation
- Map boundary clamping
- Screen shake effects on impacts
- Parallax background support

---

## Player Systems

### Movement & Physics
- **Horizontal Movement**: Acceleration-based with friction
- **Jumping**: Variable jump height with coyote time
- **Jump Buffering**: Input forgiveness for better feel
- **Dash Ability**: Shift key for quick horizontal dash
- **Wall Sliding**: Slide down walls (disabled in Town)
- **Wall Jumping**: Jump away from walls
- **Drop-through Platforms**: Hold down + jump to fall through
- **Jump-through Platforms**: Jump up through platforms from below
- **Crouch**: Hold down to squish player (visual effect)
- **Gravity**: Realistic fall physics
- **Collision**: AABB collision detection with platforms

### Combat
- **Melee Attack**: Z/K key with hitbox generation
- **Magic Attack**: X/L key fires projectiles (consumes 5 MP, unlocked at level 5)
- **Charge Attack**: Hold X/L to charge magic (scales damage and MP cost)
- **Critical Hits**: 10% chance, 2x damage multiplier
- **Damage Calculation**: Level-based with equipment bonuses
- **Invulnerability Frames**: 1 second after taking damage
- **Knockback**: Directional knockback on hit
- **Hitstop**: Frame freeze on big hits (1 frame normal, 3 frames crit)

### Stats & Progression
- **Level System**: XP-based leveling with exponential curve
- **HP/MP**: Health and Mana pools with regeneration
- **Equipment**: Weapons and Armor with stat bonuses
- **Cosmetics**: Hats, Auras, Trails, Body Colors
- **Quick Slots**: H, J, K, L keys for consumables/items

---

## Combat Systems

### Mobs
- **Slime**: Basic enemy with simple AI (pace back and forth)
- **Royal Slime**: Boss with jump attack pattern
- **AI Behaviors**: Movement patterns, attack patterns
- **Death Drops**: Physical item drops with bounce physics

### Projectiles
- **Magic Bolt**: Player projectile with damage scaling
- **Collision Detection**: AABB-based hit detection
- **Visual Effects**: Particle trails and impact effects

### Damage System
- **Floating Damage Numbers**: Color-coded damage text
- **Critical Hits**: Wiggling/bouncing yellow numbers, larger font
- **Hitstop**: Frame freeze on big hits (1 frame normal, 3 frames crit)
- **Screen Shake**: Camera shake on impacts
- **Low HP Vignette**: Darkening effect when HP is low

---

## RPG Systems

### Inventory
- **Item Types**: Consumables, Equipment, Cosmetics, Misc
- **Drag & Drop**: Visual item management
- **Item Icons**: Pixel-art icons for all item types
- **Stacking**: Stackable consumables with count display

### Equipment
- **Weapon Slots**: Primary weapon with attack bonus
- **Armor Slots**: Body armor with defense bonus
- **Cosmetic Slots**: Hat, Aura, Trail, Body Color
- **Stat Calculation**: Base stats + equipment bonuses

### Quest System
- **Quest Types**: KILL (defeat mobs) and COLLECT (gather items)
- **Quest Log**: Active and completed quest tracking
- **Quest Tracker**: Unified UI displaying regular and daily quests
  - Shows up to 3 regular quests and 1 daily quest
  - Minimizable/expandable panel
  - Dynamic width for text content
  - Positioned top-right, 100px from top
- **Quest Rewards**: XP, Goo Bits, Items
- **Prerequisites**: Quest chains with dependencies

### Daily Challenges
- **Challenge Types**: KILL, COLLECT, BOSS
- **Daily Reset**: Automatic reset at midnight
- **Progress Tracking**: Real-time progress updates
- **Rewards**: Claimable rewards on completion

---

## Economy

### Currency
- **Goo Bits**: Primary currency dropped by mobs
- **Merchant Shop**: Buy consumables and cosmetics
- **Item Prices**: Balanced economy with progression

### Merchant
- **Shop UI**: Overlay interface with navigation
- **Item Catalog**: Potions, Ether, Cosmetics
- **Purchase Logic**: Currency deduction and item addition

---

## Visual Effects

### Particle System
- **Dust**: Landing and movement particles
- **Sparks**: Combat impact particles
- **Ghost Trails**: Dash and death effects
- **Particle Lifecycle**: Automatic cleanup

### Floating Text
- **Damage Numbers**: Color-coded damage display
- **Item Pickups**: "Got Item!" notifications
- **Quest Updates**: Progress notifications
- **Animation**: Fade out and upward movement

### Level Up Effects
- **Visual Flash**: Screen-wide effect
- **Particle Burst**: Sparkle effects
- **Audio Fanfare**: Level up sound effect

---

## Audio System

### Sound Effects
- **Combat**: Attack, Hit, Magic, Die
- **Movement**: Jump, Step, Dash
- **UI**: Collect, Level Up
- **Synthesis**: WebAudio API-based sound generation

### Audio Features
- **Volume Control**: (Planned)
- **Spatial Audio**: (Planned)
- **Music**: (Planned)

---

## UI Systems

### Main HUD
- **Player Portrait**: Errl sprite badge display
- **HP/MP Bars**: Visual health and mana indicators
- **EXP Display**: Thin bar at bottom edge
- **Quick Slots**: H, J, K, L key indicators (32x24px buttons)
- **Skill Buttons**: Z, X, Shift, Space indicators (second row)
- **Menu Icons**: Bag, Quest, Menu buttons (40x40px)
- **Button Labels**: Text above icons

### Inventory UI
- **List View**: Item list with icons
- **Drag & Drop**: Visual item manipulation
- **Item Details**: Name, count, description
- **Equipment Display**: Currently equipped items

### Quest UI
- **Quest Log**: Full quest list with details (Q key)
- **Quest Tracker**: Unified panel with regular and daily quests
  - Minimizable header
  - Dynamic width based on content
  - Left-aligned text
  - Compact, optimized layout
- **Progress Bars**: Visual progress indicators

### Dialogue System
- **NPC Dialogue**: Text-based conversations
- **Dialogue Options**: Accept/Decline quests
- **Text Animation**: (Planned: typewriter effect)

### Shop UI
- **Item Catalog**: Browse available items
- **Purchase Interface**: Buy with Goo Bits
- **Navigation**: Keyboard and mouse support

### Minimap
- **Area Display**: Current location indicator
- **Entity Markers**: NPCs, Portals, Player
- **Area Names**: Location labels
- **Interactive Legend**: Appears on hover/click, fades out
- **Legend Layout**: Single row, compact text
- **Invisible Portal Filtering**: Hidden portals not shown on minimap

---

## Persistence

### Save System
- **LocalStorage**: Browser-based save storage
- **Auto-Save**: Triggers on quest completion, boss victory
- **Save Data**: Player stats, inventory, quest progress, daily challenges
- **Load System**: Continue from title screen

### Save Data Structure
- Player level, XP, HP, MP, Goo Bits
- Inventory items with counts
- Equipment and cosmetics
- Quest log (active and completed)
- Daily challenge state
- Quick slot assignments

---

## World & Environment

### Maps
- **Town**: Hub area with NPCs and portals
- **Field**: Combat area with platforms and mobs
- **Boss Arena**: Circular arena for boss battles
- **Platform Geometry**: AABB collision rectangles

### Portals
- **Physical Entities**: Interactable portal objects
- **Scene Transitions**: Warp between areas
- **Visual Effects**: Glowing portal animations
- **Interaction Prompts**: "[▲] Enter" text

### Backgrounds
- **Gradient Backgrounds**: Scene-specific color schemes
- **Parallax**: (Planned: layered backgrounds)

---

## Technical Features

### Rendering
- **Canvas API**: HTML5 Canvas 2D rendering
- **Pixel Art Style**: Pixelated rendering mode
- **Color Palette**: Neon/Dark theme
- **Font**: Inter font family for UI

### Input System
- **Keyboard Input**: WASD, Arrow Keys, Space, Shift
- **Mouse Input**: Click detection for UI
- **Input Buffering**: Frame-accurate input capture
- **Key Mapping**: Configurable (planned)

### Performance
- **Entity Cleanup**: Automatic removal of dead entities
- **Particle Limits**: Efficient particle management
- **Render Optimization**: Only visible entities rendered

---

## Accessibility & Polish

### Visual Feedback
- **Invulnerability Flicker**: Visual damage feedback
- **Death Animation**: Spin and fade out
- **Level Up Effects**: Celebratory visuals
- **Interaction Prompts**: Clear UI indicators

### Game Feel
- **Juice**: Particle effects, screen shake, sound
- **Responsive Controls**: Coyote time, jump buffering
- **Visual Polish**: Squash/stretch animations, shadows

---

## Dev Tools

### Dev Room
- **Access**: Invisible portal in center of Town
- **Dev Menu**: Toggle with `~` or `F1` key
- **Features**:
  - God Mode (invincibility)
  - Infinite MP
  - Freeze AI
  - Stun All Mobs
  - Show Hitboxes
  - Show AI State
  - Enemy Spawning (Slime, Royal Slime)
  - Kill All Mobs
  - Currency/XP Management (+10/+100/+1000 Goo, +100/+1000 XP, Level Up)
  - Physics Controls (Gravity 0.5x/1x/2x, Time 0.5x/1x/2x)
  - Scene Teleporter (Town, Field, Boss, Dev Room)
- **Dev Mode**: Master toggle to enable/disable dev features in other scenes

---

## Mobile Support

### Touch Controls
- **Device Detection**: Automatic detection of mobile/touch devices
- **Virtual D-Pad**: 200x200px area for movement (left side)
- **Action Buttons**: 60x60px buttons for Jump, Attack, Magic (right side)
- **Touch Input**: Full touch event handling with buffering
- **Layout**: Optimized for mobile screens

---

## Known Limitations

- No music system yet
- No volume controls
- Limited quest variety
- No multiplayer
- No cloud saves
- Limited cosmetic variety
- No item rarity system (planned)

---

## Version
**Current Version**: v0.1 (React Prototype)
**Last Updated**: Based on Milestone 19 completion (Errl Sprite & Platform Mechanics)

