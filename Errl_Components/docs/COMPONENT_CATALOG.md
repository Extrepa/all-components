# Errl_Components Catalog

**Date:** 2026-01-10  
**Status:** Complete  
**Total Components:** 13

## Overview

Errl_Components is a high-performance, WebGL-powered component library that syncs DOM interactions with GPU shaders in real-time. Components use the "Red Pill" Pattern: DOM → Zustand → WebGL.

## Component Index

1. [ErrlPage](#errlpage) - Main orchestrator component
2. [ProjectorRig](#projectorrig) - Overhead projector shader background
3. [InstancedBubbleSystem](#instancedbubblesystem) - Optimized bubble rendering
4. [ExplosionSystem](#explosionsystem) - Particle burst effects
5. [ErrlContentLayout](#errlcontentlayout) - HTML narrative content wrapper
6. [BubbleButton](#bubblebutton) - Interactive navigation button
7. [BubbleMesh](#bubblemesh) - Individual bubble mesh component
8. [BubblePositionSync](#bubblepositionsync) - DOM-to-WebGL position sync
9. [ScrollController](#scrollcontroller) - Scroll position controller
10. [PerformanceMonitor](#performancemonitor) - FPS and performance tracking
11. [TrippyScene](#trippyscene) - Trippy visual effects scene
12. [TriggerButton](#triggerbutton) - Trigger button component
13. [ErrorBoundary](#errorboundary) - React error boundary

---

## Components

### ErrlPage

**File:** `src/components/ErrlPage.tsx`  
**Type:** Main Orchestrator  
**Purpose:** Main component that orchestrates all Errl components

**Props:**
- None (uses ERRL_CONFIG from content)

**Usage:**
```tsx
import { ErrlPage } from '@errl/components';

function App() {
  return <ErrlPage />;
}
```

**Features:**
- Integrates ProjectorRig, InstancedBubbleSystem, ExplosionSystem
- Manages ErrlContentLayout
- Handles scroll synchronization
- Coordinates all Errl effects

**Dependencies:**
- @react-three/fiber
- @react-three/drei
- Internal components

---

### ProjectorRig

**File:** `src/components/ProjectorRig.tsx`  
**Type:** WebGL Shader Component  
**Purpose:** Overhead projector shader background with scroll-synced effects

**Props:**
- None (reads from stores)

**Usage:**
```tsx
import { ProjectorRig } from '@errl/components';

<ProjectorRig />
```

**Features:**
- Scroll position drives `uScrollProgress` uniform
- Animated oil noise creates fluid effects
- Section-based light intensity interpolation
- Edge glows and chromatic aberration
- Errl color palette (cyan/magenta)

**Shader Uniforms:**
- `uScrollProgress` - Scroll position (0-1)
- `uTime` - Animation time
- `uIntensity` - Light intensity per section

---

### InstancedBubbleSystem

**File:** `src/components/InstancedBubbleSystem.tsx`  
**Type:** WebGL Performance Component  
**Purpose:** Optimized bubble rendering using instanced meshes

**Props:**
```typescript
interface InstancedBubbleSystemProps {
  bubbles: BubbleInstance[];
}
```

**Usage:**
```tsx
import { InstancedBubbleSystem } from '@errl/components';

<InstancedBubbleSystem bubbles={bubbleInstances} />
```

**Features:**
- Single `InstancedMesh` for all bubbles
- Per-instance attributes for position and hover strength
- Vertex shader wobble on hover
- Fragment shader with Errl colors and glows
- High performance (renders many bubbles efficiently)

**Performance:**
- Renders hundreds of bubbles at 60fps
- Uses GPU instancing for efficiency

---

### ExplosionSystem

**File:** `src/components/ExplosionSystem.tsx`  
**Type:** Particle System Component  
**Purpose:** Particle burst effects triggered by interactions

**Props:**
- None (reads from interaction store)

**Usage:**
```tsx
import { ExplosionSystem } from '@errl/components';

<ExplosionSystem />
```

**Features:**
- Physics-based particle movement
- Triggered by bubble interactions
- Errl color palette particles
- Smooth animations

**Interactions:**
- Listens to `triggerPop` events from Zustand store
- Creates particle bursts at interaction points

---

### ErrlContentLayout

**File:** `src/components/ErrlContentLayout.tsx`  
**Type:** Layout Component  
**Purpose:** HTML narrative content wrapper

**Props:**
- None (uses ERRL_CONFIG content)

**Usage:**
```tsx
import { ErrlContentLayout } from '@errl/components';

<ErrlContentLayout />
```

**Features:**
- Renders HTML content sections
- Scroll-synced with WebGL effects
- Errl styling and typography

---

### BubbleButton

**File:** `src/components/BubbleButton.tsx`  
**Type:** DOM Component  
**Purpose:** Interactive navigation button with WebGL sync

**Props:**
```typescript
interface BubbleButtonProps {
  bubble: BubbleNav;
  children?: React.ReactNode;
}
```

**Usage:**
```tsx
import { BubbleButton } from '@errl/components';

<BubbleButton bubble={bubbleConfig}>
  Button Text
</BubbleButton>
```

**Features:**
- Emits pop events to Zustand store
- Handles scroll navigation
- Handles link navigation
- Handles modal opening (planned)
- Syncs with WebGL bubble effects

**Actions:**
- `scroll` - Scrolls to section
- `link` - Opens link in new tab
- `modal` - Opens modal (planned)

---

### BubbleMesh

**File:** `src/components/BubbleMesh.tsx`  
**Type:** WebGL Mesh Component  
**Purpose:** Individual bubble mesh with hover effects

**Props:**
```typescript
interface BubbleMeshProps {
  id: string;
  position: [number, number, number];
  radius?: number; // Default: 0.3
}
```

**Usage:**
```tsx
import { BubbleMesh } from '@errl/components';

<BubbleMesh 
  id="bubble-1" 
  position={[0, 0, 0.1]} 
  radius={0.3} 
/>
```

**Features:**
- Vertex shader wobble on hover
- Fragment shader with Errl colors
- Position sync with DOM buttons
- Hover state from Zustand store

---

### BubblePositionSync

**File:** `src/components/BubblePositionSync.tsx`  
**Type:** Sync Component  
**Purpose:** Syncs DOM button positions to WebGL bubble positions

**Props:**
```typescript
interface BubblePositionSyncProps {
  onPositionsUpdate: (positions: Map<string, [number, number, number]>) => void;
}
```

**Usage:**
```tsx
import { BubblePositionSync } from '@errl/components';

<BubblePositionSync onPositionsUpdate={handlePositionsUpdate} />
```

**Features:**
- Reads DOM button positions
- Converts to WebGL coordinates
- Updates bubble positions in real-time
- Handles viewport changes

---

### ScrollController

**File:** `src/components/ScrollController.tsx`  
**Type:** Controller Component  
**Purpose:** Controls scroll position and syncs with WebGL

**Props:**
- None (uses ScrollControls from drei)

**Usage:**
```tsx
import { ScrollController } from '@errl/components';

<ScrollController />
```

**Features:**
- Integrates with @react-three/drei ScrollControls
- Syncs scroll with WebGL shaders
- Manages scroll progress

**Note:** This is a controller component, no render output.

---

### PerformanceMonitor

**File:** `src/components/PerformanceMonitor.tsx`  
**Type:** Utility Component  
**Purpose:** Real-time FPS and performance tracking

**Props:**
- None

**Usage:**
```tsx
import { PerformanceMonitor } from '@errl/components';

<PerformanceMonitor />
```

**Features:**
- Displays FPS counter
- Toggle with 'P' key
- Performance metrics
- Debug information

**Controls:**
- Press 'P' to toggle display

---

### TrippyScene

**File:** `src/components/TrippyScene.tsx`  
**Type:** Scene Component  
**Purpose:** Trippy visual effects scene

**Props:**
- None

**Usage:**
```tsx
import { TrippyScene } from '@errl/components';

<TrippyScene />
```

**Features:**
- Trippy visual effects
- Animated shaders
- Errl color palette

---

### TriggerButton

**File:** `src/components/TriggerButton.tsx`  
**Type:** DOM Component  
**Purpose:** Trigger button for interactions

**Props:**
- None (uses default configuration)

**Usage:**
```tsx
import { TriggerButton } from '@errl/components';

<TriggerButton />
```

**Features:**
- Triggers interactions
- Syncs with WebGL effects

---

### ErrorBoundary

**File:** `src/components/ErrorBoundary.tsx`  
**Type:** Error Handling Component  
**Purpose:** React error boundary for graceful error handling

**Props:**
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

**Usage:**
```tsx
import { ErrorBoundary } from '@errl/components';

<ErrorBoundary fallback={<ErrorFallback />}>
  <ErrlPage />
</ErrorBoundary>
```

**Features:**
- Catches React errors
- Displays fallback UI
- Prevents app crashes

---

## Component Categories

### Core Components
- **ErrlPage** - Main orchestrator
- **ErrlContentLayout** - Content wrapper

### WebGL Components
- **ProjectorRig** - Shader background
- **InstancedBubbleSystem** - Bubble rendering
- **BubbleMesh** - Individual bubbles
- **ExplosionSystem** - Particle effects
- **TrippyScene** - Visual effects

### DOM Components
- **BubbleButton** - Navigation buttons
- **TriggerButton** - Trigger buttons

### Utility Components
- **BubblePositionSync** - Position synchronization
- **ScrollController** - Scroll control
- **PerformanceMonitor** - Performance tracking
- **ErrorBoundary** - Error handling

---

## Usage Patterns

### Basic Usage

```tsx
import { ErrlPage } from '@errl/components';

function App() {
  return <ErrlPage />;
}
```

### Custom Configuration

```tsx
import { ErrlPage, ProjectorRig, InstancedBubbleSystem } from '@errl/components';

function CustomErrlApp() {
  return (
    <Canvas>
      <ProjectorRig />
      <InstancedBubbleSystem bubbles={customBubbles} />
    </Canvas>
  );
}
```

### With Error Boundary

```tsx
import { ErrlPage, ErrorBoundary } from '@errl/components';

function App() {
  return (
    <ErrorBoundary fallback={<div>Error loading Errl</div>}>
      <ErrlPage />
    </ErrorBoundary>
  );
}
```

---

## Architecture Notes

### Red Pill Pattern

All components follow the DOM → Zustand → WebGL pattern:
1. DOM events trigger Zustand store updates
2. WebGL components read from stores in `useFrame` loops
3. Zero React re-renders during animations

### Performance

- Instanced rendering for bubbles
- GPU-accelerated shaders
- 60fps target
- Optimized for many simultaneous effects

### Color Palette

- Cyan (#00ffff) - Primary
- Magenta (#ff00ff) - Secondary
- Edge glows and chromatic aberration
- Consistent across all components

---

## Dependencies

### Required
- React (^18.0.0 || ^19.0.0)
- @react-three/fiber (^9.4.0)
- @react-three/drei (^10.7.7)
- three (peer dependency)
- zustand (for state management)

### Internal
- ERRL_CONFIG (content configuration)
- Zustand stores (useErrlInteractions, useScrollStore)

---

## Examples

See the main README.md for complete usage examples and architecture details.

---

## Notes

- All components are designed for high performance
- Components sync DOM and WebGL seamlessly
- Errl color palette is consistent throughout
- Components are composable and reusable
