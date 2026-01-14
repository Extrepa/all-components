# Quick Reference Guide

## Type Definitions

### Core Types
```typescript
type NodeId = string;
type Point = { x: number; y: number };
type Color = { r: number; g: number; b: number; a: number };
type ToolType = 'SELECT' | 'FRAME' | 'RECTANGLE' | 'TEXT' | 'PEN' | 'HAND' | 'LINE' | 'ELLIPSE' | 'POLYGON' | 'STAR' | 'ARROW' | 'SLICE' | 'SECTION' | 'SCALE' | 'PENCIL' | 'COMMENT';
```

### Node Types
```typescript
interface BaseNode {
  id: NodeId;
  name: string;
  parent: NodeId | null;
  x: number;
  y: number;
  rotation: number;
  visible: boolean;
  locked: boolean;
  constraints?: {
    horizontal: 'left' | 'center' | 'right' | 'left-right' | 'scale';
    vertical: 'top' | 'center' | 'bottom' | 'top-bottom' | 'scale';
  };
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion';
}

interface FrameNode extends BaseNode {
  type: 'FRAME' | 'COMPONENT';
  width: number;
  height: number;
  fill: Color;
  children: NodeId[];
  cornerRadius: number;
  layoutMode: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  itemSpacing: number;
  padding: number;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
  flexWrap?: 'wrap' | 'nowrap';
  margin?: number | { top: number; right: number; bottom: number; left: number };
  clipContent?: boolean;
  overflow?: 'visible' | 'hidden' | 'scroll';
  borderColor?: Color;
  borderWidth?: number | { top: number; right: number; bottom: number; left: number };
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  boxShadow?: string;
  opacity?: number;
  backgroundImage?: string;
  backgroundGradient?: string;
}

interface RectangleNode extends BaseNode {
  type: 'RECTANGLE';
  width: number;
  height: number;
  fill: Color;
  cornerRadius: number;
  borderColor?: Color;
  borderWidth?: number | { top: number; right: number; bottom: number; left: number };
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  boxShadow?: string;
  opacity?: number;
  backgroundImage?: string;
  backgroundGradient?: string;
}

interface TextNode extends BaseNode {
  type: 'TEXT';
  content: string;
  fontSize: number;
  fill: Color;
  fontFamily?: string;
  fontWeight?: string;
  lineHeight?: number | string;
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: string;
  opacity?: number;
  boxShadow?: string;
}

interface VectorNode extends BaseNode {
  type: 'VECTOR';
  width: number;
  height: number;
  points: Point[];
  stroke: Color;
  strokeWidth: number;
  strokeAlign?: 'inside' | 'center' | 'outside';
  strokeCap?: 'round' | 'square' | 'flat';
  strokeJoin?: 'miter' | 'round' | 'bevel';
  strokeDashArray?: number[];
  fill?: Color;
}

interface ImageNode extends BaseNode {
  type: 'IMAGE';
  width: number;
  height: number;
  src: string;
  opacity: number;
  imageFillMode?: 'fill' | 'fit' | 'crop' | 'tile';
  imageFills?: Array<{ type: 'image'; src: string; scaleMode: 'fill' | 'fit' | 'crop' | 'tile' }>;
}

interface InstanceNode extends BaseNode {
  type: 'INSTANCE';
  masterComponentId: NodeId;
  width: number;
  height: number;
  overrides: Record<string, any>;
}

interface CommentNode extends BaseNode {
  type: 'COMMENT';
  width: number;
  height: number;
  text: string;
  author?: string;
  resolved?: boolean;
}

type SceneNode = FrameNode | RectangleNode | TextNode | VectorNode | InstanceNode | ImageNode | CommentNode;
```

### State Types
```typescript
interface DesignState {
  nodes: Record<NodeId, SceneNode>;
  rootIds: NodeId[];
  selection: NodeId[];
  viewport: { x: number; y: number; zoom: number };
  mode: 'DESIGN' | 'DEV';
  projectName?: string;
  snapToGrid: boolean;
  gridSize: number;
}

interface HistoryState {
  past: DesignState[];
  present: DesignState;
  future: DesignState[];
}
```

