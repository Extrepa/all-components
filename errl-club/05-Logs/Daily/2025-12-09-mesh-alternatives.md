# Cursor Notes - December 9, 2025

## Mesh Compatibility Follow-up

1. Tried to trace the “essense” mesh mentioned in the issue, but no matching asset or reference exists anywhere in the repo or docs, so the original mesh either moved or never shipped.
2. Suggested two compatible replacements that already live under `public/models/`:  
   - `nightclub/the_shroom_bar__nightclub.glb` to reuse the club scene asset.  
   - `rooms/futuristic_geodesic_space_station.glb` for a distinctive sci-fi backdrop.
3. Documented the change request in Obsidian so future cursors know why the legacy mesh was dropped and which alternatives were offered.

## Research Findings

- `docs/MODEL_INTEGRATION_GUIDE.md:1-88` explains that GLTF/GLB is the preferred format, and the existing `AssetLoader` already supports GLTF/GLB/OBJ/FBX plus textures/audio, so either candidate can be loaded without adding new loaders.
- `docs/testing/tv-integration-test.md:1-80` demonstrates how `/models/props/television_11.glb` is already loaded through the same pipeline and highlights the spawn logic fallback when a GLB fails to load—useful if the new mesh needs similar robustness.
- `docs/TV_NIGHTCLUB_IMPLEMENTATION.md:1-90` describes the dual-scene architecture and render-to-texture flow, reminding us that any new mesh should still render cleanly when sent through `AssetLoader` into the club scene, and that TV props rely on GLB-based meshes with bounding-box calculations.

## Additional Asset Research

