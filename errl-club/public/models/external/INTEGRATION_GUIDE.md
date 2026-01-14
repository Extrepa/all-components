# Integration Guide for External Assets

This guide provides code examples for integrating the downloaded external assets into the Errl Club Simulator.

## Quick Start

All assets can be loaded using the existing `AssetLoader` system. The assets are located in `public/models/external/` and are served as static files.

## Example: Loading BoomBox

```javascript
import { AssetLoader } from '../../src/assets/AssetLoader.js';

// Initialize loader (or use existing instance)
const assetLoader = new AssetLoader();

// Load the BoomBox model
const boombox = await assetLoader.loadModel('/models/external/khronos_boombox.glb');

// Position and scale
boombox.position.set(0, 1, -5); // Stage position
boombox.scale.set(0.5, 0.5, 0.5); // Adjust scale as needed

// Add to scene
scene.add(boombox);

// Make it audio-reactive (optional)
// Access materials and update emissive based on audio analysis
boombox.traverse((child) => {
    if (child.isMesh && child.material) {
        // Enable emissive for audio-reactive lighting
        if (child.material.emissive) {
            child.material.emissive.setHex(0x00ffff);
            child.material.emissiveIntensity = 0.5;
        }
    }
});
```

## Example: Loading DamagedHelmet as Holographic Centerpiece

```javascript
const helmet = await assetLoader.loadModel('/models/external/khronos_damaged_helmet.glb');

// Position as portal centerpiece
helmet.position.set(0, 2, 0);
helmet.scale.set(2, 2, 2);

// Apply neon/holographic effect
helmet.traverse((child) => {
    if (child.isMesh && child.material) {
        // Make transparent with additive blending for holographic effect
        child.material.transparent = true;
        child.material.opacity = 0.8;
        child.material.blending = THREE.AdditiveBlending;
        
        // Set neon color
        if (child.material.emissive) {
            child.material.emissive.setHex(0xff00ff); // Magenta
            child.material.emissiveIntensity = 1.5;
        }
    }
});

scene.add(helmet);
```

## Example: Using Avocado for Material Testing

```javascript
const avocado = await assetLoader.loadModel('/models/external/khronos_avocado.glb');

// Position for testing
avocado.position.set(5, 1, 0);
avocado.scale.set(1, 1, 1);

// Test emissive gradients
avocado.traverse((child) => {
    if (child.isMesh && child.material) {
        // Enable emissive
        if (child.material.emissive) {
            child.material.emissive.setHSL(0.3, 1, 0.5); // Cyan
            child.material.emissiveIntensity = 1.0;
        }
    }
});

scene.add(avocado);
```

## Integration with Existing Systems

### Audio-Reactive Lighting

To make assets respond to audio:

```javascript
// In your audio update loop
function updateAudioReactiveAssets(boombox, bassLevel) {
    boombox.traverse((child) => {
        if (child.isMesh && child.material && child.material.emissive) {
            // Pulse emissive intensity based on bass
            const intensity = 0.5 + (bassLevel * 1.5);
            child.material.emissiveIntensity = Math.min(intensity, 2.0);
        }
    });
}
```

### Interaction System

To make assets interactive:

```javascript
// Mark for interaction
boombox.userData.isInteractive = true;
boombox.userData.interactionType = 'boombox';

// In interaction handler
if (target.userData.isInteractive && target.userData.interactionType === 'boombox') {
    // Trigger particle burst
    particleSystem.createSparkleParticle(target.position);
    // Play sound effect
    audioManager.playSound('boombox_click');
}
```

### Beat-Synced Effects

```javascript
// In beat detector callback
beatDetector.onBeat(() => {
    // Pulse all audio-reactive assets
    scene.traverse((child) => {
        if (child.userData.isAudioReactive && child.material) {
            // Flash effect
            const originalIntensity = child.material.emissiveIntensity || 0.5;
            child.material.emissiveIntensity = 2.0;
            setTimeout(() => {
                child.material.emissiveIntensity = originalIntensity;
            }, 100);
        }
    });
});
```

## Performance Considerations

1. **File Sizes**: 
   - BoomBox: ~10MB (largest)
   - DamagedHelmet: ~3.6MB
   - Avocado: ~7.9MB
   - Consider loading on-demand rather than at startup

2. **Lazy Loading**:
   ```javascript
   // Load only when needed
   let boomboxLoaded = false;
   async function loadBoomboxIfNeeded() {
       if (!boomboxLoaded) {
           const boombox = await assetLoader.loadModel('/models/external/khronos_boombox.glb');
           scene.add(boombox);
           boomboxLoaded = true;
       }
   }
   ```

3. **Instance Reuse**: The AssetLoader caches loaded models, so multiple calls to the same URL return the cached version.

## License Compliance

Remember to include attribution for CC BY 4.0 assets:

- Add to game credits screen
- Include in README
- Document in code comments

Example attribution:
```javascript
/**
 * BoomBox model by Khronos Group
 * Licensed under CC BY 4.0
 * Source: https://github.com/KhronosGroup/glTF-Sample-Models
 */
```

## Troubleshooting

### Model doesn't load
- Check file path: `/models/external/` (note: starts with `/`)
- Verify file exists in `public/models/external/`
- Check browser console for 404 errors

### Model appears too large/small
- Adjust `model.scale.set(x, y, z)`
- Khronos models are typically in meters, so scale of 1.0 = 1 meter

### Materials look wrong
- Some materials may need emissive enabled manually
- Check if material supports `emissive` property (MeshStandardMaterial does, MeshBasicMaterial does not)

### Performance issues
- Consider loading assets on-demand
- Use simpler materials if needed
- Reduce scale if model is too complex

