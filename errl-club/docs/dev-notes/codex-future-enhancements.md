# Codex Future Enhancements Roadmap

This document tracks future enhancements suggested by Codex that are not yet implemented but are planned for future development.

## High Priority Enhancements

### 1. Portal Rift Beat Synchronization
- **Status**: Planned
- **Description**: Hook portal rifts to beatDetector so every detected beat pulses the rift's inner glow
- **Implementation**: 
  - Modify `PortalRift` class to accept beatDetector reference
  - Update emissive colors on beat detection
  - Add pulsing animation tied to beat intensity
- **Files**: `src/interactions/PortalRift.js`, `src/main.js`

### 2. Chromatic Fog & Laser Ribbons
- **Status**: Planned
- **Description**: Expand `updateAudioReactiveFog()` to animate fog color per frequency band and spawn LaserBeams on heavy bass drops
- **Implementation**:
  - Modify fog color based on frequency bands (bass = red, mid = green, treble = blue)
  - Spawn `VisualEffects.createSweepingLasers()` on bass peaks
  - Sync laser intensity to bass amplitude
- **Files**: `src/scene/EnvironmentEffects.js`, `src/effects/VisualEffects.js`, `src/main.js`

### 3. Dynamic Camera Movement
- **Status**: Planned
- **Description**: Have `cameraController` switch between presets using `teleportSystem` anchors, giving players cinematic fly-bys when they reach hot zones
- **Implementation**:
  - Add trigger zones around key assets
  - Switch camera presets when avatar enters zone
  - Create smooth transitions between presets
- **Files**: `src/camera/CameraController.js`, `src/systems/TeleportSystem.js`

## Medium Priority Enhancements

### 4. Holographic Mesh Loops
- **Status**: Planned
- **Description**: Duplicate imported GLBs as mirrored duplicates with additive blending to create infinite tunnels
- **Implementation**:
  - Clone asset groups
  - Apply additive blending
  - Position in sequence for tunnel effect
  - Animate position for scrolling effect
- **Files**: `src/scene/CodexAssetIntegration.js`

### 5. Interactive Floor Panels
- **Status**: Planned
- **Description**: Use `ParticleSystem.createSparkleParticle` with randomized positions around stage tiles to simulate light panels that react to footfalls
- **Implementation**:
  - Detect avatar position on stage
  - Spawn sparkle particles at footfall positions
  - Add particle burst on dash/jump
- **Files**: `src/particles.js`, `src/core/UpdateManager.js`

### 6. Camera-Triggered Vignettes
- **Status**: Planned
- **Description**: When avatar approaches new mesh, briefly boost bloom/chromatic aberration to highlight the moment
- **Implementation**:
  - Detect proximity to key assets
  - Temporarily increase bloom strength
  - Add chromatic aberration effect
  - Fade back to normal after moment
- **Files**: `src/camera/CameraController.js`, `src/main.js` (post-processing)

### 7. UI Captions for Props
- **Status**: Planned
- **Description**: Add UI captions on top of new props by projecting Vector3 positions to screen space and syncing floating labels
- **Implementation**:
  - Create UI overlay system for 3D-to-screen projection
  - Add floating label component
  - Sync labels to asset positions
  - Show/hide based on distance/visibility
- **Files**: `src/ui/PropLabelUI.js` (new), `src/main.js`

### 8. Spark Trails from Assets
- **Status**: Planned
- **Description**: Spawn spark trails from new assets when bass hits by spawning `particleSystem.createSparkleParticle` around geometry edges
- **Implementation**:
  - Detect bass peaks
  - Get asset bounding box edges
  - Spawn particles along edges
  - Sync particle intensity to bass amplitude
- **Files**: `src/particles.js`, `src/scene/CodexAssetIntegration.js`

### 9. Rest Mode Toggle
- **Status**: Planned
- **Description**: Offer a rest mode (Ctrl+R toggle) that fades new mesh to mellow colors and slows particle emissions
- **Implementation**:
  - Add keyboard shortcut handler
  - Fade asset emissive colors to mellow palette
  - Reduce particle emission rate
  - Slow down animations
- **Files**: `src/main.js`, `src/scene/CodexAssetIntegration.js`

## Low Priority / Experimental Enhancements

### 10. UV/Blacklight Mode
- **Status**: Experimental
- **Description**: Toggle "UV/blacklight mode" (Shift+U) by linking to `visualEffects.setUVMode` and adjusting LED emissive intensities
- **Implementation**:
  - Create UV mode state
  - Adjust all emissive colors to UV spectrum
  - Increase emissive intensities
  - Add visual filter overlay
- **Files**: `src/effects/VisualEffects.js`, `src/main.js`

