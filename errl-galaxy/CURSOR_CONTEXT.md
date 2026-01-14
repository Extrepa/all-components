💎 ERRL GALAXY: Master Design & Technical Specification
Version: 1.0

Status: Production Ready

Primary Goal: A high-performance, spatial (3D) visualization of the Errl Design System, featuring "Gem-like" aesthetics, real-time code editing, and cinematic navigation.

1. 🏗️ Tech Stack & Architecture
Core Framework

Frontend: Next.js 14+ (App Router)

Language: TypeScript (Strict Mode)

Styling: Tailwind CSS (Custom Config)

3D Engine (The "Galaxy")

Renderer: @react-three/fiber (Three.js wrapper)

Helpers: @react-three/drei (Camera, HTML overlay, Stats)

Post-Processing: @react-three/postprocessing (Bloom, Noise, Vignette)

Materials: MeshTransmissionMaterial (Iridescent Glass), Custom Shaders (shaderMaterial)

State & Data

Global State: Zustand (Bridges 2D HUD interactions with 3D Camera Rig)

Live Editing: Leva (Floating GUI for prop manipulation)

Data Pipeline: Custom Node.js Script (ts-morph) extracts component metadata into public/galaxy-manifest.json.

2. 🎨 The "Errl Gem" Aesthetic Guidelines
Any new visual feature must adhere to these strict style rules.

The "Gem" Look

Glass: Backgrounds must use MeshTransmissionMaterial with high chromaticAberration (0.1+) to create rainbow/oil-slick edges.

Neons: Use the official palette (#00ffff Cyan, #ff00ff Magenta).

Snaking Outlines: Active components must use the Animated Dash Shader (GlowingOutlineMaterial).

Holographic UI: 2D overlays must sit inside the glass, featuring scanlines and technical fonts (JetBrains Mono).

Color Palette (Tailwind Tokens)

Token	Hex	Usage
errl-void	#050505	Background / Deep Space
errl-cyan	#00ffff	Primary Active / Borders
errl-magenta	#ff00ff	Secondary Glow / Highlights
errl-lime	#ccff00	User Input / Cursors
3. 🧩 Core Capabilities & Features
A. The Orbital Layout Engine

Logic: Components are positioned based on Atomic Tier (Atoms @ Center, Molecules @ Mid, Organisms @ Edge).

Behavior: Nodes float independently using <Float>.

B. The "Gem" Node (ComponentNode.tsx)

LOD (Level of Detail):

Distance < 25: High Poly + Glass + HTML Overlay.

Distance 25-50: Wireframe Mesh.

Distance > 50: Simple Sphere/Dot.

Interaction: Clicking a node triggers activeId state, zooms camera, and enables the Leva playground.

C. The "Warp Drive" (Search & Teleport)

SearchHUD: A 2D React component that filters the manifest.

CameraRig: A headless 3D component that listens to useGalaxyStore and executes smooth camera flights (controls.setLookAt) to the target node.

D. The Automated Pipeline

Scraper: scripts/galaxy-builder.mjs runs before build. It scans /components, extracts props via AST, and generates galaxy-manifest.json.

4. ⚡ Performance & Optimization Rules
Target: 60 FPS on Standard Laptops.

Strict LOD: Never render HTML or heavy Glass materials for objects > 50 units away.

Texture Disposal: All textures and materials must be disposed of when the scene unmounts (handled via useEffect cleanup).

Selective Bloom: Bloom threshold is set to 0.2. Do not use pure white (#ffffff) for non-glowing elements; use #dddddd or lower.

Re-render Guard: ComponentNode must be wrapped in React.memo to prevent global re-renders on selection changes.

5. 🧪 Testing Strategy
Unit Testing (Jest/Vitest)

Scraper: Verify galaxy-builder.mjs correctly identifies component names and props.

Store: Verify useGalaxyStore correctly updates targetNodeId.

Visual/Performance Testing

Draw Call Monitor: Use <Stats />. Draw calls must stay under 100 in the default view.

Hydration Check: Verify no "Text content does not match server-rendered HTML" errors (ensure 3D canvas is Client-Side only).

Z-Fighting Check: Verify HTML overlays do not flicker against the glass mesh (ensure position.z offset is at least -0.05).

6. 🚀 Future Roadmap (For AI Context)
Multiplayer: Implement yjs + WebSockets to visualize other user cursors as floating lights.

VR Mode: Add @react-three/xr to allow "walking" through the galaxy.

Dependency Visualization: Draw bezier curves between "Atom" nodes and the "Molecules" that consume them.

End of Context Document