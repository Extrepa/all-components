# Troubleshooting Guide

## Common Issues & Solutions

### Canvas Not Rendering

**Symptoms**: Blank canvas, no elements visible

**Possible Causes**:
1. Canvas ref not attached
2. Canvas context is null
3. Viewport transform issues
4. Nodes array is empty

**Solutions**:
```typescript
// Check canvas ref
const canvas = canvasRef.current;
if (!canvas) {
  console.error('Canvas ref not attached');
  return;
}

// Check context
const ctx = canvas.getContext('2d');
if (!ctx) {
  console.error('Canvas context is null');
  return;
}

// Check state
console.log('Root IDs:', state.rootIds);
console.log('Nodes:', Object.keys(state.nodes));
```

### Elements Render in Wrong Position

**Symptoms**: Nodes appear offset from where they should be

**Possible Causes**:
1. Mixing screen and world coordinates
2. Forgetting to apply parent offsets
3. Viewport transform not applied correctly

**Solutions**:
```typescript
// Always use screenToWorld for input
const world = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);

// Always calculate absolute position for nested nodes
const absPos = getAbsolutePosition(nodeId, state.nodes);

// Ensure viewport transform is applied
ctx.translate(state.viewport.x, state.viewport.y);
ctx.scale(state.viewport.zoom, state.viewport.zoom);
```

### Auto-Layout Not Working

**Symptoms**: Children not repositioning, parent size not updating

**Possible Causes**:
1. `layoutMode` is 'NONE'
2. `calculateLayout` not being called
3. Children not in `frame.children` array
4. Layout calculation happening before state update

**Solutions**:
```typescript
// Verify layout mode
console.log('Layout mode:', frame.layoutMode);

// Ensure calculateLayout is called in pushToHistory
const pushToHistory = (newState: DesignState) => {
  let calculatedNodes = { ...newState.nodes };
  Object.keys(calculatedNodes).forEach(id => {
    const node = calculatedNodes[id];
    if ((node.type === 'FRAME' || node.type === 'COMPONENT') && 
        (node as FrameNode).layoutMode !== 'NONE') {
      calculatedNodes = calculateLayout(id, calculatedNodes);
    }
  });
  // ...
};

// Verify children array
console.log('Frame children:', frame.children);
```

### Undo/Redo Not Working

**Symptoms**: Undo button does nothing, state doesn't revert

**Possible Causes**:
1. History not being pushed
2. Past array is empty
3. State mutations breaking history

**Solutions**:
```typescript
// Check history state
console.log('Past length:', history.past.length);
console.log('Future length:', history.future.length);

// Ensure pushToHistory is called on commits
// Only commit on mouse up, not every move
const handlePointerUp = () => {
  if (interaction?.type === 'DRAG') {
    pushToHistory(state); // ✅ Commit here
  }
  setInteraction(null);
};

// Never mutate state directly
// ❌ Bad
state.nodes[id].x = newX;

// ✅ Good
setState(p => ({
  ...p,
  nodes: { ...p.nodes, [id]: { ...p.nodes[id], x: newX } }
}));
```

### Selection Not Working

**Symptoms**: Can't select nodes, selection doesn't highlight

**Possible Causes**:
1. Hit testing logic incorrect
2. Selection state not updating
3. Rendering not showing selection

**Solutions**:
```typescript
// Debug hit testing
const hitId = [...state.rootIds].reverse().find(id => {
  const n = state.nodes[id];
  const w = (n as any).width || 0;
  const h = (n as any).height || 20;
  const hit = world.x >= n.x && world.x <= n.x + w && 
              world.y >= n.y && world.y <= n.y + h;
  if (hit) console.log('Hit:', id, n);
  return hit;
});

// Check selection state
console.log('Selection:', state.selection);

// Verify selection rendering
if (state.selection.includes(id)) {
  ctx.strokeStyle = '#00a8ff';
  ctx.strokeRect(x, y, width, height);
}
```

### Performance Issues

**Symptoms**: Laggy interactions, low FPS, stuttering

**Possible Causes**:
1. Re-rendering on every state change
2. Expensive calculations in render loop
3. Too many nodes
4. Canvas not optimized

**Solutions**:
```typescript
// Use useCallback for render function
const renderScene = useCallback(() => {
  // ... rendering logic
}, [state, hoveredId]); // Only dependencies that affect rendering

// Memoize expensive calculations
const layoutNodes = useMemo(() => {
  return calculateAllLayouts(state.nodes);
}, [state.nodes]);

// Debounce rapid updates
const debouncedUpdate = useMemo(
  () => debounce((newState: DesignState) => {
    pushToHistory(newState);
  }, 100),
  []
);

// Limit canvas size
const maxCanvasSize = 4096; // Some browsers limit canvas size
if (width > maxCanvasSize || height > maxCanvasSize) {
  // Scale down or split into multiple canvases
}
```

