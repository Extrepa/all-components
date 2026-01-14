# LoopManager vs UpdateManager - Clear Explanation

**Date**: December 11, 2025

## The Simple Answer

**UpdateManager** is still the main coordinator, but when LoopManager is enabled, UpdateManager delegates MOST of its work to LoopManager. UpdateManager becomes a thin wrapper that:
1. Sets up LoopManager
2. Calls `loopManager.run()` 
3. LoopManager handles all the system updates

## What Actually Happens

### When LoopManager is Enabled (Default)

```javascript
// UpdateManager.update() - Line 195-208
update(deltaTime, elapsedTime, timeInfo, systems) {
    // Initialize LoopManager on first call
    if (this.useLoopManager && !this.loopManager && systems) {
        this.initializeLoopManager(systems);
    }

    // If LoopManager is enabled, delegate EVERYTHING to it
    if (this.useLoopManager && this.loopManager) {
        const systemsWithClock = { ...systems, clock };
        this.loopManager.run(deltaTime, elapsedTime, systemsWithClock);
        return; // ← Returns early! Doesn't do the old methods
    }
    
    // Old code only runs if LoopManager is disabled
    // ...
}
```

**So when LoopManager is enabled, UpdateManager basically just calls LoopManager.run() and that's it!**

### What LoopManager Does

LoopManager was set up with callbacks that handle everything:

```javascript
// In UpdateManager.initializeLoopManager() - Line 116-157

// Avatar movement callback (registered in 'input' bucket)
this.loopManager.addCallback('input', (deltaTime, elapsedTime, systems) => {
    updateAvatarMovement({
        keys: systems.keys,
        avatar: systems.avatar,
        // ... handles input → physics → position
    });
}, { priority: 10 });

// SystemsUpdater callback (registered in 'avatar' bucket)
this.loopManager.addCallback('avatar', (deltaTime, elapsedTime, systems) => {
    updateAllSystems({
        deltaTime,
        elapsedTime,
        clock: systems.clock,
        systems,
    });
}, { priority: 100 });
```

**So LoopManager handles:**
- Avatar movement (via callback in 'input' bucket)
- All system updates (via SystemsUpdater callback in 'avatar' bucket)
- PhysicsSystem, ParticleSystem, AudioSystem (via self-registration)
- CollectibleManager, InteractionSystem (via self-registration)
- AudioReactiveLoop, EnvironmentLoop (via registration)

## So What's UpdateManager's Role Now?

UpdateManager is now a **thin coordinator** that:
1. Creates and configures LoopManager
2. Calls `loopManager.run()` every frame
3. Keeps old methods for backward compatibility (if LoopManager disabled)

**UpdateManager is NOT doing the actual updates anymore** - it's just delegating to LoopManager.

## Why We Did This

The refactoring moved update **logic** from UpdateManager methods to:
1. **Systems themselves** (PhysicsSystem, ParticleSystem, etc.)
2. **Loop objects** (AudioReactiveLoop, EnvironmentLoop)
3. **Existing updaters** (SystemsUpdater, AvatarMovementUpdater)

**Before**: UpdateManager had 20+ methods with all the update logic  
**After**: UpdateManager just calls LoopManager, which calls systems/loops/updaters

## The Key Point

**UpdateManager and LoopManager are NOT the same thing, but UpdateManager now delegates almost everything to LoopManager.**

Think of it like this:
- **UpdateManager** = The manager who used to do everything
- **LoopManager** = The new system that organizes who does what
- **UpdateManager** now just says "Hey LoopManager, run all the updates"
- **LoopManager** says "OK, I'll call PhysicsSystem, ParticleSystem, etc. in the right order"

## Was It Worth It?

**Yes!** Because:
1. Update logic is now with the systems that need it (better organization)
2. Systems can self-register (less coupling)
3. Easier to test individual systems
4. UpdateManager is simpler (just delegates to LoopManager)
5. Old methods still work if LoopManager is disabled (backward compatible)

## Summary

- **UpdateManager**: Thin coordinator that delegates to LoopManager
- **LoopManager**: Organizes and executes all system updates
- **Systems**: Own their update logic and self-register
- **Result**: Better organization, UpdateManager is simpler, systems are more independent

The refactoring was about **moving logic closer to systems** and **reducing UpdateManager's responsibilities**, not replacing UpdateManager with LoopManager.

