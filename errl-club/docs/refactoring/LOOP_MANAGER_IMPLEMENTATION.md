# LoopManager Implementation

**Date**: December 11, 2025  
**Status**: Implemented

## Overview

The LoopManager provides a centralized system for organizing game loop updates into "buckets" that can run at different frequencies. This replaces the flat list of update methods with a more organized, controllable system.

## Key Features

1. **Buckets over files**: Named buckets (audio, visualEffects, physics, UI, performance) organize related callbacks
2. **Variable frequency**: Buckets can run at different tempos using delta accumulators or frame-based intervals
3. **Single owner object**: Subsystems can register their own loop objects that own their state
4. **Integration hooks**: EventBus/StateManager integration for pause/resume/control from UI

## Architecture

### LoopManager Class

Located at: `src/core/LoopManager.js`

- Manages buckets of update callbacks
- Supports variable frequency updates (frame-based or time-based)
- Integrates with EventBus for external control
- Provides pause/resume functionality per bucket

### Integration with UpdateManager

The `UpdateManager` class now optionally uses `LoopManager`:

- Default buckets are created with appropriate priorities and frequencies
- Avatar movement runs first (highest priority)
- SystemsUpdater runs after avatar movement
- Performance and LOD buckets run at lower frequencies

## Usage

### Basic Setup

The LoopManager is automatically initialized by UpdateManager when systems are available:

```javascript
// In UpdateManager constructor
this.useLoopManager = options.useLoopManager !== false; // Default: true

// LoopManager is initialized on first update() call
// when systems.eventBus and systems.stateManager are available
```

### Adding Custom Buckets

```javascript
// Get LoopManager from UpdateManager
const loopManager = updateManager.loopManager;

// Add a new bucket
loopManager.addBucket('customEffects', {
    frequency: 0.5,  // Run every 2 frames (30fps)
    priority: 75,     // Run after visualEffects (60) but before UI (90)
    enabled: true,
});

// Add callback to bucket
loopManager.addCallback('customEffects', (deltaTime, elapsedTime, systems) => {
    // Your update logic here
    updateCustomEffects(deltaTime, systems);
}, { priority: 10 });
```

### Registering Loop Objects

Subsystems can register their own loop objects:

```javascript
// Create a loop object that owns its state
class VisualEffectsLoop {
    constructor() {
        this.intensity = 1.0;
        this.preset = 'default';
    }

    update(deltaTime, elapsedTime, systems) {
        // Update visual effects based on state
        this.updateEffects(deltaTime, systems);
    }

    setIntensity(value) {
        this.intensity = value;
    }

    setPreset(name) {
        this.preset = name;
    }
}

// Register with LoopManager
const visualEffectsLoop = new VisualEffectsLoop();
loopManager.addLoop('visualEffects', visualEffectsLoop, 'visualEffects');
```

### Controlling Buckets via EventBus

```javascript
// Pause a specific bucket
eventBus.emit('loop.pauseBucket', 'visualEffects');

// Resume a bucket
eventBus.emit('loop.resumeBucket', 'visualEffects');

// Pause all buckets
eventBus.emit('loop.pauseAll');

// Resume all buckets
eventBus.emit('loop.resumeAll');

// Disable LoopManager entirely
eventBus.emit('loop.disable');

// Enable LoopManager
eventBus.emit('loop.enable');
```

### Variable Frequency Examples

```javascript
// Run at 60fps (every frame)
loopManager.addBucket('ui', {
    frequency: 1.0,
    priority: 90,
});

// Run at 30fps (every 2 frames)
loopManager.addBucket('lod', {
    frequency: 0.5,
    priority: 110,
});

// Run at 10fps (every 6 frames)
loopManager.addBucket('performance', {
    frequency: 0.166,
    priority: 100,
});

// Run twice per frame (for time-based accumulation)
loopManager.addBucket('physics', {
    frequency: 2.0,  // Time-based: runs twice per frame
    priority: 20,
});
```

## Default Buckets

The UpdateManager initializes these buckets by default:

| Bucket Name | Frequency | Priority | Description |
|------------|-----------|----------|-------------|
| `input` | 1.0 (60fps) | 10 | Input handling and avatar movement |
| `physics` | 1.0 (60fps) | 20 | Physics and collision |
| `avatar` | 1.0 (60fps) | 30 | Avatar visuals and state |
| `audio` | 1.0 (60fps) | 40 | Audio updates |
| `particles` | 1.0 (60fps) | 50 | Particle system |
| `visualEffects` | 1.0 (60fps) | 60 | Visual effects |
| `audioReactive` | 1.0 (60fps) | 70 | Audio-reactive effects |
| `environment` | 1.0 (60fps) | 80 | Environment animations |
| `ui` | 1.0 (60fps) | 90 | UI updates |
| `performance` | 0.166 (~10fps) | 100 | Performance metrics |
| `lod` | 0.5 (30fps) | 110 | LOD/optimization |

## Migration Path

The LoopManager is integrated alongside the existing SystemsUpdater:

1. **Phase 1** (Current): LoopManager wraps SystemsUpdater calls
   - Avatar movement runs in `input` bucket
   - SystemsUpdater runs in `avatar` bucket
   - All existing functionality preserved

2. **Phase 2** (Future): Migrate individual systems to buckets
   - Move physics updates to `physics` bucket
   - Move audio updates to `audio` bucket
   - Move visual effects to `visualEffects` bucket
   - Gradually reduce SystemsUpdater usage

3. **Phase 3** (Future): Full bucket-based architecture
   - All systems run in appropriate buckets
   - SystemsUpdater becomes a compatibility layer
   - Subsystems register as loop objects

## Benefits

1. **Organization**: Related updates grouped together
2. **Performance**: Lower-frequency buckets reduce CPU usage
3. **Control**: Pause/resume individual systems via EventBus
4. **Flexibility**: Easy to add new buckets or adjust frequencies
5. **Maintainability**: Clear separation of concerns

## Testing

The LoopManager is automatically used when:
- `UpdateManager.useLoopManager` is `true` (default)
- Systems object has `eventBus` and/or `stateManager`

To disable LoopManager (fallback to SystemsUpdater):
```javascript
const updateManager = new UpdateManager({
    useLoopManager: false,
});
```

## References

- `src/core/LoopManager.js` - LoopManager implementation
- `src/core/UpdateManager.js` - UpdateManager integration
- `05-Logs/Daily/2025-12-11-loop-manager-notes.md` - Original design notes
- `docs/refactoring/REFACTORING_PLAN.md` - Overall refactoring plan