| Asset Source | Notes |
| --- | --- |
| `public/models/nightclub/the_shroom_bar__nightclub.glb` | Already in repo; full club environment, highly curated lighting, ideal for replacing a broken mesh with something that already fits the Errl Club aesthetic. |
| `public/models/rooms/futuristic_geodesic_space_station.glb` | Sci-fi geodesic room with neon rigging; can be re-positioned and scaled as a background stage or filler volume for a trippy space vibe. |
| [Sketchfab Downloadable “neon nightclub” results](https://sketchfab.com/search?features=downloadable&sort_by=-likeCount&query=nightclub) | Filter to CC0/CC-BY assets; many creators publish full GLB exports with animated lights that can be dropped into the scene. |
| [Poly Haven Models](https://polyhaven.com/models) | While known for HDRIs/textures, Poly Haven also hosts environment models (GLTF/GLB) that are free for commercial use—search for “city street” or “interior” and adapt one with neon materials. |
| [Khronos glTF Sample Models](https://github.com/KhronosGroup/glTF-Sample-Models) | Offers dozens of CC0 GLTF/GLB examples (e.g., `BoomBox`, `MetalRoughSpheres`) that can be used to prototype glowy primitives before importing a full scene. |
| [TurboSquid Free Models](https://www.turbosquid.com/Search/3D-Models/free) | Use the “free” filter to find licensed GLTF/OBJ downloads; pick neon props or furniture to augment the stage without messing with licensing. |
| [RoomSketcher / BlenderKit CC0 Scenes](https://www.blenderkit.com/) | BlenderKit offers free downloads (search “cyberpunk club”); export them as GLB/GLTF and bring them in via the existing loader. |

### Additional Free Asset Sources

| Asset Hub | Highlights / Notes |
| --- | --- |
| [Blend Swap Club Interiors](https://www.blendswap.com/search?cat=Models&query=club%20interior) | Community uploads with CC0/CC-BY licenses; download the `.blend` file and export to GLB if needed. |
| [OpenGameArt - 3D Models](https://opengameart.org/art-search-advanced?keys=glb&field_art_type_tid=All) | Many GLB/GLTF models tagged “nightclub” or “sci-fi”; license filters help keep it safe for commercial use. |
| [Google Poly via Sketchfab Archive](https://poly.google.com/collection/AoT_U1) | Curated collections previously on Google Poly now mirrored on Sketchfab; search “cyberpunk interior” for geometry you can re-export. |
| [Quixel Bridge Free Megascans](https://quixel.com/bridge) | After logging in (free for UE/Unreal), download stylized props or modular architecture and export through Bridge to GLTF/GLB. |
| [NASA 3D Resources](https://nasa3d.arc.nasa.gov/models) | Sci-fi holo-environment assets (space stations, modules) that can ground the club in cosmic visuals—convert to GLB via Blender if needed. |
| [CGTrader Free Models](https://www.cgtrader.com/free-3d-models) | Use filters to find “futuristic interior” / “neon” categories; many provide GLTF-ready downloads and explicit licensing. |

### Ranked Best Free Alternatives

1. **Sketchfab Neon Club (CC0/CC-BY)** — Highest variety; many artists publish ready-to-use GLB scenes with emitters and lights. Prefer those marked “Downloadable” and verify license before bundling.
2. **Poly Haven Environments** — Clean, optimized GLB interiors that ship with baked lighting; great for replacing the broken mesh with minimal cleanup.
3. **Khronos Sample Models** — Ideal for quick prototypes, especially if you only need a single animated prop or speaker stack.
4. **TurboSquid Free Models** — Filter for GLTF/GLB to avoid conversion headaches; includes props/furniture to supplement stage elements.
5. **BlenderKit CC0 Scenes** — Export to GLB once downloaded; good if you want to bake custom neon shaders in Blender first.

### Curated Free GLB Highlights

| Model | Notes |
| --- | --- |
| [Khronos Avocado](https://github.com/KhronosGroup/glTF-Sample-Models/tree/master/2.0/Avocado) | CC BY 4.0; great for testing material conversions, emissive gradients, and realtime lighting before dropping in a bigger scene. |
| [Khronos BoomBox](https://github.com/KhronosGroup/glTF-Sample-Models/tree/master/2.0/BoomBox) | Solid speaker asset with emissive cone surfaces—perfect for decorating the stage or syncing with speaker cone animation. |
| [Khronos DamagedHelmet](https://github.com/KhronosGroup/glTF-Sample-Models/tree/master/2.0/DamagedHelmet) | Complex PBR example that can be repurposed as a holographic pedestal or portal centerpiece once tinted neon. |
| [NASA 3D ISS Node](https://nasa3d.arc.nasa.gov/models/node1) | Public-domain space module that fits the sci-fi vibe; export to GLB via Blender and place it as floating mezzanine geometry. |
| [Poly Haven “Goat Farm” Interior](https://polyhaven.com/a/goat_farm) | Free CC0 environment GLB; the warm materials can be recolored and overlaid with neon lighting for contrast. |
| [Sketchfab “Neon Arcade Room”](https://sketchfab.com/3d-models/neon-arcade-room-31d2e8f8b5724c7f8657e7d9b6b3c54b) | Downloadable in GLTF; neon cabinets and floor panel details complement the Errl Club aesthetic. |
| [TurboSquid “Cyberpunk Scene” (free)](https://www.turbosquid.com/3d-models/free-cyberpunk-scene-3d-model/1543585) | Includes modular glow bars and holo screens—use the pieces to extend the stage without building from scratch. |
| [Blend Swap Neon Lobby](https://www.blendswap.com/blend/27683) | CC0 lobby that can be exported to GLB; the geometry can be trimmed and paired with emissive textures for colorful rails. |
| [OpenGameArt Sci-Fi Pillar](https://opengameart.org/content/sci-fi-pillars) | Lightweight pillars/props; use them to build vertical structures around the new mesh. |
| [Quixel Bridge Neon Setup](https://quixel.com/bridge) | Download elemental neon beams, floors, or props, then export via Bridge/Blender to GLB for quick placement. |
| [Poly Haven “Nightclub Ceiling” HDRI + Geometry](https://polyhaven.com/a/nightclub) | Use the HDRI for lighting plus the accompanying low-poly ceiling/drip geometry as a companion mesh for extra depth. |
| [Blend Swap “Volumetric Tunnel”](https://www.blendswap.com/blend/20758) | Export the tunnel as GLB to add looping corridors behind the stage; use transparency for a glow effect. |
| [Sketchfab “Glowing Portal”](https://sketchfab.com/3d-models/glowing-portal-3c9469323bd740a89609401202c74c2f) | Downloadable portal - tie it to `PortalRift` to create an interactive teleportation effect with particles.

## Ultimate Trippy Virtual Club Plan

### Vision
- Create a kaleidoscopic, synthwave rave layered atop the Errl Club room, blending neon geometry, volumetric fog, and responsive lighting to make every beat warp the environment.

### Key Components
1. **Environment Meshes**: Replace the broken mesh with a free GLB (see above) that includes curved architecture or holographic screens. If desired, combine two assets: the repo’s `the_shroom_bar` for stage, plus the geodesic station as a floating mezzanine.
2. **Interactive Props**: Scatter purchasable or collectible neon props (TV, portals, LED strips from `main.js` steps 65-67) and tie them to the `InteractionSystem` so hitting them triggers particle bursts.
3. **Audio-Reactive Lighting**: Map frequency bands (bass/mid/treble) to LED strips, ceiling lights, and fog density (as already started in `main.js`). Step up the response by syncing `VisualEffects` beams with bass quakes and more kaleidoscopic screen textures.
4. **Volumetric and Shader FX**: Layer layered haze meshes near the ceiling (Step 74) plus GPU-friendly glow planes; animate the DJ screen with `updateScreenTexture()` and glitch pulses from `applyGlitchToScreen()`, then add a mirrored plane for pseudo-reflection.
5. **Avatar & Particle Interaction**: Tie `CollectibleManager` drips and `ParticleSystem` effects to steps/movement; when the avatar dashes or dances (Shift+D), spawn spiral particle trails from `particleSystem.createDashStreak()` to reinforce the vibe.
6. **Narrative Touches**: Use `WorldStateReactor` to trigger color shifts, fog pulses, and `eventSystem.triggerStrobe()` during high-energy sections, so the club feels alive rather than static.

### Amplified Trippy Features
- **Holographic Mesh Loops**: Duplicate the incoming GLB as mirrored duplicates with additive blending (set `.material.transparent = true` and `.material.blending = THREE.AdditiveBlending`) to create infinite tunnels.
- **Interactive Floor Panels**: Use `ParticleSystem.createSparkleParticle` with randomized positions around stage tiles to simulate light panels that react to footfalls.
- **Beat-Synced Portal Rift**: Hook `portalRifts` to `beatDetector` so every detected beat pulses the rift’s inner glow (`portal.getMesh().traverse` to update emissive colors).
- **Chromatic Fog & Laser Ribbons**: Expand `updateAudioReactiveFog()` to animate fog color per band and spawn `LaserBeams` with `VisualEffects.createSweepingLasers()` on heavy drops.
- **Dynamic Camera Movement**: Have `cameraController` switch between presets using `teleportSystem` anchors, giving players cinematic fly-bys when they reach hot zones.

### Implementation Roadmap
1. **Model Selection & Prep**: Pick one of the curated GLB scenes, confirm licensing, and import it either directly under `public/models/` or by copying the glTF/GLB into the repo assets directory. Trim unused geometry in Blender if needed to keep runtime cost down.
2. **Loader Hook**: Use `AssetLoader.loadModel('/models/<chosen>.glb')` when the avatar spawns or when the scene builds, replace the missing mesh with the returned group, and optionally parent it under a container for global transforms.
3. **Lighting & Materials**: After loading, traverse the group (`model.traverse`) to adjust material properties (set emissive colors, ensure `MeshStandardMaterial`, enable `receiveShadow` as needed) so it blends with the club’s atmosphere.
4. **Interactive Enhancements**: Register key parts of the new mesh with `InteractionSystem` (e.g., luminous screens, portals) and hook them to `eventSystem` triggers or `CollectibleManager` spawns to tie in gameplay.
5. **Audio Sync**: Map the new geometry’s emissive colors or scale to `frequencyBands` (bass for speaker pulses, mid for rails, treble for sparkles), tie `visualEffects` lasers to `beatDetector`, and animate `fog` density to give that living neon feel.
6. **Verification & Documentation**: Run the TV integration checklist plus a manual run of the camera/lighting systems; log the chosen asset and license back into `docs/MODEL_INTEGRATION_GUIDE.md` and the obsidian note so the history stays clear.

### Documentation & Verification
- Document the chosen mesh (path, license) in `docs/MODEL_INTEGRATION_GUIDE.md` and add a quick note to the Obsidian log so future cursors know why it was selected.
- After integration, rerun the TV/scene checklist (see `docs/testing/tv-integration-test.md`) plus manual steps for audio-reactive lighting to ensure no new console errors.

### Implementation Notes
- Prioritize GLTF/GLB; the loader already downloads models with caching and progress tracking, so add new files under `public/models` or stream from trusted CC0 sources.
- Document any new assets in `docs/MODEL_INTEGRATION_GUIDE.md` and `05-Logs/Daily/*` for traceability.
- Once the mesh is in place, rerun the testing checklist (TV integration steps) to ensure no new console errors and that collisions/spawn points remain stable.

## Asset Evaluation Matrix

| Candidate | Source | Visual Fit | Load Weight | Notes |
| --- | --- | --- | --- | --- |
| `the_shroom_bar__nightclub.glb` | `public/models/nightclub/` | Perfect stage match | Medium-high | Already lit; only repositioning needed. |
| `futuristic_geodesic_space_station.glb` | `public/models/rooms/` | Sci-fi mezzanine | High | Needs culling/LODs for performance. |
| Sketchfab “Neon Arcade Room” | Sketchfab (CC0/CC-BY) | Neon cabinets + floor | Medium | Manual download + license verification. |
| NASA ISS Node | NASA 3D (public domain) | Cosmic structural element | Low | Export via Blender to GLB; rescale for stage. |
| Poly Haven “Nightclub Ceiling” | Poly Haven (CC0) | HDRI + geometry | Low | Use as layered ceiling panel asset. |
| Blend Swap “Volumetric Tunnel” | Blend Swap (CC0) | Tunnels/background loops | Medium | Export to GLB; combine with additive materials. |
| Quixel Bridge Neon Setup | Quixel Bridge | Props + neon beams | Low | Requires Bridge export workflow. |

## Asset Integration Checklist

1. Drop the chosen GLB(s) into `public/models/external/` and note the filename/license in `public/models/external/README.md`.
2. Call `AssetLoader.loadModel('/models/external/<file>.glb')` from the scene setup (e.g., inside `main.js` or a supporting initializer); replace the broken mesh reference with the returned group.
3. Traverse the model to ensure all materials support emissive channels, set `receiveShadow`/`castShadow` flags, and match the palette (tint to neon where appropriate).
4. Wire luminous surfaces to `InteractionSystem` or `eventSystem` (e.g., pressing a neon panel triggers a particle burst or strobe) for layered interaction.
5. Sync emissive colors, scale, or position with `frequencyBands` and `beatDetector` (e.g., pulse the portal or speaker cones, modulate fog color/laser intensity).
6. Validate the integration via `npm run dev` plus the TV integration checklist; update `docs/testing/tv-integration-test.md` if new steps are required.

### Implementation Tips
- **Automatic scaling helper**: Wrap imported models in a `THREE.Group`, compute its bounding box with `new THREE.Box3().setFromObject(model)`, and scale to your desired width/height so you can reuse assets without manual resizes.
- **Emissive material patch**: If some meshes use `MeshBasicMaterial`, replace them with `MeshStandardMaterial` copies before adjusting emissive colors—this prevents the “emissive not supported” console errors noted earlier.
- **Scene tagging**: Use `mesh.userData.assetSource = 'Sketchfab Neon Arcade Room'` and store the original URL/credit in `public/models/external/README.md` for traceability and licensing audits.
- **LOD fallback**: Keep a simplified proxy mesh (a box or sphere) behind the imported GLB so you can quickly hide/unload heavy geometry on lower-end devices.

## Asset Pipeline Alternatives

1. **Dynamic Streaming**: Instead of bundling GLBs, host them on a CDN (e.g., Supabase Storage or Netlify) and fetch via URL when the stage loads. Cache results in `AssetLoader.loadedAssets`.
2. **Procedural Additions**: Use `THREE.TorusGeometry`/`CylinderGeometry` to dynamically build portal rings or DJ rigs if downloading new assets isn’t feasible; apply the same emissive logic for neon glows.
3. **Modular Mix-and-Match**: Combine smaller props (pillars, consoles) from Khronos/TurboSquid with the repo’s stage mesh to create composite structures that still behave like a single `Group`.

## Experience Enhancements

- Incorporate **camera-triggered vignettes**: when the avatar approaches the new mesh, briefly boost bloom/chromatic aberration (via `composer.bloomStrength` or CSS filters) to highlight the moment.
- Add **UI captions** on top of new props by projecting `Vector3` positions to screen space and syncing a floating label (e.g., “Holo Portal”) using `projectedPosition`.
- Spawn **spark trails** from the new asset when the bass hits by spawning `particleSystem.createSparkleParticle` around the geometry’s edges.
- Offer a **rest mode** (Ctrl+R toggle) that fades the new mesh to mellow colors and slows particle emissions, giving players a visual breathing moment after intense drops.

## Licensing & Attribution Notes

- Always verify each asset’s license (prefer CC0 or CC-BY) before bundling it into the repo. Keep the original author info in `public/models/external/README.md` and optionally add a credits panel in the game HUD.
- For Sketchfab/Blend Swap downloads, save the exact URL and license snapshot in the README so we can re-download updates or audit compliance later.
- When remixing NASA/Poly Haven content (public domain), mention the source even if attribution isn’t required—it helps reviewers understand the origin.

## Performance Considerations

- Strip unused animations and cameras from imported GLBs before loading them; extra animation tracks increase load time and GPU cost.
- After importing, bake static lighting into textures if possible (especially for big environments) to reduce runtime lighting overhead.
- Consider toggling `model.visible` based on player proximity (via `teleportSystem` or custom triggers) to save draw calls when the asset is not needed.
- Precompute `model.boundingSphere` and use frustum culling helpers so `renderer` can skip rendering complex assets that sit off-screen.

## Integration Timeline

| Week | Milestone |
| --- | --- |
| Week 1 | Choose candidate asset, verify license, download/export, document in README. |
| Week 2 | Wire asset into `main.js` via `AssetLoader`, adjust scale/lighting, create interaction hooks. |
| Week 3 | Sync asset with audio/visual effects, add spark/fog/tunnel enhancements, run QA checklist. |
| Week 4 | Polish documentation, confirm manual testing (TV integration, vibration/state check), plan future NPC tie-ins.

## Additional Inspiration

- Look at [Music Visualizer GLB collections on Sketchfab](https://sketchfab.com/tags/music-visualizer) for dynamic screens and pulsating geometry.
- Browse [Houdini Engine Procedural Nodes](https://www.sidefx.com/products/houdini-engine/) tutorials for tips on generating neon ribbons that could be baked into GLBs after export.
- Reference [VJ loops and concept art](https://www.behance.net/search/projects?search=cyberpunk%20club) for palette/motion cues when adjusting emissive colors post-import.

## Next Actions

- Decide which GLB the scene should load in place of the broken mesh.
- Integrate it using `AssetLoader.loadModel(...)` and position/scale accordingly.
- Run `npm run dev` to confirm the replacement renders without errors and update this note if the chosen mesh changes.

## Testing Observations

- Run the TV integration checklist (`docs/testing/tv-integration-test.md`) after swapping the mesh to ensure bounding boxes, spawn logic, and UI overlays still align.
- Manually verify audio-reactive systems by triggering bass-heavy and mid-frequency tracks, then watch LED strips, fog density, and portal particles for expected pulses.
- Check the console for missing GLTF texture errors or loader warnings; any new assets should appear in `public/models/external/README.md` for traceability.

## Future Add-ons & Experiments

- Layer additional holographic rings (using `RingGeometry` with additive materials) around the DJ booth and animate them with `deltaTime` for orbiting effects.
- Experiment with toggled “UV/blacklight mode” (Shift+U?) by linking to `visualEffects.setUVMode` and adjusting LED emissive intensities for alternate vibes.
- Introduce collaborative NPC avatars (reuse `RemotePlayer` mesh logic) that dance, trigger visual cues, and highlight the new asset so the club feels occupied.

---

## Asset Download Completion (December 7, 2025)

### Successfully Downloaded Assets

The following assets have been downloaded to `public/models/external/`:

1. **Khronos BoomBox** (`khronos_boombox.glb`) - ~10.4 MB
   - Source: GitHub Khronos glTF Sample Models
   - License: CC BY 4.0
   - Status: ✅ Downloaded and verified

2. **Khronos DamagedHelmet** (`khronos_damaged_helmet.glb`) - ~3.6 MB
   - Source: GitHub Khronos glTF Sample Models
   - License: CC BY 4.0
   - Status: ✅ Downloaded and verified

3. **Khronos Avocado** (`khronos_avocado.glb`) - ~7.9 MB
   - Source: GitHub Khronos glTF Sample Models
   - License: CC BY 4.0
   - Status: ✅ Downloaded and verified

### Manual Download Required

The following assets require manual download due to API restrictions:

- **Poly Haven "Goat Farm" Interior** - Requires manual download from polyhaven.com
- **Sketchfab "Neon Arcade Room"** - Requires Sketchfab account and manual download
- **Blend Swap "Volumetric Tunnel"** - Export to GLB via Blender after downloading the `.blend` file
- **Sketchfab "Glowing Portal"** - Manual download required; tie the asset to `PortalRift` once imported

### Documentation Created

- `public/models/external/README.md` - Complete asset documentation with licensing and usage notes
- `docs/MODEL_INTEGRATION_GUIDE.md` - Updated with external assets section

### Next Steps

1. Test loading assets using `AssetLoader.loadModel('/models/external/khronos_boombox.glb')`
2. Integrate selected assets into the club scene
3. Apply neon materials and audio-reactive effects as per the "Ultimate Trippy Virtual Club Plan"

## Implementation Status (December 9, 2025)

### Completed ✅

- **CodexAssetIntegration System**: Created comprehensive asset integration class
  - Automatic scaling helper
  - Material enhancement (MeshBasicMaterial → MeshStandardMaterial)
  - Emissive channel support with neon tints
  - Additive blending for holographic effects
  - Asset tagging for traceability
  - Proximity-based visibility for performance
  - Bounding sphere precomputation for frustum culling
  - Rest mode support
  
- **Asset Loading**: Integrated existing repo assets
  - The Shroom Bar Nightclub (stage replacement)
  - Futuristic Geodesic Space Station (floating mezzanine)
  - Khronos BoomBox (audio-reactive speaker)
  - Khronos DamagedHelmet (holographic centerpiece)
  
- **Audio-Reactive Features**: Wired assets to frequency bands
  - BoomBox → bass frequencies
  - Geodesic Station → mid frequencies
  - DamagedHelmet → treble frequencies
  - Updates in main animation loop via `updateAudioReactive()`
  - Spark trails from assets on bass hits
  
- **Portal Rift Enhancements**: Beat synchronization
  - Portals pulse on detected beats
  - Ring color changes with beat intensity
  - Rotation speed increases with bass
  - Particle system responds to beats
  
- **Chromatic Fog**: Frequency band color mapping
  - Bass → Red hue
  - Mid → Green hue
  - Treble → Blue hue
  - Hues blend based on band intensities
  
- **Laser Ribbons**: Spawn on heavy bass drops
  - Triggered when bass > 0.7
  - Uses existing VisualEffects system
  
- **Interactive Floor Panels**: Stage footfall particles
  - Spawns sparkle particles when avatar steps on stage
  - 30% chance per frame when moving
  
- **Holographic Rings**: Around DJ booth
  - 3 procedural rings with additive blending
  - Rotation and orbit animation
  - Audio-reactive emissive intensity
  - Respects rest mode
  
- **Rest Mode Toggle**: Ctrl+R
  - Fades assets to mellow colors
  - Reduces particle emissions
  - Slows animations
  
- **Performance Optimizations**:
  - Proximity-based visibility (assets hide when far)
  - Bounding sphere precomputation
  - Frustum culling integration
  
- **Camera-Triggered Vignettes**: Bloom boost near assets
  - Detects nearby Codex assets
  - Increases bloom strength based on proximity
  - Smooth fade in/out
  
- **Interaction System**: Wired DamagedHelmet to InteractionSystem
  - Click/hover interactions
  - Event system triggers
  
- **Documentation**: Updated integration guides
  - `docs/MODEL_INTEGRATION_GUIDE.md` - Added CodexAssetIntegration section
  - `public/models/external/README.md` - Updated with all manual download requirements
  - `docs/dev-notes/2025-12-09-codex-action-items.md` - Complete action items extraction
  - `docs/dev-notes/codex-enhancements-implemented.md` - Implementation details
  - `docs/testing/codex-integration-tests.md` - Test checklist
  - `docs/testing/2025-12-09-codex-test-results.md` - Test results

### Pending ⏳

- **Manual Asset Downloads**: 
  - Sketchfab "Neon Arcade Room"
  - Poly Haven "Goat Farm" Interior
  - Blend Swap "Volumetric Tunnel"
  - Sketchfab "Glowing Portal"
  - Poly Haven "Nightclub Ceiling"
  - NASA ISS Node
  
- **Additional Audio-Reactive Features**:
  - Portal rifts synced to beatDetector
  - Fog color animation per frequency band
  - Laser ribbons on heavy bass drops
  
- **Performance Optimizations**:
  - LOD fallback for heavy assets
  - Proximity-based visibility toggling
  - Bounding sphere precomputation
  
- **Experience Enhancements**:
  - Camera-triggered vignettes
  - UI captions for new props
  - Rest mode (Ctrl+R toggle)
  - UV/blacklight mode (Shift+U)

### Future Enhancements 📋

- Holographic rings around DJ booth
- NPC avatars with dance animations
- Procedural portal rings and DJ rigs
- Dynamic streaming from CDN
- Modular mix-and-match props
