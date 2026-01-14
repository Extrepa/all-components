# ErrlStory - Game Design Document

## Overview

**ErrlStory** is a 2D side-scrolling action RPG inspired by MapleStory, featuring a goo creature protagonist named Errl. The game focuses on responsive controls, satisfying combat, and nostalgic Flash-era charm.

---

## Core Concept

### Elevator Pitch
"A MapleStory-inspired 2D action RPG where you play as Errl, a goo creature exploring a world of slimes, quests, and adventure. Built with modern web tech but feels like a classic Flash game."

### Target Audience
- Fans of MapleStory and similar 2D RPGs
- Nostalgia seekers (Flash game era)
- Casual action RPG players
- Indie game enthusiasts

### Core Pillars
1. **Responsive Feel**: Tight controls, satisfying feedback
2. **Juice**: Visual/audio polish that makes actions feel good
3. **Nostalgia**: Flash-era charm without the jank
4. **Progression**: RPG systems that feel rewarding

---

## Gameplay Loop

### Core Loop
1. **Explore**: Navigate areas (Town, Field, Boss Arena)
2. **Combat**: Fight enemies with melee and magic
3. **Loot**: Collect items and currency
4. **Progress**: Level up, complete quests
5. **Upgrade**: Buy equipment, cosmetics
6. **Repeat**: New areas, stronger enemies

### Session Flow
- Start in Town (hub)
- Accept quests from NPCs
- Travel to Field (combat area)
- Fight enemies, collect loot
- Return to Town
- Turn in quests, shop
- Challenge Boss Arena
- Repeat or explore

---

## Player Character: Errl

