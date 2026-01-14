# Performance Guide

## Canvas Rendering Optimization

### High DPI Display Handling

Always account for device pixel ratio to ensure crisp rendering:

```typescript
const dpr = window.devicePixelRatio || 1;
const { clientWidth, clientHeight } = containerRef.current;

// Set actual canvas size (backing store)
canvas.width = clientWidth * dpr;
canvas.height = clientHeight * dpr;

// Set display size (CSS pixels)
canvas.style.width = `${clientWidth}px`;
canvas.style.height = `${clientHeight}px`;

// Scale context to match
ctx.scale(dpr, dpr);
```

**Why**: Without this, canvas appears blurry on Retina/4K displays.

### Render Loop Optimization

```typescript
// ✅ Good - Memoized render function
const renderScene = useCallback(() => {
  // ... rendering logic
}, [state, hoveredId]); // Only re-render when these change

// ❌ Bad - Recreated on every render
const renderScene = () => {
  // ... rendering logic
};
```

**Best Practice**: Only include dependencies that actually affect rendering.

### Selective Rendering

For large scenes, consider culling off-screen elements:

```typescript
const isVisible = (node: SceneNode, viewport: Viewport): boolean => {
  const absPos = getAbsolutePosition(node.id, nodes);
  const width = (node as any).width || 0;
  const height = (node as any).height || 0;
  
  // Calculate screen bounds
  const screenX = (absPos.x * viewport.zoom) + viewport.x;
  const screenY = (absPos.y * viewport.zoom) + viewport.y;
  const screenW = width * viewport.zoom;
  const screenH = height * viewport.zoom;
  
  // Check if intersects viewport
  return !(screenX + screenW < 0 || 
           screenX > canvasWidth ||
           screenY + screenH < 0 || 
           screenY > canvasHeight);
};

// Only render visible nodes
if (isVisible(node, state.viewport)) {
  drawNode(id, absX, absY);
}
```

## State Management Performance

### Immutable Updates Pattern

```typescript
// ✅ Good - Single update, minimal object creation
setState(prev => ({
  ...prev,
  nodes: {
    ...prev.nodes,
    [id]: { ...prev.nodes[id], x: newX, y: newY }
  }
}));

// ❌ Bad - Multiple updates, causes multiple re-renders
setState(prev => ({ ...prev, nodes: { ...prev.nodes, [id]: { ...prev.nodes[id], x: newX } } }));
setState(prev => ({ ...prev, nodes: { ...prev.nodes, [id]: { ...prev.nodes[id], y: newY } } }));
```

### Batch Updates

Group related state changes:

```typescript
// ✅ Good - Single state update
setState(prev => ({
  ...prev,
  nodes: {
    ...prev.nodes,
    [id1]: { ...prev.nodes[id1], x: x1, y: y1 },
    [id2]: { ...prev.nodes[id2], x: x2, y: y2 }
  },
  selection: [id1, id2]
}));

// ❌ Bad - Multiple updates
setState(prev => ({ ...prev, nodes: { ...prev.nodes, [id1]: {...} } }));
setState(prev => ({ ...prev, nodes: { ...prev.nodes, [id2]: {...} } }));
setState(prev => ({ ...prev, selection: [id1, id2] }));
```

### History Management

Limit history size to prevent memory issues:

```typescript
const MAX_HISTORY_SIZE = 50;

const pushToHistory = (newState: DesignState) => {
  setHistory(prev => {
    const past = [...prev.past, prev.present];
    // Limit history size
    const trimmedPast = past.slice(-MAX_HISTORY_SIZE);
    
    return {
      past: trimmedPast,
      present: newState,
      future: []
    };
  });
};
```

## Event Handling Performance

### Debouncing Rapid Updates

For operations that fire frequently (e.g., drag, resize):

```typescript
import { debounce } from 'lodash';

const debouncedCommit = useMemo(
  () => debounce((state: DesignState) => {
    pushToHistory(state);
  }, 100),
  []
);

// During drag
const handlePointerMove = (e: React.PointerEvent) => {
  // Update state immediately (for smooth interaction)
  setState(prev => ({ ...prev, nodes: { ...prev.nodes, [id]: updatedNode } }));
  
  // Debounce history commit
  debouncedCommit(state);
};
```

### Throttling Render Updates

For very frequent state changes:

```typescript
import { throttle } from 'lodash';

const throttledRender = useMemo(
  () => throttle(() => {
    renderScene();
  }, 16), // ~60fps
  []
);
```

### Event Handler Optimization

```typescript
// ✅ Good - Memoized handlers
const handlePointerDown = useCallback((e: React.PointerEvent) => {
  // ... handler logic
}, [state, activeTool]);

// ❌ Bad - Recreated on every render
const handlePointerDown = (e: React.PointerEvent) => {
  // ... handler logic
};
```

## Hit Testing Optimization

### Spatial Indexing

For scenes with many nodes, use spatial indexing:

