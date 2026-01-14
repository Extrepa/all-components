# Asset Usage Documentation

**Last Updated**: December 10, 2025  
**Purpose**: Detailed documentation of how each asset is integrated and used in the Errl Club Simulator

---

## Overview

The Errl Club Simulator uses several 3D models from the Codex asset integration system. This document explains what each asset is, where it's positioned, and how it functions within the game environment.

---

## Asset Categories

### Environment Assets

These assets are integrated as part of the club environment and serve as structural or decorative elements of the scene.

### Prop Assets

These assets are placed as interactive or decorative props that enhance the club atmosphere but are not part of the core environment structure.

---

## Individual Asset Documentation

### 1. The Shroom Bar Nightclub

**File**: `/models/nightclub/the_shroom_bar__nightclub.glb`  
**Category**: Environment Asset  
**Type**: Stage/Structure Replacement

#### Purpose
The Shroom Bar Nightclub serves as the **main stage structure** for the club. It replaces the basic stage geometry and provides a more detailed and visually interesting performance area.

#### Position
- **Location**: Center-back of the room, on the stage area
- **Coordinates**: `(0, 0, -STAGE_SIZE / 2)`
- **Y Position**: `0` (ground level, replacing the stage floor)

#### Usage
- **Environment Integration**: Yes - acts as a stage replacement
- **Interactive**: No - purely decorative/environmental
- **Audio-Reactive**: No direct audio reactivity configured
- **Collision**: Part of the scene geometry (players can walk on/around it)

#### Technical Details
- **Scale**: Auto-scaled to fit stage area (max height: 5 meters, max scale: 2.0x)
- **Material Enhancement**: Cyan neon preset applied for nightclub aesthetic
- **Performance**: 
  - Proximity-based visibility (threshold: 15 units)
  - LOD (Level of Detail) system integration
  - Frustum culling enabled
- **License**: Check repo documentation

#### Visual Features
- Enhanced with emissive cyan materials for neon glow effect
- Receives and casts shadows
- Bounding sphere precomputed for performance optimization

---

### 2. Futuristic Geodesic Space Station

**File**: `/models/rooms/futuristic_geodesic_space_station.glb`  
**Category**: Environment Asset  
**Type**: Floating Mezzanine/Overhead Structure

#### Purpose
The Geodesic Space Station creates a **floating mezzanine level** above the stage area. It adds vertical dimension to the club and serves as a futuristic architectural element.

#### Position
- **Location**: Directly above the stage
- **Coordinates**: `(0, 6, -STAGE_SIZE / 2)`
- **Y Position**: `6` (floating 6 units above ground level)

#### Usage
- **Environment Integration**: Yes - creates overhead structure
- **Interactive**: No - players cannot reach it (too high)
- **Audio-Reactive**: Yes - responds to mid-frequency audio bands
- **Collision**: Not walkable (too high to reach)

#### Technical Details
- **Scale**: Auto-scaled for floating mezzanine (max height: 4 meters, max scale: 1.5x)
- **Material Enhancement**: Magenta holographic preset with additive blending
- **Audio Reactivity**:
  - Responds to **mid-frequency** audio bands
  - Emissive intensity ranges from 0.2 to 1.0 based on mid frequencies
  - Updates in real-time during gameplay
- **Performance**: 
  - Proximity-based visibility (threshold: 20 units)
  - LOD system integration
  - Frustum culling enabled
- **License**: Check repo documentation

#### Visual Features
- Holographic appearance with additive blending
- Magenta/pink neon glow
- Creates a futuristic "space station" aesthetic above the dance floor
- Glows brighter based on music mid frequencies

---

### 3. Khronos BoomBox

**File**: `/models/external/khronos_boombox.glb`  
**Category**: Prop Asset  
**Type**: Stage Prop

#### Purpose
The BoomBox is a **decorative stage prop** that adds character to the performance area. It serves as a visual focal point on the stage and reacts to the music.

#### Position
- **Location**: On the stage, left side
- **Coordinates**: `(-2, 0.75, -STAGE_SIZE / 2 - 1)`
- **Y Position**: `0.75` (slightly elevated on stage surface)

#### Usage
- **Environment Integration**: No - placed as a prop
- **Interactive**: No - decorative only
- **Audio-Reactive**: Yes - responds to bass frequencies with visual effects
- **Collision**: Has collision geometry (players can walk around it)

#### Technical Details
- **Scale**: Stage prop size (height: 1.5 meters, max scale: 1.0x)
- **Material Enhancement**: Green neon preset
- **Audio Reactivity**:
  - Responds to **bass frequencies**
  - Emissive intensity ranges from 0.3 to 1.5 based on bass
  - Generates spark trail particles when bass intensity > 0.7
  - Up to 10 particles spawn from the BoomBox edges on strong bass hits
- **Performance**: 
  - Proximity-based visibility (threshold: 8 units - smaller due to prop size)
  - LOD system integration
  - Frustum culling enabled
- **License**: CC BY 4.0 - Khronos Group

#### Visual Features
- Green neon glow that pulses with bass
- Spark particle effects on strong bass hits
- Classic boombox aesthetic fits the nightclub theme
- Particles spawn from edges and fade out

---

### 4. Khronos DamagedHelmet

**File**: `/models/external/khronos_damaged_helmet.glb`  
**Category**: Prop Asset  
**Type**: Interactive Centerpiece

