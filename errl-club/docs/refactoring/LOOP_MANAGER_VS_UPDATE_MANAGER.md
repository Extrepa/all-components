# LoopManager vs UpdateManager - Understanding the Relationship

**Date**: December 11, 2025

## The Confusion

You might be wondering: "Are LoopManager and UpdateManager the same thing? Did we need to do all this refactoring?"

**Short Answer**: No, they're NOT the same thing. UpdateManager is the main coordinator, and LoopManager is a tool it uses to organize updates better.

## The Relationship

### UpdateManager (The Orchestrator)
- **Role**: Main coordinator that runs every frame
- **Called by**: GameLoop (the animation loop)
- **Responsibilities**:
  - Coordinates the entire update cycle
  - Handles avatar movement (input → physics → position)
  - Handles camera updates
  - Handles visual effects
  - Handles replay/teleport systems
  - **Delegates system updates to LoopManager**

### LoopManager (The Organizer)
- **Role**: Organizes system-specific updates into "buckets"
- **Called by**: UpdateManager (when enabled)
- **Responsibilities**:
  - Groups related updates into buckets (physics, audio, particles, etc.)
  - Manages update priorities and frequencies
  - Allows systems to self-register their update logic
  - Provides pause/resume control via EventBus

## How They Work Together

```
GameLoop (animation loop)
    ↓
    calls UpdateManager.update() every frame
    ↓
UpdateManager.update()
    ├─→ Handles avatar movement (still in UpdateManager)
    ├─→ Handles camera updates (still in UpdateManager)
    ├─→ Handles visual effects (still in UpdateManager)
    └─→ Delegates to LoopManager.run() for system updates
            ↓
        LoopManager.run()
            ├─→ Runs 'physics' bucket → PhysicsSystem.update()
            ├─→ Runs 'particles' bucket → ParticleSystem.update()
            ├─→ Runs 'audio' bucket → AudioSystem.update()
            ├─→ Runs 'avatar' bucket → CollectibleManager.update(), InteractionSystem.update()
            ├─→ Runs 'audioReactive' bucket → AudioReactiveLoop.update()
            └─→ Runs 'environment' bucket → EnvironmentLoop.update()
```

## What Changed (The Refactoring)

### Before Refactoring
```javascript
// UpdateManager.js
update(deltaTime, elapsedTime, timeInfo, systems) {
    // UpdateManager knew about EVERY system
    this.updatePhysics(systems.avatar, deltaTime, systems);  // 100 lines
    this.updateParticles(systems.particleSystem, deltaTime); // 10 lines
    this.updateAudio(systems.audioSystem, clock, deltaTime); // 50 lines
    this.updateAudioReactive(deltaTime, elapsedTime, systems); // 300 lines
    this.updateEnvironment(deltaTime, elapsedTime, systems); // 70 lines
    // ... 15+ more methods
}
```

**Problems**:
- UpdateManager had to know about every system
- Update logic was scattered in UpdateManager
- Hard to test individual systems
- Tight coupling

### After Refactoring
```javascript
// UpdateManager.js
update(deltaTime, elapsedTime, timeInfo, systems) {
    // UpdateManager still handles some things directly
    this.updateAvatarMovement(...); // Still here
    this.updateCamera(...); // Still here
    this.updateVisualEffects(...); // Still here
    
    // But delegates system updates to LoopManager
    if (this.useLoopManager && this.loopManager) {
        this.loopManager.run(deltaTime, elapsedTime, systems);
        return; // Systems update through LoopManager
    }
}

// PhysicsSystem.js (now self-registers)
export class PhysicsSystem extends SystemLoop {
    constructor(scene, loopManager) {
        super('physics', 'physics', 20);
        if (loopManager) {
            this.register(loopManager); // Self-register!
        }
    }
    
    update(deltaTime, elapsedTime, systems) {
        // Physics logic moved HERE from UpdateManager
        this.updatePushableObjects(deltaTime);
    }
}
```

**Benefits**:
- UpdateManager doesn't need to know about system internals
- Update logic is with the systems that need it
- Easier to test individual systems
- Reduced coupling

## What UpdateManager Still Does

UpdateManager still handles important coordination:

1. **Avatar Movement** - Input → Physics → Position (still in UpdateManager)
2. **Camera Updates** - Camera controller updates
3. **Visual Effects** - Post-processing, shader updates
4. **Replay/Teleport** - Replay system, teleport anchors
5. **Interactive Objects** - Portal rifts, throwable drips, etc.
6. **State Management** - StateManager updates
7. **Visual Recorder** - Frame capture

## What LoopManager Handles

LoopManager handles system-specific updates:

1. **PhysicsSystem** - Pushable objects, physics simulation
2. **ParticleSystem** - Particle updates
3. **AudioSystem** - Audio analysis, beat detection
4. **CollectibleManager** - Collectible updates, collection detection
5. **InteractionSystem** - Raycasting, interaction detection
6. **AudioReactiveLoop** - Audio-reactive visual effects
7. **EnvironmentLoop** - Environment animations (fans, screens, etc.)

## Why We Did This

The refactoring wasn't about replacing UpdateManager - it was about **better organization**:

1. **Before**: UpdateManager had 20+ methods, ~1,470 lines, knew about every system
2. **After**: UpdateManager still coordinates, but systems own their update logic
3. **Result**: ~500 lines moved to systems, better organization, easier to maintain

## The Key Insight

**UpdateManager = The Conductor**  
**LoopManager = The Orchestra Organizer**  
**Systems = The Musicians**

UpdateManager still conducts the whole show, but LoopManager helps organize which musicians (systems) play when, and the musicians (systems) know their own parts (update logic).

## Summary

- **UpdateManager**: Still the main coordinator, handles avatar, camera, visual effects
- **LoopManager**: Organizes system updates into buckets with priorities
- **Systems**: Now own their update logic and self-register
- **Result**: Better organization, reduced coupling, easier maintenance

The refactoring was worth it because it moved update logic closer to the systems that need it, making the codebase easier to understand and maintain.

