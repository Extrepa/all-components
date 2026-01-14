ERRL: MASTER SPECIFICATION & TESTING PROTOCOL
Version: 1.0.0 "Genesis" Architect: Errl, UI Mastermind Core Philosophy: "Deep Immersion" Protocol. High-performance WebGL physics blended with semantic HTML overlays.

1. TECHNICAL STACK (NON-NEGOTIABLE)
Runtime: React 18 + Vite (TypeScript)

3D Engine: Three.js + React Three Fiber (@react-three/fiber)

Physics: Cannon.js (@react-three/cannon) running in a Web Worker.

Animation: React Spring (@react-spring/three) + Framer Motion.

Styling: Tailwind CSS (Utility-first, config-driven) .

Shaders: Custom GLSL embedded in TypeScript strings (.ts) to avoid loader complexity.

State: Zustand (transient updates) + Refs (direct manipulation).

2. COMPONENT ARCHITECTURE
A. The Core Scene (App.tsx)

Camera: Fixed Perspective at [0, 0, 5].

Scroll: Hijacked by ScrollControls (Damping: 0.3).

Layering:

Z-Index 0 (Canvas): ErrlBackdrop, StretchyBubble, ExplosionSystem, ContactBubble.

Z-Index 10 (HTML): Semantic overlay (<Scroll html>) with pointer-events-none.

B. The Fluid Simulation (ErrlBackdrop.tsx + errl.ts)

Technique: Domain Warping via Fractal Brownian Motion (FBM).

Logic:

f(p) = fbm( p + fbm( p + fbm(p) ) )

The "Projector Light" is a 2D distance field mask in the fragment shader.

Sync: uScrollY uniform is driven by scroll.offset.

Performance:

High Tier: 4 Octaves of noise.

Low Tier: 2 Octaves of noise (swapped via quality.ts) .

C. The Interaction Actors (StretchyBubble.tsx)

Physics: Rigid Body (useSphere) with zero gravity.

Visuals:

High Tier: MeshTransmissionMaterial (Glass/Refraction).

Low Tier: MeshDistortMaterial (Plastic/Wobble).

Behavior: Applies random Sine wave forces [sin(t), cos(t)] to float.

D. The Feedback Loop (ExplosionSystem.tsx)

Pattern: Object Pooling / Instancing.

Logic: One InstancedMesh with 50 particles.

Trigger: ref.current.trigger(position). Resets time=0 and assigns random velocities.

Constraint: Never instantiate new geometry on click. Recycle only .

3. CAPABILITIES & FEATURES
1. "Trippy Mode" (Gyroscope)

Component: TrippyCam.tsx

Capability: Unlocks camera from fixed position; maps DeviceOrientation (Alpha/Beta/Gamma) to Camera Rotation.

Requirement: Must handle iOS requestPermission promise logic.

2. Procedural Audio

Hook: useBloop.ts

Tech: Web Audio API (Oscillator + GainNode).

Sound Profile: Frequency sweep (800Hz -> 300Hz) over 0.15s. Exponential decay gain.

3. Contact Form "Bubble"

Component: ContactBubble.tsx

State: Boolean isOpen.

Physics: react-spring expands scale from 1.5 -> 10.

DOM Integration: Uses <Html transform> to embed a Tailwind-styled form inside the 3D world coordinates .

4. TESTING PROTOCOL
Since we cannot easily Unit Test WebGL output, we rely on Integration & Performance Testing.

A. The "Smoke Test" (Manual)

Load: Does the page load in < 1.5s? (Check Network tab).

Scroll: Does the "Projector Light" move UP as you scroll DOWN?

Interaction: Click a bubble.

Expected: "Bloop" sound plays. Bubble vanishes. Particles explode at exact cursor location.

Form: Click "Signal Errl" bubble.

Expected: Bubble expands smoothly. HTML form appears. Clicking input does not close the bubble (stopPropagation).

B. Performance "Gauntlet"

FPS Target: 60fps constant.

Draw Calls: Monitor via gl.info.render.calls. Should be < 20 (thanks to Instancing).

Memory: Check for Texture leaks when toggling "Trippy Mode" on/off.

C. Mobile Responsiveness Check

Viewport: Is user-scalable=no active? (Prevent pinch-zoom).

Quality: Does getQualityTier() correctly identify mobile and downgrade materials?

Verify: Mobile should see MeshDistortMaterial (Opaque), Desktop sees MeshTransmissionMaterial (Glass).

5. DIRECTIVES FOR AI (CURSOR)
When modifying this code, you must obey these rules:

Preserve the Stack: Do not introduce new libraries (e.g., GSAP) unless explicitly asked. We use react-spring and framer-motion.

Shader Integrity: Do not change the Magic Numbers in errl.ts (e.g., vec2(5.2, 1.3)) without backup. These control the fluid viscosity.

Type Safety: Strict TypeScript. No any unless wrapping a complex Three.js ref that lacks proper types in R3F.

File Structure: All components in src/components, all logic in src/hooks or src/utils.

Styling: Use Tailwind utility classes. Do not write custom CSS in index.css unless it's a specific keyframe animation not supported by Tailwind config.

End of Spec. born on the overhead projector.