#### Purpose
The DamagedHelmet serves as a **holographic centerpiece** in the center of the room. It's a focal point that players can interact with and serves as both decoration and an interactive element.

#### Position
- **Location**: Center of the room (away from stage)
- **Coordinates**: `(0, 1, 5)`
- **Y Position**: `1` (elevated centerpiece display height)

#### Usage
- **Environment Integration**: No - placed as a centerpiece prop
- **Interactive**: Yes - players can interact with it (E key when nearby)
- **Audio-Reactive**: Yes - responds to treble frequencies
- **Collision**: Has collision geometry

#### Technical Details
- **Scale**: Centerpiece size (height: 2 meters, max scale: 1.0x)
- **Material Enhancement**: Magenta holographic preset with enhanced intensity (0.7)
- **Audio Reactivity**:
  - Responds to **treble frequencies**
  - Emissive intensity ranges from 0.4 to 1.2 based on treble
  - Provides visual feedback to high-frequency elements of music
- **Interaction**:
  - Registered with the Interaction System
  - Players can interact by pressing E when nearby
  - Triggers notification: "Holographic inspection complete!"
  - Can trigger event system notifications
- **Performance**: 
  - Proximity-based visibility (threshold: 10 units)
  - LOD system integration
  - Frustum culling enabled
- **License**: CC BY 4.0 - Khronos Group

#### Visual Features
- Holographic appearance with magenta/pink glow
- Additive blending creates a "ghostly" transparent effect
- Stronger glow on treble frequencies
- Interactive highlight when player is nearby (reticle appears)

---

## Audio-Reactive Features Summary

### Frequency Band Mapping

Each audio-reactive asset responds to different frequency ranges:

| Asset | Frequency Band | Intensity Range | Special Effects |
|-------|---------------|-----------------|-----------------|
| BoomBox | **Bass** | 0.3 - 1.5 | Spark particle trails on strong hits (>0.7) |
| Geodesic Station | **Mid** | 0.2 - 1.0 | Holographic glow intensity |
| DamagedHelmet | **Treble** | 0.4 - 1.2 | Holographic glow intensity |
| Shroom Bar | None | N/A | Static decorative piece |

### How Audio Reactivity Works

1. **Frequency Extraction**: The audio system analyzes incoming audio and extracts three frequency bands (bass, mid, treble)

2. **Real-Time Updates**: Each frame, `updateAudioReactive()` is called with current frequency data

3. **Material Modulation**: Assets update their material `emissiveIntensity` based on their assigned frequency band

4. **Particle Effects**: The BoomBox additionally spawns spark particles when bass exceeds threshold

---

## Performance Optimizations

All assets include performance optimizations:

### Proximity-Based Visibility
- Assets are hidden when the player is far away
- Threshold distances vary by asset size:
  - Small props (BoomBox): 8 units
  - Medium items (Helmet): 10 units
  - Large structures (Shroom Bar): 15 units
  - Very large structures (Geodesic): 20 units

### Level of Detail (LOD) System
- All assets are registered with the LOD system
- Simplified proxy meshes created for distant viewing
- Reduces polygon count when assets are far from camera

### Frustum Culling
- Assets are hidden when outside the camera's view frustum
- Prevents rendering of off-screen geometry

### Precomputed Bounding Spheres
- Bounding spheres calculated once on load
- Used for distance calculations and culling
- Reduces per-frame computation

---

## Integration Points

### Code Integration

All assets are loaded via `CodexAssetIntegration.loadAllAssets()` which calls:

1. `loadShroomBar()` - Stage structure
2. `loadGeodesicStation()` - Floating mezzanine
3. `loadBoomBox()` - Stage prop
4. `loadDamagedHelmet()` - Interactive centerpiece

### System Integration

- **Audio System**: Assets wired via `wireAudioReactive(frequencyExtractor)`
- **Interaction System**: Helmet registered via `wireInteractions(interactionSystem)`
- **LOD System**: All assets registered for performance optimization
- **Particle System**: BoomBox uses particle system for spark effects

---

## Material Presets

Assets use predefined material presets:

- **Cyan Preset**: Shroom Bar (stage structure)
- **Magenta Preset**: Geodesic Station, DamagedHelmet (holographic effects)
- **Green Preset**: BoomBox (prop styling)

Presets include:
- Emissive colors for neon glow
- Intensity values
- Optional additive blending for holographic effects

---

## Rest Mode

All assets support a "rest mode" that:
- Fades to mellow colors (purple/blue tones)
- Reduces emissive intensity to 30% of original
- Can be toggled via `setRestMode(true/false)`
- Original presets are stored and restored when exiting rest mode

---

## Summary

| Asset | Type | Purpose | Interactive | Audio-Reactive | Position |
|-------|------|---------|-------------|----------------|----------|
| **Shroom Bar** | Environment | Stage replacement | No | No | Stage (ground level) |
| **Geodesic Station** | Environment | Floating mezzanine | No | Yes (Mid) | Above stage (y: 6) |
| **BoomBox** | Prop | Stage decoration | No | Yes (Bass + Particles) | Stage left side |
| **DamagedHelmet** | Prop | Interactive centerpiece | Yes | Yes (Treble) | Room center |

All assets are integrated into the scene during initialization and remain active throughout gameplay, with their audio-reactive properties updating in real-time based on the music being played.