## Utility Functions

### Color Utilities
```typescript
createColor(r: number, g: number, b: number, a: 1): Color
toHex(c: Color): string
hexToColor(hex: string): Color
colorToCss(c: Color): string
```

### ID Generation
```typescript
generateId(): string  // Returns: "node-{random}"
```

### Coordinate Transforms
```typescript
screenToWorld(sx: number, sy: number): Point
getAbsolutePosition(nodeId: string, nodes: Record<string, SceneNode>): Point
```

### Layout
```typescript
calculateLayout(nodeId: string, nodes: Record<string, SceneNode>): Record<string, SceneNode>
```

### Code Generation
```typescript
generateCSS(node: SceneNode): string
generateReact(node: SceneNode): string
```

## Common Patterns

### Update Node Property
```typescript
const id = state.selection[0];
setState(p => ({
  ...p,
  nodes: {
    ...p.nodes,
    [id]: { ...p.nodes[id], property: newValue } as SceneNode
  }
}));
```

### Create New Node
```typescript
const newId = generateId();
const newNode: RectangleNode = {
  id: newId,
  type: 'RECTANGLE',
  name: 'New Rectangle',
  parent: null,
  x: 100,
  y: 100,
  width: 200,
  height: 100,
  rotation: 0,
  visible: true,
  locked: false,
  fill: createColor(255, 0, 0, 1),
  cornerRadius: 0
};

const newState = {
  ...state,
  nodes: { ...state.nodes, [newId]: newNode },
  rootIds: [...state.rootIds, newId],
  selection: [newId]
};
pushToHistory(newState);
```

### Delete Node
```typescript
const deleteNode = (id: NodeId) => {
  const node = state.nodes[id];
  const newNodes = { ...state.nodes };
  delete newNodes[id];
  
  // Remove from parent's children
  if (node.parent) {
    const parent = newNodes[node.parent] as FrameNode;
    newNodes[node.parent] = {
      ...parent,
      children: parent.children.filter(cid => cid !== id)
    } as FrameNode;
  }
  
  // Remove from rootIds if root
  const newRootIds = state.rootIds.filter(rid => rid !== id);
  
  const newState = {
    ...state,
    nodes: newNodes,
    rootIds: newRootIds,
    selection: state.selection.filter(sid => sid !== id)
  };
  pushToHistory(newState);
};
```

### Hit Testing
```typescript
const hitTest = (worldX: number, worldY: number): NodeId | null => {
  return [...state.rootIds].reverse().find(id => {
    const n = state.nodes[id];
    const w = (n as any).width || 0;
    const h = (n as any).height || 20;
    return worldX >= n.x && world.x <= n.x + w &&
           worldY >= n.y && world.y <= n.y + h;
  }) || null;
};
```

### Render Node
```typescript
const drawNode = (id: string, absX: number, absY: number) => {
  const node = state.nodes[id];
  if (!node || !node.visible) return;
  
  const x = absX + node.x;
  const y = absY + node.y;
  
  // Render based on type
  if (node.type === 'RECTANGLE') {
    const r = node as RectangleNode;
    ctx.fillStyle = colorToCss(r.fill);
    ctx.fillRect(x, y, r.width, r.height);
  }
  // ... other types
  
  // Render children if frame
  if (node.type === 'FRAME' || node.type === 'COMPONENT') {
    const frame = node as FrameNode;
    frame.children.forEach(childId => drawNode(childId, x, y));
  }
};
```

## Canvas Rendering

### Setup
```typescript
const canvas = canvasRef.current;
const ctx = canvas.getContext('2d');
const dpr = window.devicePixelRatio || 1;

canvas.width = clientWidth * dpr;
canvas.height = clientHeight * dpr;
canvas.style.width = `${clientWidth}px`;
canvas.style.height = `${clientHeight}px`;

ctx.scale(dpr, dpr);
```

### Apply Viewport Transform
```typescript
ctx.translate(state.viewport.x, state.viewport.y);
ctx.scale(state.viewport.zoom, state.viewport.zoom);
```

### Draw Rounded Rectangle
```typescript
ctx.beginPath();
ctx.roundRect(x, y, width, height, radius);
ctx.fill();
```

