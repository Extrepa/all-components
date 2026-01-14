# LoopManager Code Reduction Plan

**Goal**: Use LoopManager to reduce code complexity and lines of code in UpdateManager and related files.

## Current State

### UpdateManager.js (~1,400 lines)
- Has 20+ individual update methods:
  - `updateAvatar()` - ~200 lines
  - `updatePhysics()` - ~100 lines
  - `updateAudio()` - ~50 lines
  - `updateParticles()` - ~10 lines
  - `updateCollectibles()` - ~30 lines
  - `updateVisualEffects()` - ~50 lines
  - `updateAudioReactive()` - ~300 lines
  - `updateEnvironment()` - ~70 lines
  - And many more...

- Each method manually checks if systems exist
- Each method manually calls system update methods
- Tight coupling - UpdateManager knows about every system

## Refactoring Strategy

### Phase 1: Self-Registering Systems (High Impact)

Instead of UpdateManager calling each system, systems register themselves:

**Before** (~1,400 lines in UpdateManager):
```javascript
// UpdateManager.js
update(deltaTime, elapsedTime, timeInfo, systems) {
    this.updateAvatar(systems.inputManager, systems.avatar, deltaTime, systems);
    this.updatePhysics(systems.avatar, deltaTime, systems);
    this.updateAudio(systems.audioSystem, clock, deltaTime, systems);
    this.updateParticles(systems.particleSystem, deltaTime, systems);
    // ... 20+ more methods
}

updateAvatar(inputManager, avatar, deltaTime, systems) {
    if (!inputManager || !avatar) return;
    // 200 lines of avatar update logic
}

updatePhysics(avatar, deltaTime, systems) {
    if (!avatar || !systems.physicsSystem) return;
    // 100 lines of physics logic
}
```

**After** (~200 lines in UpdateManager):
```javascript
// UpdateManager.js
update(deltaTime, elapsedTime, timeInfo, systems) {
    if (this.loopManager) {
        this.loopManager.run(deltaTime, elapsedTime, systems);
    }
}

initializeLoopManager(systems) {
    // Systems self-register - no need to know about them here
    // Just create buckets
}
```

**Systems register themselves**:
```javascript
// PhysicsSystem.js
export class PhysicsSystem {
    constructor(scene, loopManager) {
        this.scene = scene;
        
        // Self-register with LoopManager
        if (loopManager) {
            loopManager.addLoop('physics', this, 'physics');
        }
    }
    
    update(deltaTime, elapsedTime, systems) {
        // Physics update logic (moved from UpdateManager)
        this.updatePushableObjects(deltaTime);
        // ...
    }
}
```

**Estimated Reduction**: ~1,200 lines removed from UpdateManager

### Phase 2: System-Specific Loop Objects

Create dedicated loop objects for complex systems:

**Before** (300 lines in UpdateManager.updateAudioReactive):
```javascript
// UpdateManager.js
updateAudioReactive(deltaTime, elapsedTime, systems) {
    // 300 lines of audio-reactive logic
    // - Bloom intensity updates
    // - LED strip color mapping
    // - Speaker cone animation
    // - Material property updates
    // etc.
}
```

**After** (New file: `src/systems/AudioReactiveLoop.js`):
```javascript
// AudioReactiveLoop.js
export class AudioReactiveLoop {
    constructor() {
        this.bloomIntensity = 1.5;
        this.ledHue = 0;
    }
    
    update(deltaTime, elapsedTime, systems) {
        // All audio-reactive logic here
        this.updateBloom(systems);
        this.updateLEDs(systems);
        this.updateSpeakers(systems);
        // ...
    }
}

// Register in GameInitializer
const audioReactiveLoop = new AudioReactiveLoop();
loopManager.addLoop('audioReactive', audioReactiveLoop, 'audioReactive');
```

**Estimated Reduction**: ~300 lines removed from UpdateManager

### Phase 3: Environment Loop Object

**Before** (70 lines in UpdateManager.updateEnvironment):
```javascript
// UpdateManager.js
updateEnvironment(deltaTime, elapsedTime, systems) {
    // Fan rotation
    // Screen texture animation
    // Neon sign updates
    // DJ placeholder animation
    // etc.
}
```

**After** (New file: `src/systems/EnvironmentLoop.js`):
```javascript
// EnvironmentLoop.js
export class EnvironmentLoop {
    update(deltaTime, elapsedTime, systems) {
        this.updateFans(deltaTime, systems);
        this.updateScreens(elapsedTime, systems);
        this.updateNeonSigns(deltaTime, elapsedTime, systems);
        // ...
    }
}
```

**Estimated Reduction**: ~70 lines removed from UpdateManager

## Files That Can Be Simplified

### 1. UpdateManager.js
- **Current**: ~1,400 lines
- **After**: ~200 lines
- **Reduction**: ~1,200 lines (85% reduction)

### 2. SystemsUpdater.js
- **Current**: ~360 lines
- **After**: Can be simplified or removed as systems self-register
- **Reduction**: ~200 lines (55% reduction)

### 3. New System Loop Files
- Create dedicated loop objects for complex systems
- Better organization and testability
- Each system owns its update logic

## Implementation Steps

### Step 1: Create System Loop Interfaces
```javascript
// src/systems/SystemLoop.js (base class)
export class SystemLoop {
    constructor(name, bucketName, priority = 100) {
        this.name = name;
        this.bucketName = bucketName;
        this.priority = priority;
    }
    
    update(deltaTime, elapsedTime, systems) {
        throw new Error('SystemLoop.update() must be implemented');
    }
    
    register(loopManager) {
        loopManager.addLoop(this.name, this, this.bucketName);
    }
}
```

