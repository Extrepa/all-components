# ErrlStory Documentation

Welcome to the ErrlStory documentation! This folder contains comprehensive documentation for the project.

## Documentation Index

### Core Documentation
- **[features.md](./features.md)** - Complete list of all implemented features
- **[progression.md](./progression.md)** - Development milestones and roadmap
- **[architecture.md](./architecture.md)** - Technical architecture and design patterns
- **[game-design.md](./game-design.md)** - Game design document and vision
- **[ASSET_SIZES.md](./ASSET_SIZES.md)** - Complete asset size requirements reference

### Developer Resources
- **[ai-notes.md](./ai-notes.md)** - Instructions for AI agents working on the project
- **[agent-notes.md](./agent-notes.md)** - Notes for human developers
- **[controls.md](./controls.md)** - Controls reference and gameplay mechanics

### Planning & Ideas
- **[future-ideas.md](./future-ideas.md)** - Future features, improvements, and concepts

## Quick Start

### For Developers
1. Read [architecture.md](./architecture.md) for technical overview
2. Read [ai-notes.md](./ai-notes.md) for coding guidelines
3. Check [features.md](./features.md) to see what's implemented
4. Review [progression.md](./progression.md) for current status

### For Designers
1. Read [game-design.md](./game-design.md) for design vision
2. Check [features.md](./features.md) for current features
3. Review [future-ideas.md](./future-ideas.md) for planned features

### For Players
1. Read [controls.md](./controls.md) for how to play
2. Check [features.md](./features.md) for what's available

## Documentation Structure

```
docs/
├── README.md           # This file
├── features.md         # Feature catalog
├── progression.md      # Milestones & roadmap
├── architecture.md     # Technical architecture
├── game-design.md      # Game design document
├── ai-notes.md         # AI agent instructions
├── agent-notes.md      # Developer notes
├── controls.md         # Controls & mechanics
├── ASSET_SIZES.md      # Asset size requirements
├── ERRL_SPRITE_PREP.md # Errl sprite preparation guide
├── dev-room-plan.md    # Dev Room feature plan
├── mobile-controls-plan.md # Mobile controls plan
├── phase1-plan.md      # Phase 1 implementation plan
├── phase3-plan.md      # Phase 3 implementation plan
└── future-ideas.md     # Future features
```

## Key Concepts

### Core Architecture
- **Fixed Timestep Loop**: 60Hz logic updates
- **Scene System**: Title, Town, Field, Boss, GameOver
- **Entity System**: OOP inheritance (Entity → Mob → Player)
- **State Management**: Centralized in Game.ts

### Game Systems
- **Combat**: Melee (Z/K) and Magic (X/L)
- **RPG**: Leveling, inventory, equipment, quests
- **Economy**: Goo Bits currency, merchant shop
- **Persistence**: LocalStorage save/load

### Visual Style
- **Pixel-art**: Simple, charming style
- **Color Palette**: Dark backgrounds, neon accents
- **Effects**: Particles, screen shake, floating text

## Contributing

When adding new features:
1. Update [features.md](./features.md) with new features
2. Update [progression.md](./progression.md) with milestones
3. Update [architecture.md](./architecture.md) if architecture changes
4. Update [ai-notes.md](./ai-notes.md) if patterns change

## Related Files

- `DEV_NOTES.md` - Original development notes (root)
- `README.md` - Project overview (root)
- `types.ts` - TypeScript type definitions

---

**Last Updated**: Based on Milestone 19 completion (Errl Sprite & Platform Mechanics)

