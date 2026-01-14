# Errl Components

> **Born on the overhead projector. Living in the browser.**

A high-performance, WebGL-powered narrative engine that syncs DOM interactions with GPU shaders in real-time. Errl creates immersive, fluid experiences where HTML buttons trigger WebGL particle explosions, scroll position drives shader uniforms, and everything runs at 60fps without React re-renders.

## Features

- 🎬 **Overhead Projector Engine**: Scroll-synced spotlight shader with animated oil-on-glass effects
- 💥 **Particle Explosions**: Instanced particle system with physics-based movement
- 🫧 **Interactive Bubbles**: Vertex shader wobble effects with hover states
- ⚡ **Zero React Re-renders**: All animations run in `requestAnimationFrame` loops
- 🎨 **Errl Color Language**: Cyan/magenta palette with edge glows and chromatic aberration
- 📊 **Performance Monitoring**: Real-time FPS tracking (press `P` to toggle)
- 🎯 **Config-Driven**: Externalize content via `ERRL_CONFIG` without touching code

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### The "Red Pill" Pattern: DOM → Zustand → WebGL

Errl uses a three-layer architecture that keeps React out of the animation loop:

1. **DOM Layer**: HTML buttons emit events to zustand stores
2. **Store Layer**: Zustand holds interaction state (hover, clicks, scroll)
3. **WebGL Layer**: Three.js components read stores directly in `useFrame` loops

This pattern ensures:
- ✅ Zero React re-renders during animations
- ✅ Smooth 60fps performance
- ✅ Perfect sync between DOM and WebGL

### Core Components

#### `ErrlPage`
Main entry point that orchestrates all layers:
- `ProjectorRig`: Scroll-synced shader background
- `InstancedBubbleSystem`: Optimized bubble rendering
- `ExplosionSystem`: Particle burst effects
- `ErrlContentLayout`: HTML narrative content

#### `ProjectorRig`
The overhead projector shader:
- Scroll position drives `uScrollProgress` uniform
- Animated oil noise creates fluid effects
- Section-based light intensity interpolation
- Edge glows and chromatic aberration

#### `InstancedBubbleSystem`
Single `InstancedMesh` for all bubbles:
- Per-instance attributes for position and hover strength
- Vertex shader wobble on hover
- Fragment shader with Errl colors and glows
- Conditional updates (only when state changes)

#### `ExplosionSystem`
Particle pool for click explosions:
- 50 particles in single draw call
- Physics: velocity, drag, lifetime
- 2D→3D coordinate mapping from click position
- Color variation (cyan/magenta palette)

## Configuration

All content is externalized in `src/content/errl-config.ts`:

```typescript
export const ERRL_CONFIG = {
  meta: {
    title: "Errl | The Fluid Entity",
    primaryColor: "#00ffff", // Cyan
    secondaryColor: "#ff00ff", // Magenta
  },
  hero: {
    headline: "I AM ERRL.",
    subhead: "Born on the overhead projector. Living in the browser.",
  },
  navigationBubbles: [
    { id: 'nav-1', label: 'Origin', action: 'scroll', target: '#origin' },
    // ...
  ],
  sections: [
    {
      id: 'origin',
      layout: 'center',
      title: "The Flat Surface",
      text: "I began as a smear of oil and light...",
      lightIntensity: 0.8, // Controls projector brightness
    },
    // ...
  ],
};
```

### Section Layouts

- `'center'`: Centered text block
- `'split-left'`: Text aligned left
- `'split-right'`: Text aligned right

### Navigation Actions

- `'scroll'`: Smooth scroll to section
- `'link'`: Open URL in new tab
- `'modal'`: Trigger modal (customize in `BubbleButton`)

## Keyboard Shortcuts

- **`P`**: Toggle performance monitor

## Performance

### Optimizations

- **Instanced Rendering**: All bubbles use single `InstancedMesh`
- **Conditional Updates**: Uniforms only update when values change
- **Cached Calculations**: Aspect ratio cached until viewport changes
- **Efficient Stores**: Zustand with direct state access in `useFrame`

### Monitoring

Press `P` to view:
- **FPS**: Real-time frame rate (color-coded)
- **Frame Time**: Average milliseconds per frame

Target: **60fps** (16.67ms per frame)

## Stores

