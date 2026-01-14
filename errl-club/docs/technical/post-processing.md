# Post-Processing Manager Technical Documentation

## Overview

The Post-Processing Manager (`src/effects/PostProcessingManager.js`) handles all post-processing effects in the Errl Club Simulator, including bloom, chromatic aberration, and afterimage effects. It includes robust error handling to prevent rendering failures.

## Architecture

### Initialization

Post-processing starts **disabled by default** to prevent errors during initialization. It attempts to enable on the first successful render.

```javascript
constructor(renderer, scene, camera) {
    // ...
    this.postProcessingEnabled = false; // Start disabled
    this.firstRenderAttempted = false;
    this.textureErrorDetected = false;
    // ...
}
```

### "Try Once" Mechanism

On the first render, the system attempts to enable post-processing:

1. If successful, post-processing remains enabled
2. If it fails (e.g., texture unit limit), post-processing is permanently disabled
3. User is notified via `NotificationSystem`

## Error Handling

### Error Detection

The system detects errors through multiple methods:

1. **Exception Catching**: Catches errors thrown during render
2. **Error Message Analysis**: Checks `error.message` and `error.stack` for keywords:
   - `texture`
   - `texture_image_units`
   - `max_texture_image_units`
   - `webgl`
   - `invalid_operation`
   - `invalid_value`
   - `shader`
3. **WebGL Error Checking**: Uses `gl.getError()` to catch errors that don't throw exceptions

### Error Response

When an error is detected:

1. **Disable Post-Processing**: Sets `this.postProcessingEnabled = false` permanently
2. **Set Error Flag**: Sets `this.textureErrorDetected = true` to prevent re-enabling
3. **User Notification**: Shows a user-friendly notification:
   ```javascript
   window.gameSystems.notificationSystem.show(
       'Post-processing disabled due to graphics limitations. Game will continue without visual effects.',
       'warning',
       8000
   );
   ```
4. **Fallback Rendering**: Falls back to direct renderer rendering (no post-processing)

## Post-Processing Effects

### Bloom

Adds a glowing effect to bright areas of the scene.

- **Intensity**: Controlled via `updateBloomIntensity(value)`
- **Audio Reactive**: Intensity can be driven by audio analysis

### Chromatic Aberration

Adds a color separation effect (red/cyan shift).

- **X/Y Offset**: Controlled via `setChromaticAberration(x, y)`
- **Audio Reactive**: Can be driven by audio analysis

### Afterimage

Creates a ghost trail effect for high-vibe moments.

- **Amount**: Controlled via `setAfterimage(amount)` (0-1)
- **Triggered**: When vibe meter exceeds 0.8

## Fallback Behavior

When post-processing is disabled:

1. **Direct Rendering**: Uses `renderer.render(scene, camera)` directly
2. **No Effects**: Bloom, chromatic aberration, and afterimage are disabled
3. **Stable Performance**: Game continues to run without visual effects
4. **User Informed**: Notification explains why effects are disabled

## WebGL Context Loss

The system handles WebGL context loss gracefully:

```javascript
if (renderer.getContext().isContextLost()) {
    console.error('PostProcessingManager: WebGL context lost, disabling post-processing');
    this.postProcessingEnabled = false;
    renderer.render(scene, camera);
    return;
}
```

## Configuration

### Enabling/Disabling

```javascript
// Enable post-processing (if not disabled due to errors)
postProcessingManager.enable();

// Disable post-processing
postProcessingManager.disable();

// Check if enabled
const isEnabled = postProcessingManager.isEnabled();
```

### Error Recovery

Currently, post-processing **cannot be re-enabled** after an error is detected. This is intentional to prevent:
- Repeated error attempts
- Performance degradation
- User frustration

Future improvements could include:
- Retry mechanism with exponential backoff
- User option to retry enabling
- Automatic retry on context restoration

## Troubleshooting

### Post-Processing Not Working

**Symptoms**: No bloom, chromatic aberration, or afterimage effects

**Possible Causes**:
1. **Texture Unit Limit**: GPU exceeded 16 texture units
2. **WebGL Context Lost**: Browser lost WebGL context
3. **Shader Compilation Error**: Post-processing shaders failed to compile
4. **Initialization Error**: Post-processing failed on first render attempt

**Solutions**:
1. Check browser console for error messages
2. Look for notification: "Post-processing disabled due to graphics limitations"
3. Verify GPU supports required WebGL features
4. Try refreshing the page (may restore WebGL context)

### Performance Issues

**Symptoms**: Low frame rate, stuttering

**Possible Causes**:
1. Post-processing effects are computationally expensive
2. Multiple passes being rendered

**Solutions**:
1. Post-processing automatically disables on errors (performance improves)
2. Can manually disable via `postProcessingManager.disable()`
3. Reduce effect intensity if needed

## Code Structure

### Key Methods

- `render(scene, camera, renderer)`: Main render method with error handling
- `enable()`: Enable post-processing (if not disabled due to errors)
- `disable()`: Disable post-processing
- `isEnabled()`: Check if post-processing is enabled
- `updateBloomIntensity(value)`: Update bloom effect intensity
- `setChromaticAberration(x, y)`: Set chromatic aberration offset
- `setAfterimage(amount)`: Set afterimage effect amount
- `getWebGLErrorName(gl, errorCode)`: Translate WebGL error codes to names

### Error Detection Flow

```
render() called
  ↓
Check if post-processing enabled
  ↓
Check if texture error detected (skip if true)
  ↓
Try to render with composer
  ↓
Catch errors
  ↓
Check error message/stack for texture/WebGL keywords
  ↓
If texture error: disable permanently, show notification
  ↓
Fallback to direct renderer.render()
```

## Related Systems

- **MaterialSimplifier**: Reduces texture unit usage to prevent errors
- **NotificationSystem**: Shows user-friendly error messages
- **GameLoop**: Calls `postProcessingManager.render()` each frame
- **VisualEffects**: May drive post-processing intensity based on audio

## Best Practices

1. **Always Check `isEnabled()`**: Before relying on post-processing effects
2. **Handle Graceful Degradation**: Design visuals to work without post-processing
3. **Monitor Errors**: Log post-processing errors for debugging
4. **User Communication**: Always notify users when effects are disabled
5. **Test on Low-End Devices**: Verify fallback behavior works correctly

## References

- [Three.js EffectComposer](https://threejs.org/docs/#examples/en/postprocessing/EffectComposer)
- [WebGL Error Codes](https://www.khronos.org/registry/webgl/specs/1.0/#5.14.3)
- Related code: `src/effects/PostProcessingManager.js`
- Related systems: `src/utils/MaterialSimplifier.js`, `src/ui/NotificationSystem.js`

## Changelog

- **2025-12-08**: Created comprehensive documentation
- **2025-12-07**: Added "try once" mechanism
- **2025-12-07**: Added user notification on disable
- **2025-12-07**: Added WebGL error checking
- **2025-12-07**: Initial implementation