### 11. Holographic Rings Around DJ Booth
- **Status**: Experimental
- **Description**: Layer additional holographic rings (using `RingGeometry` with additive materials) around DJ booth and animate with `deltaTime` for orbiting effects
- **Implementation**:
  - Create ring geometry
  - Apply additive blending material
  - Animate rotation with deltaTime
  - Sync to audio if desired
- **Files**: `src/scene/CodexAssetIntegration.js`, `src/main.js`

### 12. NPC Avatars
- **Status**: Experimental
- **Description**: Introduce collaborative NPC avatars (reuse `RemotePlayer` mesh logic) that dance, trigger visual cues, and highlight new assets
- **Implementation**:
  - Create NPC class extending RemotePlayer
  - Add dance animation system
  - Add interaction triggers
  - Sync to audio/beats
- **Files**: `src/network/RemotePlayer.js`, `src/systems/NPCSystem.js` (new)

### 13. Procedural Portal Rings
- **Status**: Experimental
- **Description**: Use `THREE.TorusGeometry`/`CylinderGeometry` to dynamically build portal rings or DJ rigs if downloading new assets isn't feasible
- **Implementation**:
  - Create procedural geometry generators
  - Apply emissive materials
  - Add to scene dynamically
  - Sync to audio/beats
- **Files**: `src/scene/ProceduralGeometry.js` (new)

## Performance Optimizations

### 14. LOD System
- **Status**: Planned
- **Description**: Keep simplified proxy meshes (box or sphere) behind imported GLBs for quick hide/unload on lower-end devices
- **Implementation**:
  - Create LOD groups for each asset
  - Add distance-based switching
  - Create simplified proxy meshes
  - Add performance toggle
- **Files**: `src/scene/CodexAssetIntegration.js`

### 15. Proximity-Based Visibility
- **Status**: Planned
- **Description**: Toggle `model.visible` based on player proximity to save draw calls when asset is not needed
- **Implementation**:
  - Calculate distance to avatar
  - Toggle visibility based on threshold
  - Add fade in/out transition
- **Files**: `src/scene/CodexAssetIntegration.js`, `src/main.js`

### 16. Bounding Sphere Precomputation
- **Status**: Planned
- **Description**: Precompute `model.boundingSphere` and use frustum culling helpers so renderer can skip rendering complex assets that sit off-screen
- **Implementation**:
  - Compute bounding spheres on load
  - Add frustum culling checks
  - Integrate with Three.js frustum culling
- **Files**: `src/scene/CodexAssetIntegration.js`

## Manual Asset Integration

### 17. Sketchfab "Neon Arcade Room"
- **Status**: Pending Manual Download
- **Description**: Download and integrate neon arcade room asset
- **Source**: https://sketchfab.com/3d-models/neon-arcade-room-31d2e8f8b5724c7f8657e7d9b6b3c54b
- **Action**: Manual download required (Sketchfab account needed)

### 18. Poly Haven "Goat Farm" Interior
- **Status**: Pending Manual Download
- **Description**: Download and integrate goat farm interior for environment replacement
- **Source**: https://polyhaven.com/a/goat_farm
- **Action**: Manual download from Poly Haven website

### 19. Blend Swap "Volumetric Tunnel"
- **Status**: Pending Manual Download
- **Description**: Download .blend file, export to GLB, integrate for tunnel effects
- **Source**: https://www.blendswap.com/blend/20758
- **Action**: Download .blend, export via Blender to GLB

### 20. Sketchfab "Glowing Portal"
- **Status**: Pending Manual Download
- **Description**: Download and integrate glowing portal, tie to PortalRift class
- **Source**: https://sketchfab.com/3d-models/glowing-portal-3c9469323bd740a89609401202c74c2f
- **Action**: Manual download required (Sketchfab account needed)

### 21. Poly Haven "Nightclub Ceiling"
- **Status**: Pending Manual Download
- **Description**: Download HDRI and geometry for layered ceiling panel
- **Source**: https://polyhaven.com/a/nightclub
- **Action**: Manual download from Poly Haven website

### 22. NASA ISS Node
- **Status**: Pending Manual Download
- **Description**: Download space module, export to GLB via Blender, rescale for stage
- **Source**: https://nasa3d.arc.nasa.gov/models/node1
- **Action**: Download from NASA 3D Resources, convert to GLB

## Implementation Notes

- Prioritize enhancements that improve user experience and visual appeal
- Performance optimizations should be implemented before adding more complex features
- Manual asset downloads can be done in parallel with code development
- Experimental features should be gated behind dev flags for testing

## Related Documentation

- `docs/MODEL_INTEGRATION_GUIDE.md` - Asset integration guide
- `public/models/external/README.md` - External asset documentation
- `05-Logs/Daily/2025-12-09-mesh-alternatives.md` - Original Codex notes
- `docs/dev-notes/2025-12-09-codex-action-items.md` - Action items extraction

