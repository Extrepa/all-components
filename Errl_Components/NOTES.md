3. Visualizing the Flow
This diagram explains how the User Input flows...

// etc.

---

4. Errl Landing Prototype (DOM → zustand → WebGL)
- Stack: Vite + React + TypeScript + @react-three/fiber + @react-three/drei + zustand.
- Entry: `src/main.tsx` renders `<Landing />` from `src/landing.tsx`.
- Layout: split hero – left DOM copy + trigger button, right WebGL canvas.
- Store: `src/store/useHypnoStore.ts` holds `isHovered` + `setHovered`, no React context.
- Trigger: `src/components/TriggerButton.tsx` toggles `isHovered` on hover in/out.
- Scene: `src/components/TrippyScene.tsx` → `MeltingMesh` reads `useHypnoStore.getState()` inside `useFrame`.
  - Scales + spin speed `lerp` between chill and “intense” states instead of snapping.
- Styling: `.landing-*` layout + `.trigger-button` in `src/styles.css` control the dark hero + CTA look.
- Net effect: HTML button and WebGL mesh “scream in unison” without React re-renders; animation is driven directly from the store inside the RAF loop.