```typescript
// Build spatial index (update when nodes change)
const spatialIndex = useMemo(() => {
  const index = new Map<string, NodeId[]>();
  
  Object.values(state.nodes).forEach(node => {
    const absPos = getAbsolutePosition(node.id, state.nodes);
    const width = (node as any).width || 0;
    const height = (node as any).height || 0;
    
    // Divide space into grid cells
    const cellX = Math.floor(absPos.x / 100);
    const cellY = Math.floor(absPos.y / 100);
    const key = `${cellX},${cellY}`;
    
    if (!index.has(key)) index.set(key, []);
    index.get(key)!.push(node.id);
  });
  
  return index;
}, [state.nodes]);

// Fast hit test using index
const hitTest = (worldX: number, worldY: number): NodeId | null => {
  const cellX = Math.floor(worldX / 100);
  const cellY = Math.floor(worldY / 100);
  const key = `${cellX},${cellY}`;
  
  const candidates = spatialIndex.get(key) || [];
  
  // Only check nodes in nearby cells
  return candidates.reverse().find(id => {
    const node = state.nodes[id];
    const w = (node as any).width || 0;
    const h = (node as any).height || 0;
    return worldX >= node.x && worldX <= node.x + w &&
           worldY >= node.y && worldY <= node.y + h;
  }) || null;
};
```

### Early Exit Strategies

```typescript
// Check visibility first
if (!node.visible) return;

// Check bounds before detailed hit test
const absPos = getAbsolutePosition(node.id, nodes);
if (worldX < absPos.x || worldX > absPos.x + width ||
    worldY < absPos.y || worldY > absPos.y + height) {
  return; // Early exit
}
```

## Memory Management

### Image Caching

Cache loaded images to avoid reloading:

```typescript
const imageCache = new Map<string, HTMLImageElement>();

const getImage = (src: string): Promise<HTMLImageElement> => {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!);
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
};
```

### Cleanup Unused Resources

```typescript
useEffect(() => {
  return () => {
    // Cleanup on unmount
    imageCache.clear();
    // Cancel pending operations
    debouncedCommit.cancel();
  };
}, []);
```

## Auto-Layout Performance

### Incremental Layout Calculation

Only recalculate affected layouts:

```typescript
const calculateLayout = (
  nodeId: string, 
  nodes: Record<string, SceneNode>,
  affectedIds: Set<NodeId> = new Set()
): Record<string, SceneNode> => {
  const node = nodes[nodeId];
  if (!node || (node.type !== 'FRAME' && node.type !== 'COMPONENT')) {
    return nodes;
  }
  
  const frame = node as FrameNode;
  if (frame.layoutMode === 'NONE') return nodes;
  
  // Only recalculate if this frame or its children were affected
  const needsRecalc = affectedIds.has(nodeId) || 
                      frame.children.some(id => affectedIds.has(id));
  
  if (!needsRecalc) return nodes;
  
  // ... layout calculation
  
  // Mark parent as affected
  if (frame.parent) {
    affectedIds.add(frame.parent);
  }
  
  return newNodes;
};
```

### Layout Caching

Cache layout results until dependencies change:

```typescript
const layoutCache = new Map<NodeId, { 
  nodes: Record<string, SceneNode>, 
  hash: string 
}>();

const getLayoutHash = (frame: FrameNode, children: SceneNode[]): string => {
  return `${frame.layoutMode}-${frame.itemSpacing}-${frame.padding}-` +
         `${children.map(c => `${c.id}-${c.width}-${c.height}`).join('-')}`;
};

const calculateLayout = (nodeId: string, nodes: Record<string, SceneNode>) => {
  const frame = nodes[nodeId] as FrameNode;
  const children = frame.children.map(id => nodes[id]);
  const hash = getLayoutHash(frame, children);
  
  const cached = layoutCache.get(nodeId);
  if (cached && cached.hash === hash) {
    return cached.nodes; // Return cached result
  }
  
  // Calculate and cache
  const result = performLayout(nodeId, nodes);
  layoutCache.set(nodeId, { nodes: result, hash });
  return result;
};
```

## Code Generation Performance

### Lazy Code Generation

Only generate code when needed (e.g., when Dev Mode is active):

```typescript
const generatedCode = useMemo(() => {
  if (state.mode !== 'DEV' || state.selection.length === 0) {
    return null;
  }
  
  const node = state.nodes[state.selection[0]];
  return {
    css: generateCSS(node),
    react: generateReact(node)
  };
}, [state.mode, state.selection, state.nodes]);
```

## Measurement & Profiling

### Performance Monitoring

```typescript
const renderScene = useCallback(() => {
  const start = performance.now();
  
  // ... rendering logic
  
  const end = performance.now();
  if (end - start > 16) { // > 16ms = < 60fps
    console.warn('Slow render:', end - start, 'ms');
  }
}, [state, hoveredId]);
```

### React Profiler

Use React DevTools Profiler to identify:
- Components that re-render unnecessarily
- Expensive renders
- Hook dependency issues

### Canvas Profiling

Use Chrome DevTools Performance tab:
1. Record a session
2. Look for long paint operations
3. Identify expensive draw calls
4. Optimize based on findings

## Best Practices Summary

1. **Memoize expensive calculations** with `useMemo`
2. **Use `useCallback`** for event handlers and render functions
3. **Batch state updates** to minimize re-renders
4. **Debounce/throttle** rapid updates
5. **Cache expensive operations** (images, layouts)
6. **Limit history size** to prevent memory issues
7. **Use spatial indexing** for large scenes
8. **Cull off-screen elements** when rendering
9. **Profile regularly** to identify bottlenecks
10. **Optimize incrementally** - measure before and after

## Performance Targets

- **60 FPS** during interactions (pan, zoom, drag)
- **< 100ms** initial render for scenes with < 1000 nodes
- **< 16ms** per frame for smooth animations
- **< 50MB** memory usage for typical designs
- **< 1s** code generation for single node

## When to Optimize

Don't optimize prematurely. Optimize when:
- Users report performance issues
- Profiling shows bottlenecks
- Adding features causes slowdown
- Memory usage is excessive
- Frame rate drops below 30 FPS

