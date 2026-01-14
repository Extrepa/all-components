# Codex Features Guide

**Last Updated**: December 10, 2025  
**Status**: All Core Features Implemented ✅

## Overview

The Codex asset integration system brings 4 premium 3D assets into the Errl Club experience, each with unique audio-reactive features, visual enhancements, and interactive capabilities. All assets are automatically loaded, scaled, and enhanced with neon materials and performance optimizations.

## Integrated Assets

### 1. The Shroom Bar Nightclub
- **Source**: Repository asset (`/models/nightclub/the_shroom_bar__nightclub.glb`)
- **Position**: Stage replacement (0, 0, -STAGE_SIZE/2)
- **Scale**: Auto-scaled to 5m height
- **Material**: Cyan neon preset with emissive glow
- **Features**:
  - Interactive floor panels (sparkles on footfalls)
  - Proximity-based visibility (15m threshold)
  - LOD system integration
  - Bounding sphere precomputed for frustum culling

### 2. Futuristic Geodesic Space Station
- **Source**: Repository asset (`/models/rooms/futuristic_geodesic_space_station.glb`)
- **Position**: Floating mezzanine above stage (0, 6, -STAGE_SIZE/2)
- **Scale**: Auto-scaled to 4m height
- **Material**: Magenta holographic preset with additive blending
- **Features**:
  - Audio-reactive to mid frequencies
  - Emissive intensity pulses with music
  - Proximity-based visibility (20m threshold)
  - LOD system integration
  - Holographic visual effect

### 3. Khronos BoomBox
- **Source**: External asset (`/models/external/khronos_boombox.glb`)
- **License**: CC BY 4.0 - Khronos Group
- **Position**: Stage prop (-2, 0.75, -STAGE_SIZE/2 - 1)
- **Scale**: Auto-scaled to 1.5m height
- **Material**: Green neon preset
- **Features**:
  - Audio-reactive to bass frequencies
  - Emissive intensity responds to bass hits
  - Spawns spark trails on heavy bass (>0.7)
  - Proximity-based visibility (8m threshold)
  - LOD system integration

### 4. Khronos DamagedHelmet
- **Source**: External asset (`/models/external/khronos_damaged_helmet.glb`)
- **License**: CC BY 4.0 - Khronos Group
- **Position**: Portal centerpiece (0, 1, 5)
- **Scale**: Auto-scaled to 2m height
- **Material**: Magenta holographic preset with additive blending
- **Features**:
  - Audio-reactive to treble frequencies
  - Emissive intensity responds to treble
  - Interactive (hover/click to inspect)
  - Proximity-based visibility (10m threshold)
  - LOD system integration
  - Holographic centerpiece effect

## Audio-Reactive Features

### Portal Rifts
- **Synchronization**: Beat detection
- **Behavior**: Pulse on detected beats
- **Visual**: Portal rifts throughout the scene respond to music rhythm
- **Implementation**: `src/interactions/PortalRift.js`

### Chromatic Fog
- **Frequency Mapping**:
  - **Bass** → Red
  - **Mid** → Green
  - **Treble** → Blue
- **Behavior**: Fog color dynamically changes based on frequency bands
- **Visual**: Atmospheric color shifts synchronized with music

### Spark Trails
- **Trigger**: Bass hits > 0.7 intensity
- **Source**: Assets (primarily BoomBox)
- **Behavior**: Particles spawn from asset edges on heavy bass
- **Visual**: Magenta sparkles trailing from assets
- **Implementation**: `CodexAssetIntegration.spawnSparkTrails()`

### Laser Ribbons
- **Trigger**: Heavy bass drops
- **Behavior**: Ribbon-like particle effects
- **Visual**: Dynamic laser effects synchronized with music

### Asset-Specific Audio Reactions
- **BoomBox**: Responds to bass frequencies (emissive intensity: 0.3-1.5)
- **Geodesic Station**: Responds to mid frequencies (emissive intensity: 0.2-1.0)
- **DamagedHelmet**: Responds to treble frequencies (emissive intensity: 0.4-1.2)

## Visual Effects

### Interactive Floor Panels
- **Trigger**: Player footfalls on stage
- **Effect**: Sparkles spawn at footfall positions
- **Visual**: Magenta sparkle particles
- **Implementation**: Integrated with avatar movement system

### Holographic Rings
- **Location**: DJ booth area
- **Count**: 3 rings
- **Material**: Additive blending for holographic effect
- **Visual**: Glowing rings with neon tint

### Camera Vignettes
- **Trigger**: Proximity to assets
- **Effect**: Bloom boost when camera is near assets
- **Visual**: Enhanced glow and bloom effects
- **Implementation**: Proximity-based post-processing adjustments

### Rest Mode
- **Keybind**: `Ctrl+R`
- **Effect**: 
  - Reduces particle emissions
  - Mellow visual experience
  - Assets remain visible but less intense
- **Toggle**: Press `Ctrl+R` again to disable

## Performance Optimizations

### Proximity-Based Visibility
- **Implementation**: Assets automatically hide when player is far away
- **Thresholds**:
  - Shroom Bar: 15m
  - Geodesic Station: 20m
  - BoomBox: 8m
  - DamagedHelmet: 10m
- **Benefit**: Reduces rendering load when assets are not visible

### Bounding Sphere Precomputation
- **Implementation**: All assets have precomputed bounding spheres
- **Usage**: Frustum culling optimization
- **Benefit**: Faster visibility checks

### LOD (Level of Detail) System
- **Implementation**: All assets registered with `LODSystem`
- **Behavior**: 
  - High detail: Always visible when close
  - Medium detail: Switches at 15m (configurable)
  - Low detail: Switches at 30m (configurable)