### Visual Design
- **Appearance**: Square-ish goo creature
- **Color**: Cyan (#8afff2) by default, customizable
- **Eyes**: Two dots
- **Size**: 32x32 pixels
- **Style**: Simple, charming, pixel-art

### Abilities
- **Movement**: Run, jump, dash
- **Combat**: Melee attack, magic projectile
- **Items**: Use consumables (potions, ether)
- **Customization**: Equipment and cosmetics

### Progression
- **Leveling**: XP-based, exponential curve
- **Stats**: HP, MP, Attack, Defense
- **Equipment**: Weapons, armor
- **Cosmetics**: Hats, auras, trails, body colors

---

## Combat System

### Melee Combat
- **Input**: Z or K key
- **Mechanic**: Hitbox generation in front of player
- **Damage**: Level + weapon bonus
- **Feel**: Quick, responsive, satisfying

### Magic Combat
- **Input**: X or L key
- **Mechanic**: Projectile that travels forward
- **Cost**: 5 MP per cast
- **Damage**: Higher than melee, scales with level
- **Feel**: Ranged option, strategic resource management

### Enemy Combat
- **Mobs**: Basic enemies (Slimes)
- **Bosses**: Stronger enemies (Royal Slime)
- **AI**: Simple patterns (pace, jump attacks)
- **Drops**: Items and currency on death

### Feedback
- **Damage Numbers**: Floating text
- **Screen Shake**: Camera shake on hits
- **Particles**: Sparks, dust, effects
- **Audio**: Impact sounds, magic sounds

---

## World & Areas

### Town (Mayday Plaza)
- **Purpose**: Hub area
- **Features**: NPCs, Merchant, Portals
- **Atmosphere**: Safe, social, colorful
- **Layout**: Flat ground, simple platforms

### Field (Slimey Hills)
- **Purpose**: Combat/grind area
- **Features**: Mobs, platforms, loot
- **Atmosphere**: Dangerous, active
- **Layout**: Platforming challenges

### Boss Arena (Royal Arena)
- **Purpose**: Boss battle
- **Features**: Royal Slime, arena layout
- **Atmosphere**: Epic, challenging
- **Layout**: Circular arena

---

## RPG Systems

### Leveling
- **XP Source**: Defeating enemies
- **XP Curve**: Exponential (50, 75, 112, ...)
- **Level Benefits**: 
  - Increased max HP (+10 per level)
  - Increased max MP (+5 per level)
  - Increased base attack/defense
  - Full HP/MP restore on level up

### Inventory
- **Types**: Consumables, Equipment, Cosmetics, Misc
- **Management**: Drag & drop, stacking
- **Display**: List view with icons
- **Quick Slots**: H, J, K, L keys

### Equipment
- **Weapons**: Attack bonus
- **Armor**: Defense bonus
- **Cosmetics**: Visual only (hats, auras, trails, colors)
- **Equip**: Click to equip/unequip

### Currency
- **Goo Bits**: Primary currency
- **Source**: Enemy drops
- **Use**: Buy items from merchant
- **Balance**: Enough for progression, not too easy

---

## Quest System

### Quest Types
- **KILL**: Defeat X enemies
- **COLLECT**: Gather X items

### Quest Flow
1. **Accept**: Talk to NPC, accept quest
2. **Progress**: Complete objectives
3. **Turn In**: Return to NPC
4. **Reward**: XP, Goo, Items

### Quest Examples
- **Errl's First Hunt**: Defeat 5 Slimes
- **Goo Gatherer**: Collect 10 Goo Bits
- **Royal Trouble**: Defeat Royal Slime

### Quest Rewards
- XP (experience points)
- Goo Bits (currency)
- Items (potions, equipment)

---

## Daily Challenges

### Challenge Types
- **KILL**: Defeat X enemies today
- **COLLECT**: Gather X items today
- **BOSS**: Defeat boss today

### Mechanics
- **Daily Reset**: Resets at midnight
- **Progress Tracking**: Real-time updates
- **Rewards**: Claimable on completion
- **Timed**: Optional time limits

---

## Economy

### Items

#### Consumables
- **Potion**: Restores 20 HP (Hotkey: H)
- **Ether**: Restores 20 MP (Hotkey: J)

#### Equipment
- **Iron Sword**: +Attack
- **Leather Armor**: +Defense

#### Cosmetics
- **Hats**: Crown, Viking Helm, Cowboy Hat
- **Auras**: Fire, Ice
- **Trails**: Rainbow
- **Body Colors**: Midnight, Crimson, Gold

### Merchant
- **Location**: Town
- **Items**: Consumables, Cosmetics
- **Currency**: Goo Bits
- **UI**: Overlay shop interface

---

## Controls

### Movement
- **Left/Right**: Arrow Keys or A/D
- **Jump**: Space, Arrow Up, or W
- **Dash**: Shift

### Combat
- **Melee**: Z or K
- **Magic**: X or L

### Items
- **Quick Slots**: H, J, K, L

### UI
- **Inventory**: I
- **Quest Log**: Q
- **Interact**: Arrow Up or W (near NPC/Portal)
- **Close UI**: Escape

### Navigation
- **Return to Town**: T (from Field/Boss)
- **Return to Title**: Escape (from Town)

---

## Visual Style

### Art Direction
- **Style**: Pixel-art, simple, charming
- **Palette**: Dark backgrounds, neon accents
- **Colors**: 
  - Background: #050811, #162447
  - Player: #8afff2 (cyan)
  - UI: #34e1ff (neon blue)
  - Damage: #ffcc00 (yellow)
  - Health: #ff4444 (red)
  - Mana: #34e1ff (blue)

### Visual Effects
- **Particles**: Dust, sparks, ghost trails
- **Screen Shake**: Camera shake on impacts
- **Floating Text**: Damage numbers, notifications
- **Level Up**: Screen flash, particles

### UI Style
- **Font**: Inter (system fallback)
- **Icons**: Pixel-art icons
- **Layout**: Bottom-right action bar
- **Modals**: Overlay interfaces

---

## Audio Design

### Sound Effects
- **Combat**: Attack, hit, magic
- **Movement**: Jump, step, dash
- **UI**: Collect, level up
- **Combat**: Die

### Audio Style
- **Synthesis**: WebAudio API (no files)
- **Style**: Retro, chiptune-inspired
- **Volume**: Balanced, not overwhelming

### Music
- **Status**: Planned
- **Style**: Ambient, combat, boss themes
- **Implementation**: Background music system

---

## Progression Curve

### Early Game (Levels 1-5)
- **Focus**: Learn controls, basic combat
- **Enemies**: Weak slimes
- **Quests**: Simple kill/collect
- **Rewards**: Basic items, small XP

### Mid Game (Levels 6-10)
- **Focus**: Equipment, quest chains
- **Enemies**: Stronger variants
- **Quests**: Multi-step chains
- **Rewards**: Better items, more XP

### Late Game (Levels 11+)
- **Focus**: Boss battles, cosmetics
- **Enemies**: Bosses, elite mobs
- **Quests**: Epic quests
- **Rewards**: Rare items, large XP

---

## Difficulty Design

### Philosophy
- **Accessible**: Easy to learn
- **Challenging**: Requires skill
- **Fair**: No cheap deaths
- **Rewarding**: Progress feels earned

### Difficulty Factors
- **Enemy HP**: Scales with player level
- **Enemy Damage**: Reasonable, avoidable
- **Boss Patterns**: Learnable, predictable
- **Death Penalty**: Lose some Goo, respawn

---

## Narrative & Tone

### Story
- **Style**: Light, humorous
- **Tone**: Charming, not serious
- **Focus**: Gameplay over story
- **NPCs**: Quirky, memorable

### World
- **Setting**: Fantasy world of goo creatures
- **Atmosphere**: Whimsical, colorful
- **Lore**: Minimal, implied
- **Humor**: Sarcastic, meta, Flash-era

---

## Replayability

### Current
- **Quest Completion**: Replay for rewards
- **Boss Fights**: Challenge again
- **Cosmetic Collection**: Unlock all cosmetics
- **Daily Challenges**: Daily objectives

### Future
- **New Game+**: Rebirth system
- **Achievements**: Unlock goals
- **Secrets**: Hidden areas, items
- **Content Updates**: New areas, enemies

---

## Technical Constraints

### Platform
- **Target**: Web browsers
- **Tech**: HTML5 Canvas, React, TypeScript
- **Performance**: 60 FPS target
- **Compatibility**: Modern browsers

### Limitations
- **No External Assets**: Code-generated graphics/audio
- **LocalStorage**: Save data limited
- **Canvas API**: 2D rendering only
- **WebAudio**: Synthesis, no files

---

## Success Metrics

### Feel
- **Responsive**: Input feels instant
- **Juicy**: Actions feel satisfying
- **Polished**: Visual/audio feedback

### Engagement
- **Session Length**: 15-30 minutes
- **Retention**: Daily challenges
- **Progression**: Clear advancement

### Quality
- **Stability**: No crashes
- **Performance**: 60 FPS
- **Polish**: No obvious bugs

---

## Future Vision

### Short Term
- Flash nostalgia features
- More content (enemies, areas, quests)
- UI improvements
- Audio enhancements

### Long Term
- Multiplayer
- Cloud saves
- Content updates
- Modding support

---

## Design Principles

1. **Juice First**: Polish and feel over features
2. **Responsive**: Controls must feel tight
3. **Nostalgic**: Flash-era charm
4. **Accessible**: Easy to learn, hard to master
5. **Progressive**: Clear advancement path

---

**Last Updated**: Based on current implementation and design goals