### Step 2: Refactor PhysicsSystem
```javascript
// PhysicsSystem.js
import { SystemLoop } from './SystemLoop.js';

export class PhysicsSystem extends SystemLoop {
    constructor(scene, loopManager) {
        super('physics', 'physics', 20);
        this.scene = scene;
        this.pushableObjects = [];
        
        if (loopManager) {
            this.register(loopManager);
        }
    }
    
    update(deltaTime, elapsedTime, systems) {
        // Moved from UpdateManager.updatePhysics()
        this.updatePushableObjects(deltaTime);
        // ...
    }
}
```

### Step 3: Refactor AudioSystem
```javascript
// AudioSystem.js
export class AudioSystem extends SystemLoop {
    constructor(loopManager) {
        super('audio', 'audio', 40);
        // ...
        if (loopManager) {
            this.register(loopManager);
        }
    }
    
    update(deltaTime, elapsedTime, systems) {
        // Moved from UpdateManager.updateAudio()
        this.updateAnalysis(systems.clock);
        this.updateFootsteps(deltaTime, systems);
        // ...
    }
}
```

### Step 4: Create Complex Loop Objects
```javascript
// src/systems/AudioReactiveLoop.js
export class AudioReactiveLoop extends SystemLoop {
    constructor(loopManager) {
        super('audioReactive', 'audioReactive', 70);
        // ...
        if (loopManager) {
            this.register(loopManager);
        }
    }
    
    update(deltaTime, elapsedTime, systems) {
        // All 300 lines from UpdateManager.updateAudioReactive()
        this.updateBloom(systems);
        this.updateLEDs(systems);
        // ...
    }
}
```

### Step 5: Simplify UpdateManager
```javascript
// UpdateManager.js (simplified)
export class UpdateManager {
    constructor(options = {}) {
        this.useLoopManager = options.useLoopManager !== false;
        this.loopManager = null;
    }
    
    initializeLoopManager(systems) {
        if (!this.useLoopManager) return;
        
        this.loopManager = new LoopManager(
            systems.eventBus,
            systems.stateManager
        );
        
        // Create buckets
        this.loopManager.addBucket('input', { frequency: 1.0, priority: 10 });
        this.loopManager.addBucket('physics', { frequency: 1.0, priority: 20 });
        // ... other buckets
        
        // Systems will self-register during initialization
        // No need to manually add callbacks here
    }
    
    update(deltaTime, elapsedTime, timeInfo, systems) {
        if (this.useLoopManager && this.loopManager) {
            const systemsWithClock = { ...systems, clock: timeInfo.clock };
            this.loopManager.run(deltaTime, elapsedTime, systemsWithClock);
            return;
        }
        
        // Fallback to old system (for migration)
        // ...
    }
}
```

## Benefits

1. **Massive Code Reduction**: ~1,200 lines removed from UpdateManager
2. **Better Organization**: Each system owns its update logic
3. **Reduced Coupling**: UpdateManager doesn't need to know about every system
4. **Easier Testing**: Each loop object can be tested independently
5. **Easier Extension**: Add new systems without modifying UpdateManager
6. **Better Performance**: Systems can run at different frequencies
7. **Better Control**: Pause/resume individual systems via EventBus

## Migration Path

1. **Phase 1** (Week 1): Create SystemLoop base class and refactor 3-5 simple systems
2. **Phase 2** (Week 2): Create complex loop objects (AudioReactiveLoop, EnvironmentLoop)
3. **Phase 3** (Week 3): Remove old update methods from UpdateManager
4. **Phase 4** (Week 4): Clean up and optimize

## Estimated Total Reduction

- **UpdateManager.js**: 1,400 → 200 lines (-1,200 lines, 85% reduction)
- **SystemsUpdater.js**: 360 → 160 lines (-200 lines, 55% reduction)
- **New loop files**: +500 lines (better organized)
- **Net Reduction**: ~900 lines of code removed

## Example: Before vs After

### Before (UpdateManager.js - 1,400 lines)
```javascript
update(deltaTime, elapsedTime, timeInfo, systems) {
    this.updateAvatar(...);
    this.updatePhysics(...);
    this.updateAudio(...);
    // ... 20+ methods
}

updateAvatar(inputManager, avatar, deltaTime, systems) {
    if (!inputManager || !avatar) return;
    // 200 lines
}

updatePhysics(avatar, deltaTime, systems) {
    if (!avatar || !systems.physicsSystem) return;
    // 100 lines
}
// ... 18 more methods
```

### After (UpdateManager.js - 200 lines)
```javascript
update(deltaTime, elapsedTime, timeInfo, systems) {
    if (this.loopManager) {
        this.loopManager.run(deltaTime, elapsedTime, systems);
    }
}
```

### After (PhysicsSystem.js - self-registering)
```javascript
export class PhysicsSystem extends SystemLoop {
    constructor(scene, loopManager) {
        super('physics', 'physics', 20);
        if (loopManager) this.register(loopManager);
    }
    
    update(deltaTime, elapsedTime, systems) {
        // Update logic here
    }
}
```

## Conclusion

LoopManager can dramatically reduce code complexity by:
1. Eliminating the need for UpdateManager to know about every system
2. Allowing systems to self-register
3. Moving update logic closer to the systems that need it
4. Enabling better organization and testability

**Total estimated reduction: ~900 lines of code**