- **Benefit**: Reduced polygon count for distant assets
- **Control**: Managed via `GraphicsSettings` and `DevMenu`

## Interaction System

### DamagedHelmet Interaction
- **Type**: Inspect
- **Trigger**: Hover or click on helmet
- **Feedback**: Console log + notification
- **Visual**: Interaction prompt appears on hover
- **Implementation**: `CodexAssetIntegration.wireInteractions()`

### Portal Rift Interactions
- **Type**: Portal activation
- **Trigger**: Click on portal rifts
- **Behavior**: Portal effects and transitions
- **Implementation**: `src/interactions/PortalRift.js`

## Keybinds

| Keybind | Action | Description |
|---------|--------|-------------|
| `Ctrl+R` | Toggle Rest Mode | Reduces particle emissions and visual intensity |
| `Ctrl+Shift+A` | Asset Attribution | Opens asset attribution panel |
| `Ctrl+G` | Collection Goals | Opens collection goals UI |
| `Ctrl+L` | Replay Library | Opens replay library UI |
| `Ctrl+D` | Dev Menu | Opens development menu (includes Performance Optimizer) |

## System Integration

### Audio System
- **Frequency Band Extractor**: Provides bass, mid, treble data
- **Beat Detector**: Detects beats for portal rifts
- **Integration**: `CodexAssetIntegration.wireAudioReactive()`

### Particle System
- **Spark Trails**: Spawned from assets on bass hits
- **Rest Mode**: Reduces particle emissions when enabled
- **Integration**: `CodexAssetIntegration.updateAudioReactive()`

### Interaction System
- **Interactive Elements**: DamagedHelmet registered as interactive
- **Hover/Click**: Standard interaction system integration
- **Integration**: `CodexAssetIntegration.wireInteractions()`

### LOD System
- **Registration**: All assets automatically registered
- **Distance-Based**: Automatic LOD switching based on camera distance
- **Integration**: `LODSystem.registerAsset()`

### Performance Optimizer
- **Monitoring**: FPS tracking for all assets
- **Auto-Adjustment**: Quality settings adjust based on performance
- **Control**: Available in DevMenu (`Ctrl+D`)

## Material Enhancement

### Material Presets
All assets use material presets from `MaterialPresets.js`:
- **Cyan**: Shroom Bar (emissive intensity: 0.4)
- **Magenta**: Geodesic Station, DamagedHelmet (emissive intensity: 0.5-0.7)
- **Green**: BoomBox (emissive intensity: 0.6)

### Enhancement Features
- **MeshStandardMaterial**: Converted from MeshBasicMaterial
- **Emissive Properties**: Neon glow effects
- **Additive Blending**: Holographic effects (Geodesic Station, DamagedHelmet)
- **Shadow Support**: Cast and receive shadows enabled

## Asset Attribution

### Viewing Attribution
- **Keybind**: `Ctrl+Shift+A`
- **Panel**: Asset Attribution Panel
- **Information**:
  - Asset name
  - Source/URL
  - License information
  - Metadata

### Tagged Assets
All assets are tagged with:
- `assetSource`: Source name/URL
- `license`: License information
- Stored in `userData` for traceability

## Troubleshooting

### Assets Not Visible
1. Check console for loading errors
2. Verify asset files exist in `/public/models/`
3. Check proximity thresholds (move closer to assets)
4. Verify LOD system is not hiding assets

### Audio-Reactive Not Working
1. Verify audio system is initialized
2. Check frequency band extractor is running
3. Verify `wireAudioReactive()` was called
4. Check audio file is playing

### Performance Issues
1. Enable Performance Optimizer in DevMenu (`Ctrl+D`)
2. Check LOD system is enabled
3. Verify proximity visibility is working
4. Reduce graphics quality preset

### Rest Mode Not Working
1. Verify keybind `Ctrl+R` is not conflicting
2. Check console for errors
3. Verify particle system integration

## Future Enhancements

See `docs/dev-notes/codex-future-enhancements.md` for planned features:
- UI captions for props
- Dynamic camera movement
- Holographic mesh loops
- UV/blacklight mode
- NPC avatars
- Procedural portal rings

## Technical Details

### File Structure
- **Main Integration**: `src/scene/CodexAssetIntegration.js`
- **Material Presets**: `src/config/MaterialPresets.js`
- **Portal Rifts**: `src/interactions/PortalRift.js`
- **LOD System**: `src/systems/LODSystem.js`
- **Performance Optimizer**: `src/systems/PerformanceOptimizer.js`

### Initialization
All Codex assets are loaded automatically in `src/main.js`:
```javascript
codexAssetIntegration.loadAllAssets();
```

### Update Loop
Audio-reactive updates occur in the main animation loop:
```javascript
codexAssetIntegration.updateAudioReactive(frequencyData, particleSystem);
```

## Testing

### Manual Testing Checklist
See `docs/testing/2025-12-10-audio-reactive-verification.md` for comprehensive testing procedures.

### Quick Test
1. Load the game
2. Verify all 4 assets are visible
3. Play audio file
4. Observe audio-reactive effects
5. Test interactions (hover over DamagedHelmet)
6. Toggle rest mode (`Ctrl+R`)
7. Check asset attribution (`Ctrl+Shift+A`)

## Support

For issues or questions:
1. Check console for errors
2. Review this guide
3. See `docs/dev-notes/codex-implementation-summary.md` for technical details
4. Check `docs/testing/codex-integration-tests.md` for test procedures

