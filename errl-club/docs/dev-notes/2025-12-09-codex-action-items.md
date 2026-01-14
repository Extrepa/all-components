# Codex Action Items Extraction

## Asset Acquisition (Priority: High)

### Already Downloaded ✅
- Khronos BoomBox (khronos_boombox.glb) - 10.4 MB
- Khronos DamagedHelmet (khronos_damaged_helmet.glb) - 3.6 MB  
- Khronos Avocado (khronos_avocado.glb) - 7.9 MB

### Available in Repo ✅
- `public/models/nightclub/the_shroom_bar__nightclub.glb` - Full club environment
- `public/models/rooms/futuristic_geodesic_space_station.glb` - Sci-fi mezzanine

### Manual Download Required
- Sketchfab "Neon Arcade Room" - https://sketchfab.com/3d-models/neon-arcade-room-31d2e8f8b5724c7f8657e7d9b6b3c54b
- Poly Haven "Goat Farm" Interior - https://polyhaven.com/a/goat_farm
- Blend Swap "Volumetric Tunnel" - https://www.blendswap.com/blend/20758 (export to GLB)
- Sketchfab "Glowing Portal" - https://sketchfab.com/3d-models/glowing-portal-3c9469323bd740a89609401202c74c2f
- Poly Haven "Nightclub Ceiling" - https://polyhaven.com/a/nightclub (HDRI + geometry)
- NASA ISS Node - https://nasa3d.arc.nasa.gov/models/node1 (export via Blender)

## Scene Integration Tasks

### 1. Load Existing Repo Assets
- [ ] Load `the_shroom_bar__nightclub.glb` as stage replacement
- [ ] Load `futuristic_geodesic_space_station.glb` as floating mezzanine
- [ ] Position and scale appropriately

### 2. Material Enhancements
- [ ] Traverse all loaded models to ensure MeshStandardMaterial (not MeshBasicMaterial)
- [ ] Enable emissive channels on all materials
- [ ] Apply neon color tints (cyan, magenta, yellow)
- [ ] Set additive blending for holographic parts: `material.transparent = true`, `material.blending = THREE.AdditiveBlending`
- [ ] Enable `receiveShadow` and `castShadow` flags

### 3. Asset Tagging
- [ ] Add `userData.assetSource` to all meshes for traceability
- [ ] Store original URLs/credits in userData

## Audio-Reactive Features

### Frequency Band Mapping
- [ ] Map bass → speaker cone pulses (BoomBox)
- [ ] Map mid → rail/neon strip intensity
- [ ] Map treble → sparkle particles
- [ ] Sync portal rifts to beatDetector (pulse inner glow on beat)
- [ ] Animate fog color per frequency band
- [ ] Spawn LaserBeams on heavy bass drops

### Beat Synchronization
- [ ] Hook portalRifts to beatDetector.onBeat()
- [ ] Pulse emissive colors on detected beats
- [ ] Sync VisualEffects.createSweepingLasers() to beatDetector
- [ ] Animate fog density with beat intensity

## Interaction System Integration

### Interactive Elements
- [ ] Register luminous screens with InteractionSystem
- [ ] Register portals with InteractionSystem
- [ ] Wire neon panels to trigger particle bursts
- [ ] Wire interactions to eventSystem.triggerStrobe()
- [ ] Add collectible spawn points around new assets
- [ ] Tie PortalRift to existing PortalRift class

### Particle Effects
- [ ] Spawn particleSystem.createSparkleParticle on footfalls (interactive floor panels)
- [ ] Create spiral particle trails on dash/dance (Shift+D, Shift+Space)
- [ ] Spawn spark trails from assets on bass hits
- [ ] Add particle bursts to interaction triggers

## Performance Optimizations

### Scaling Helper
- [ ] Create automatic scaling function using THREE.Box3().setFromObject()
- [ ] Scale models to desired width/height automatically

### Material Patches
- [ ] Replace MeshBasicMaterial with MeshStandardMaterial copies
- [ ] Prevent "emissive not supported" console errors

### LOD & Culling
- [ ] Create simplified proxy meshes for heavy assets
- [ ] Toggle model.visible based on player proximity
- [ ] Precompute model.boundingSphere for frustum culling
- [ ] Strip unused animations/cameras from GLBs

## Experience Enhancements

### Visual Effects
- [ ] Camera-triggered vignettes (boost bloom when approaching new mesh)
- [ ] UI captions for new props (project Vector3 to screen space)
- [ ] Holographic mesh loops (duplicate with additive blending for infinite tunnels)
- [ ] Mirrored plane for pseudo-reflection on DJ screen

### Special Modes
- [ ] Rest mode toggle (Ctrl+R) - fade to mellow colors, slow particles
- [ ] UV/blacklight mode (Shift+U) - adjust LED emissive intensities
- [ ] Dynamic camera fly-bys at hot zones (use teleportSystem anchors)

## World State & Events

### WorldStateReactor Integration
- [ ] Trigger color shifts during high-energy sections
- [ ] Pulse fog density with eventSystem.triggerStrobe()
- [ ] Sync visual effects to world state changes

## Testing Requirements

### TV Integration Checklist
- [ ] Run docs/testing/tv-integration-test.md after mesh swap
- [ ] Verify bounding boxes still align
- [ ] Check spawn logic still works
- [ ] Ensure UI overlays align correctly

### Audio-Reactive Verification
- [ ] Test with bass-heavy tracks
- [ ] Test with mid-frequency tracks
- [ ] Verify LED strips pulse correctly
- [ ] Verify fog density responds
- [ ] Verify portal particles pulse

### Console Checks
- [ ] No missing GLTF texture errors
- [ ] No loader warnings
- [ ] No "emissive not supported" errors
- [ ] All assets appear in README

## Future Enhancements (Log for Later)

### Holographic Additions
- [ ] Layer holographic rings around DJ booth (RingGeometry with additive materials)
- [ ] Animate rings with deltaTime for orbiting effects

### NPC Integration
- [ ] Introduce collaborative NPC avatars (reuse RemotePlayer mesh)
- [ ] NPCs dance and trigger visual cues
- [ ] NPCs highlight new assets

### Procedural Elements
- [ ] Use THREE.TorusGeometry/CylinderGeometry for portal rings
- [ ] Build DJ rigs procedurally if assets unavailable
- [ ] Apply emissive logic to procedural geometry

## Documentation Updates

### Required Updates
- [ ] Update public/models/external/README.md with all new assets
- [ ] Update docs/MODEL_INTEGRATION_GUIDE.md with integration patterns
- [ ] Update 05-Logs/Daily/2025-12-09-mesh-alternatives.md with progress
- [ ] Update docs/testing/tv-integration-test.md if new steps needed
- [ ] Add credits panel to game HUD (optional)

### Licensing
- [ ] Verify all asset licenses (prefer CC0 or CC-BY)
- [ ] Save exact URLs and license snapshots in README
- [ ] Document attribution requirements

