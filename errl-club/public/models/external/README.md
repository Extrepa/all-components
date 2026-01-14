# External Mesh Assets

This directory contains externally sourced 3D models (GLB/GLTF format) for use in the Errl Club Simulator.

## Downloaded Assets

### Khronos glTF Sample Models

All Khronos models are licensed under **CC BY 4.0** and require attribution.

#### 1. BoomBox (`khronos_boombox.glb`)
- **Source**: [Khronos glTF Sample Models - BoomBox](https://github.com/KhronosGroup/glTF-Sample-Models/tree/master/2.0/BoomBox)
- **License**: CC BY 4.0
- **Size**: ~10.4 MB
- **Description**: Solid speaker asset with emissive cone surfaces—perfect for decorating the stage or syncing with speaker cone animation.
- **Attribution**: Model by Khronos Group, licensed under CC BY 4.0
- **Usage**: Stage prop, audio-reactive visual element

#### 2. DamagedHelmet (`khronos_damaged_helmet.glb`)
- **Source**: [Khronos glTF Sample Models - DamagedHelmet](https://github.com/KhronosGroup/glTF-Sample-Models/tree/master/2.0/DamagedHelmet)
- **License**: CC BY 4.0
- **Size**: ~3.6 MB
- **Description**: Complex PBR example that can be repurposed as a holographic pedestal or portal centerpiece once tinted neon.
- **Attribution**: Model by Khronos Group, licensed under CC BY 4.0
- **Usage**: Holographic centerpiece, portal decoration

#### 3. Avocado (`khronos_avocado.glb`)
- **Source**: [Khronos glTF Sample Models - Avocado](https://github.com/KhronosGroup/glTF-Sample-Models/tree/master/2.0/Avocado)
- **License**: CC BY 4.0
- **Size**: ~7.9 MB
- **Description**: Great for testing material conversions, emissive gradients, and realtime lighting before dropping in a bigger scene.
- **Attribution**: Model by Khronos Group, licensed under CC BY 4.0
- **Usage**: Material testing, emissive gradient examples

## Manual Download Required

The following assets require manual download due to API restrictions or authentication requirements:

### Poly Haven "Goat Farm" Interior
- **Source**: [Poly Haven - Goat Farm](https://polyhaven.com/a/goat_farm)
- **License**: CC0 (Public Domain)
- **Notes**: Free CC0 environment GLB; the warm materials can be recolored and overlaid with neon lighting for contrast.
- **Download**: Visit Poly Haven website and download GLB format manually

### Sketchfab "Neon Arcade Room"
- **Source**: [Sketchfab - Neon Arcade Room](https://sketchfab.com/3d-models/neon-arcade-room-31d2e8f8b5724c7f8657e7d9b6b3c54b)
- **License**: Check model page for specific license (typically CC BY 4.0)
- **Notes**: Downloadable in GLTF; neon cabinets and floor panel details complement the Errl Club aesthetic.
- **Download**: Requires Sketchfab account and manual download from model page
- **Priority**: High - Perfect visual fit for Errl Club aesthetic

### Sketchfab "Glowing Portal"
- **Source**: [Sketchfab - Glowing Portal](https://sketchfab.com/3d-models/glowing-portal-3c9469323bd740a89609401202c74c2f)
- **License**: Check model page for specific license
- **Notes**: Downloadable portal - tie to PortalRift class for interactive teleportation with particles
- **Download**: Requires Sketchfab account and manual download
- **Priority**: High - Direct integration with existing PortalRift system

### Blend Swap "Volumetric Tunnel"
- **Source**: [Blend Swap - Volumetric Tunnel](https://www.blendswap.com/blend/20758)
- **License**: CC0
- **Notes**: Export the tunnel as GLB to add looping corridors behind the stage; use transparency for glow effect
- **Download**: Download .blend file, export to GLB via Blender
- **Priority**: Medium - Background loops and tunnel effects

### Poly Haven "Nightclub Ceiling"
- **Source**: [Poly Haven - Nightclub](https://polyhaven.com/a/nightclub)
- **License**: CC0 (Public Domain)
- **Notes**: HDRI for lighting plus low-poly ceiling/drip geometry as companion mesh
- **Download**: Visit Poly Haven website, download HDRI and geometry separately
- **Priority**: Medium - Layered ceiling panel asset

### NASA ISS Node
- **Source**: [NASA 3D Resources - ISS Node](https://nasa3d.arc.nasa.gov/models/node1)
- **License**: Public Domain
- **Notes**: Sci-fi space module; export to GLB via Blender, rescale for stage as cosmic structural element
- **Download**: Download from NASA 3D Resources, convert to GLB
- **Priority**: Low - Cosmic visual element

## Integration Notes

All assets in this directory can be loaded using the existing `AssetLoader` system:

```javascript
// Example: Load BoomBox
const boombox = await AssetLoader.loadModel('/models/external/khronos_boombox.glb', {
    position: new THREE.Vector3(0, 1, -5),
    scale: new THREE.Vector3(1, 1, 1)
});
```

## License Compliance

When using CC BY 4.0 licensed assets (Khronos models), ensure attribution is included in:
- Game credits
- Documentation
- README files

Example attribution text:
> "BoomBox model by Khronos Group, licensed under CC BY 4.0"

## File Verification

All downloaded GLB files have been verified as valid glTF binary format:
- `khronos_boombox.glb`: ✅ Valid glTF binary v2
- `khronos_damaged_helmet.glb`: ✅ Valid glTF binary v2
- `khronos_avocado.glb`: ✅ Valid glTF binary v2

## Repo Assets (Already Available)

These assets are already in the repository and can be used immediately:

### The Shroom Bar Nightclub
- **Path**: `public/models/nightclub/the_shroom_bar__nightclub.glb`
- **License**: Check repo documentation
- **Description**: Full club environment with curated lighting, perfect stage match
- **Usage**: Stage replacement, main club scene
- **Priority**: High - Already in repo, ready to use

### Futuristic Geodesic Space Station
- **Path**: `public/models/rooms/futuristic_geodesic_space_station.glb`
- **License**: Check repo documentation
- **Description**: Sci-fi geodesic room with neon rigging
- **Usage**: Floating mezzanine, background stage, filler volume
- **Priority**: High - Already in repo, needs positioning/scaling

## Last Updated

December 7, 2025 - Initial asset download and documentation  
December 9, 2025 - Added Codex recommendations and manual download list