### Code Generation Issues

**Symptoms**: Generated CSS/React is incorrect or incomplete

**Possible Causes**:
1. Missing properties in generation
2. Type assertions failing
3. Auto-layout not accounted for

**Solutions**:
```typescript
// Check node type before generation
if (node.type === 'FRAME' || node.type === 'COMPONENT') {
  const frame = node as FrameNode;
  if (frame.layoutMode !== 'NONE') {
    // Generate flexbox CSS
  } else {
    // Generate absolute positioning
  }
}

// Include all relevant properties
const generateCSS = (node: SceneNode): string => {
  let css = `/* ${node.name} */\n`;
  
  // Position
  css += `position: absolute;\n`;
  css += `left: ${node.x}px;\n`;
  css += `top: ${node.y}px;\n`;
  
  // Size
  if ('width' in node) css += `width: ${node.width}px;\n`;
  if ('height' in node) css += `height: ${node.height}px;\n`;
  
  // Visual properties
  if ('fill' in node) {
    css += `background-color: ${colorToCss(node.fill)};\n`;
  }
  
  return css;
};
```

### Image Not Loading

**Symptoms**: Image placeholder shows but image doesn't render

**Possible Causes**:
1. Image not loaded when drawing
2. CORS issues
3. Invalid image source

**Solutions**:
```typescript
// Wait for image to load
const img = new Image();
img.onload = () => {
  ctx.drawImage(img, x, y, width, height);
  renderScene(); // Re-render after load
};
img.src = (props as ImageNode).src;

// Handle errors
img.onerror = () => {
  console.error('Failed to load image:', img.src);
  // Draw placeholder
  ctx.fillStyle = '#333';
  ctx.fillRect(x, y, width, height);
};
```

### Zoom/Pan Issues

**Symptoms**: Zoom doesn't work, panning is jittery

**Possible Causes**:
1. Viewport state not updating
2. Transform not applied correctly
3. Event handlers conflicting

**Solutions**:
```typescript
// Ensure viewport updates are batched
const handleWheel = (e: WheelEvent) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? 0.9 : 1.1;
  setState(p => ({
    ...p,
    viewport: {
      ...p.viewport,
      zoom: Math.max(0.1, Math.min(5, p.viewport.zoom * delta))
    }
  }));
};

// Apply transform in correct order
ctx.save();
ctx.translate(state.viewport.x, state.viewport.y);
ctx.scale(state.viewport.zoom, state.viewport.zoom);
// ... draw
ctx.restore();
```

### TypeScript Errors

**Common Type Errors**:

1. **Property does not exist on type**
```typescript
// ❌ Error
const width = node.width;

// ✅ Fix - Type guard or assertion
if ('width' in node) {
  const width = node.width;
}
// OR
const width = (node as RectangleNode).width;
```

2. **Type 'X' is not assignable to type 'Y'**
```typescript
// ❌ Error
const node: SceneNode = { type: 'RECTANGLE', ... };

// ✅ Fix - Use proper type
const node: RectangleNode = { type: 'RECTANGLE', ... };
```

3. **Object is possibly 'undefined'**
```typescript
// ❌ Error
const parent = nodes[node.parent];

// ✅ Fix - Null check
const parent = node.parent ? nodes[node.parent] : null;
if (!parent) return;
```

## Debugging Tools

### React DevTools
- Inspect component state
- Profile performance
- Check hook dependencies

### Chrome DevTools
- Canvas inspector (right-click canvas → Inspect)
- Performance profiler
- Memory profiler

### Console Debugging
```typescript
// Add debug flag
const DEBUG = true;

if (DEBUG) {
  console.log('State:', state);
  console.log('Selection:', state.selection);
  console.log('Viewport:', state.viewport);
}
```

## Getting Help

1. **Check the console** for errors
2. **Verify state structure** matches expected format
3. **Test in isolation** - create minimal reproduction
4. **Check coordinate transforms** - most issues are coordinate-related
5. **Verify history commits** - ensure state is being saved correctly

## Performance Checklist

- [ ] Using `useCallback` for render functions
- [ ] Using `useMemo` for expensive calculations
- [ ] Debouncing rapid updates
- [ ] Limiting canvas size
- [ ] Avoiding unnecessary re-renders
- [ ] Optimizing hit testing (spatial indexing for large scenes)

