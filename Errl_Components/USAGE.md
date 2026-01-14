# Errl Components - Usage Guide

## Basic Usage

### Minimal Setup

```tsx
import { ErrlPage } from './components/ErrlPage';

function App() {
  return <ErrlPage />;
}
```

That's it! `ErrlPage` includes everything: projector, bubbles, explosions, and content.

## Customizing Content

### Edit Configuration

Open `src/content/errl-config.ts`:

```typescript
export const ERRL_CONFIG = {
  meta: {
    title: "Your Title",
    primaryColor: "#00ffff",
    secondaryColor: "#ff00ff",
  },
  hero: {
    headline: "YOUR HEADLINE",
    subhead: "Your subheadline text",
  },
  navigationBubbles: [
    {
      id: 'nav-1',
      label: 'About',
      action: 'scroll',
      target: '#about',
    },
  ],
  sections: [
    {
      id: 'about',
      layout: 'center',
      title: "About Section",
      text: "Your content here...",
      lightIntensity: 0.8,
    },
  ],
};
```

## Advanced Usage

### Using Stores Directly

```tsx
import { useErrlInteractions } from './store/useErrlInteractions';

function MyComponent() {
  const { hoveredBubbleId, triggerPop } = useErrlInteractions();
  
  const handleClick = () => {
    triggerPop('my-id', 100, 200); // x, y coordinates
  };
  
  return (
    <button onClick={handleClick}>
      {hoveredBubbleId ? 'Hovered!' : 'Not hovered'}
    </button>
  );
}
```

### Programmatic Scrolling

```tsx
import { useScrollStore } from './store/useScrollStore';

function MyComponent() {
  const scrollToSection = useScrollStore((state) => state.scrollToSection);
  
  return (
    <button onClick={() => scrollToSection('my-section')}>
      Go to Section
    </button>
  );
}
```

### Custom Bubble Component

```tsx
import { BubbleButton } from './components/BubbleButton';
import { ERRL_CONFIG } from './content/errl-config';

function CustomNav() {
  return (
    <nav>
      {ERRL_CONFIG.navigationBubbles.map((bubble) => (
        <BubbleButton key={bubble.id} bubble={bubble} />
      ))}
    </nav>
  );
}
```

### Standalone Components

#### Projector Only

```tsx
import { Canvas } from '@react-three/fiber';
import { ScrollControls } from '@react-three/drei';
import { ProjectorRig } from './components/ProjectorRig';

function ProjectorOnly() {
  return (
    <Canvas>
      <ScrollControls pages={4}>
        <ProjectorRig />
      </ScrollControls>
    </Canvas>
  );
}
```

#### Bubbles Only

```tsx
import { Canvas } from '@react-three/fiber';
import { InstancedBubbleSystem } from './components/InstancedBubbleSystem';

const bubbles = [
  { id: 'bubble-1', position: [0, 0, 0] },
  { id: 'bubble-2', position: [1, 1, 0] },
];

function BubblesOnly() {
  return (
    <Canvas>
      <InstancedBubbleSystem bubbles={bubbles} />
    </Canvas>
  );
}
```

#### Explosions Only

```tsx
import { Canvas } from '@react-three/fiber';
import { ExplosionSystem } from './components/ExplosionSystem';

function ExplosionsOnly() {
  return (
    <Canvas>
      <ExplosionSystem />
    </Canvas>
  );
}
```

## Styling

### Custom Button Styles

The `BubbleButton` uses inline styles. To customize:

```tsx
<BubbleButton 
  bubble={bubble}
  style={{
    // Your custom styles
    background: 'rgba(255, 0, 0, 0.5)',
    borderRadius: '20px',
  }}
/>
```

Note: You'll need to modify `BubbleButton.tsx` to accept a `style` prop.

### Content Layout Styles

Edit `ErrlContentLayout.tsx` to customize:
- Hero section styling
- Section layouts
- Typography
- Spacing

## Performance Tuning

### Reduce Particle Count

In `ExplosionSystem.tsx`:

```typescript
const PARTICLE_COUNT = 25; // Default is 50
```

### Adjust Bubble Complexity

In `InstancedBubbleSystem.tsx`, reduce geometry segments:

```typescript
const segments = 16; // Default is 32
```

### Disable Effects

Comment out shader effects in `ProjectorRig.tsx`:

```glsl
// Disable chromatic aberration
// finalColor.r += chroma * uLightIntensity;
// finalColor.b -= chroma * 0.5 * uLightIntensity;
```

## Examples

### Multiple Projectors

```tsx
<Canvas>
  <ScrollControls pages={4}>
    <ProjectorRig />
    <ProjectorRig position={[5, 0, 0]} /> {/* Second projector */}
  </ScrollControls>
</Canvas>
```

### Custom Navigation

```tsx
function CustomNav() {
  const scrollToSection = useScrollStore((state) => state.scrollToSection);
  
  return (
    <div className="custom-nav">
      <button onClick={() => scrollToSection('section-1')}>
        Section 1
      </button>
      <button onClick={() => scrollToSection('section-2')}>
        Section 2
      </button>
    </div>
  );
}
```

### Conditional Rendering

```tsx
function ConditionalErrl() {
  const [showProjector, setShowProjector] = useState(true);
  
  return (
    <>
      <button onClick={() => setShowProjector(!showProjector)}>
        Toggle Projector
      </button>
      {showProjector && <ErrlPage />}
    </>
  );
}
```

## Integration with Other Libraries

### With React Router

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ErrlPage />} />
        <Route path="/other" element={<OtherPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### With State Management

```tsx
import { useErrlInteractions } from './store/useErrlInteractions';
import { useMyStore } from './my-store';

function IntegratedComponent() {
  const { triggerPop } = useErrlInteractions();
  const { myState } = useMyStore();
  
  const handleClick = () => {
    triggerPop('id', 100, 100);
    // Your custom logic
    myState.doSomething();
  };
  
  return <button onClick={handleClick}>Click</button>;
}
```

## Troubleshooting

### Bubbles Not Showing

1. Check `ERRL_CONFIG.navigationBubbles` has entries
2. Verify `BubblePositionSync` is in the scene
3. Check browser console for errors

### Explosions Not Triggering

1. Ensure `ExplosionSystem` is in the scene
2. Check `triggerPop` is being called with correct coordinates
3. Verify `useErrlInteractions` store is connected

### Scroll Not Working

1. Ensure `ScrollController` is inside `ScrollControls`
2. Check section IDs match navigation targets
3. Verify scroll store is initialized

## Best Practices

1. **Keep Config External**: Always modify `ERRL_CONFIG`, not component code
2. **Monitor Performance**: Use `P` key to check FPS regularly
3. **Test on Mobile**: Verify touch interactions work
4. **Error Boundaries**: Wrap in `ErrorBoundary` for production
5. **Optimize Early**: Reduce particle/bubble counts if performance drops

## Next Steps

- Read [README.md](./README.md) for architecture details
- Check [ERRL_NOTES.md](./ERRL_NOTES.md) for technical deep-dive
- Explore `src/components/` for component internals
- Modify `src/content/errl-config.ts` to customize content