### `useErrlInteractions`
Manages bubble interactions:
```typescript
{
  hoveredBubbleId: string | null;
  lastPopEvent: PopEvent | null;
  setHoveredBubble: (id: string | null) => void;
  triggerPop: (id: string, x: number, y: number) => void;
}
```

### `useScrollStore`
Controls programmatic scrolling:
```typescript
{
  scrollToSection: (sectionId: string) => void;
  setScrollToSection: (fn: Function) => void;
}
```

### `useHypnoStore`
Legacy store for trigger button (from prototype):
```typescript
{
  isHovered: boolean;
  setHovered: (hovered: boolean) => void;
}
```

## Customization

### Adding New Sections

1. Add section to `ERRL_CONFIG.sections`:
```typescript
{
  id: 'my-section',
  layout: 'center',
  title: "My Title",
  text: "My content...",
  lightIntensity: 0.7,
}
```

2. Add navigation bubble (optional):
```typescript
{
  id: 'nav-my-section',
  label: 'My Section',
  action: 'scroll',
  target: '#my-section',
}
```

### Modifying Shaders

Shaders are embedded in component files:
- `ProjectorRig.tsx`: Overhead projector shader
- `InstancedBubbleSystem.tsx`: Bubble wobble shader

Edit the `vertexShader` and `fragmentShader` strings directly.

### Changing Colors

Update `ERRL_CONFIG.meta`:
```typescript
meta: {
  primaryColor: "#00ffff",   // Main color (cyan)
  secondaryColor: "#ff00ff", // Accent color (magenta)
}
```

## Project Structure

```
src/
├── components/
│   ├── ErrlPage.tsx              # Main orchestrator
│   ├── ProjectorRig.tsx           # Overhead projector shader
│   ├── InstancedBubbleSystem.tsx  # Optimized bubbles
│   ├── ExplosionSystem.tsx        # Particle effects
│   ├── BubbleButton.tsx           # DOM button component
│   ├── ErrlContentLayout.tsx     # HTML content layout
│   ├── ScrollController.tsx       # Scroll navigation
│   ├── BubblePositionSync.tsx    # DOM→WebGL position sync
│   ├── PerformanceMonitor.tsx     # FPS tracking
│   └── ErrorBoundary.tsx          # Error handling
├── content/
│   └── errl-config.ts             # Content configuration
├── store/
│   ├── useErrlInteractions.ts     # Bubble interactions
│   ├── useScrollStore.ts          # Scroll control
│   └── useHypnoStore.ts          # Legacy trigger
└── shaders/
    ├── vertexShader.glsl          # Base vertex shader
    └── fragmentShader.glsl       # Base fragment shader
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Requires WebGL 2.0 support.

## Performance Tips

1. **Limit Particle Count**: Default is 50 particles per explosion
2. **Reduce Bubble Count**: Fewer bubbles = better performance
3. **Monitor FPS**: Use `P` key to track performance
4. **Disable Effects**: Comment out shader effects if needed

## Troubleshooting

### Low FPS
- Check performance monitor (`P` key)
- Reduce particle count in `ExplosionSystem`
- Simplify shader effects

### Bubbles Not Aligned
- `BubblePositionSync` should handle this automatically
- Check browser console for errors
- Verify `data-bubble-id` attributes on buttons

### Scroll Not Working
- Ensure `ScrollController` is inside `ScrollControls`
- Check section IDs match navigation targets
- Verify `ERRL_CONFIG.sections` is properly configured

## Documentation

- [INDEX.md](INDEX.md) - Workspace index
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - Current status
- [Documentation Index](docs/index.md) - Detailed docs with links to all documentation

### Component Documentation

- [ERRL Notes](ERRL_NOTES.md) - Errl component notes
- [Usage Guide](USAGE.md) - Component usage guide
- [Notes](NOTES.md) - Additional notes

### Technical Documentation

- [Architecture](docs/architecture.md) - Technical architecture and design
- [Project Structure](docs/project-structure.md) - File organization and structure

## License

Private project - All rights reserved

## Credits

Built with:
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Drei](https://github.com/pmndrs/drei)
- [Zustand](https://github.com/pmndrs/zustand)
- [Three.js](https://threejs.org/)
- [Vite](https://vitejs.dev/)

---

**I AM ERRL.** *The fluid entity running at 60fps.*