## State Management

### Update State (No History)
```typescript
setState(prev => ({ ...prev, property: newValue }));
```

### Commit to History
```typescript
pushToHistory(newState);
```

### Undo/Redo
```typescript
undo();
redo();
```

## Event Handlers

### Pointer Events
```typescript
onPointerDown={handlePointerDown}
onPointerMove={handlePointerMove}
onPointerUp={handlePointerUp}
```

### Get World Coordinates
```typescript
const rect = containerRef.current!.getBoundingClientRect();
const world = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
```

## Keyboard Shortcuts

### Tools
| Action | Shortcut |
|--------|----------|
| Select Tool | `V` |
| Frame Tool | `F` |
| Rectangle Tool | `R` |
| Text Tool | `T` |
| Pen Tool | `P` |
| Hand Tool | `H` |
| Scale Tool | `K` |
| Line Tool | `L` |
| Arrow Tool | `⇧L` |
| Ellipse Tool | `O` |
| Section Tool | `⇧S` |
| Slice Tool | `S` |
| Pencil Tool | `⇧P` |

### Edit Operations
| Action | Shortcut |
|--------|----------|
| Undo | `Ctrl+Z` / `Cmd+Z` |
| Redo | `Ctrl+Y` / `Cmd+Y` / `Ctrl+Shift+Z` |
| Copy | `Ctrl+C` / `Cmd+C` |
| Paste | `Ctrl+V` / `Cmd+V` |
| Duplicate | `Ctrl+D` / `Cmd+D` |
| Delete | `Delete` / `Backspace` |
| Group | `Ctrl+G` / `Cmd+G` |
| Ungroup | `Ctrl+Shift+G` / `Cmd+Shift+G` |

### Navigation
| Action | Shortcut |
|--------|----------|
| Pan | `Space + Drag` / Middle Mouse Button |
| Zoom | `Ctrl + Scroll` / `Cmd + Scroll` |
| Zoom In | `Ctrl++` / `Cmd++` |
| Zoom Out | `Ctrl+-` / `Cmd+-` |
| Zoom to Fit | `Shift+1` |
| Zoom to Selection | `Shift+2` |
| Zoom to 100% | `Ctrl+0` / `Cmd+0` |

## Color Values

### Common Colors
```typescript
createColor(255, 255, 255, 1)  // White
createColor(0, 0, 0, 1)         // Black
createColor(59, 130, 246, 1)    // Blue
createColor(34, 197, 94, 1)     // Green
createColor(239, 68, 68, 1)     // Red
```

## Layout Modes

```typescript
'NONE'        // Manual positioning
'HORIZONTAL'  // Row layout (flex-direction: row)
'VERTICAL'    // Column layout (flex-direction: column)
```

## Node Type Checks

```typescript
// Type guard
if (node.type === 'FRAME') {
  const frame = node as FrameNode;
  // frame.children is available
}

// Property check
if ('width' in node) {
  const width = (node as any).width;
}

// Multiple types
if (['FRAME', 'COMPONENT'].includes(node.type)) {
  // Handle frame/component
}
```

## Common Gotchas

1. **Always use `screenToWorld`** for input coordinates
2. **Calculate absolute positions** for nested nodes
3. **Never mutate state directly** - always use immutable updates
4. **Commit to history** only on "commit" actions (mouse up, blur)
5. **Check for null/undefined** before accessing properties
6. **Handle DPI scaling** for canvas rendering
7. **Reverse rootIds** for hit testing (top-most first)

## Performance Tips

- Use `useCallback` for render functions
- Use `useMemo` for expensive calculations
- Debounce rapid updates
- Cache image loading
- Limit history size
- Use spatial indexing for large scenes

## Debug Helpers

```typescript
// Log state
console.log('State:', state);

// Log selection
console.log('Selection:', state.selection);

// Log viewport
console.log('Viewport:', state.viewport);

// Log node
console.log('Node:', state.nodes[id]);

// Visual debug - draw bounds
ctx.strokeStyle = 'red';
ctx.strokeRect(x, y, width, height);
```

