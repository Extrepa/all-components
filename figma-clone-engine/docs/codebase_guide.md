# Codebase Guide

## Project Structure

```
figma-clone-engine/
├── src/
│   ├── App.tsx                    # Main application component (1949 lines)
│   ├── main.tsx                   # React entry point
│   ├── index.css                  # Global styles & Tailwind imports
│   ├── types.ts                   # Core type definitions
│   ├── components/
│   │   ├── BottomDock.tsx         # Bottom tool dock
│   │   ├── DockPopOutMenu.tsx     # Tool pop-out menus
│   │   ├── FileMenu.tsx           # File menu dropdown
│   │   ├── FloatingTopNav.tsx     # Top navigation bar
│   │   ├── InspectorPanel.tsx     # Right sidebar inspector
│   │   ├── LayersPanel.tsx        # Left sidebar layers
│   │   └── inspector/             # Inspector sub-components
│   │       ├── controls/          # Node-type specific controls
│   │       ├── hooks/             # Inspector hooks
│   │       ├── sections/          # Property sections
│   │       └── *.tsx              # Inspector components
│   ├── hooks/
│   │   └── useDesignHistory.ts    # Undo/redo history hook
│   └── utils/
│       ├── codeGeneration.ts      # CSS/React code generation
│       ├── editOperations.ts      # Copy/paste/delete operations
│       ├── fileOperations.ts      # Save/load operations
│       ├── groupOperations.ts     # Group/ungroup operations
│       ├── helpers.ts             # Utility functions
│       ├── layout.ts              # Auto-layout engine
│       ├── migration.ts           # State migration utilities
│       └── zoomOperations.ts      # Zoom utilities
├── docs/                          # Documentation
├── index.html                     # HTML entry point
├── vite.config.ts                 # Vite configuration
└── package.json                   # Dependencies & scripts
```

## Key Files

### `src/App.tsx` - The Heart of the Application

This is the main application component containing core canvas logic and orchestration. It's organized into sections:

#### 1. Imports and Type Re-exports
- Re-exports types from `types.ts` for backward compatibility

#### 2. Initial State
- `INITIAL_STATE` - Default application state with sample data

#### 3. Main Component Logic
- State management with history hook
- Canvas rendering and drawing
- Event handlers (pointer, keyboard, wheel)
- Tool interactions and node creation
- UI component orchestration

**Note**: Many utilities have been extracted to separate files in `utils/`, and UI components are in `components/`, but App.tsx still contains the core canvas rendering and interaction logic.

### `src/types.ts` - Type Definitions

All core types are defined here:
- `Point`, `Color`, `NodeId` - Primitive types
- `BaseNode` - Common node properties
- `FrameNode`, `RectangleNode`, `TextNode`, `VectorNode`, `ImageNode`, `InstanceNode`, `CommentNode` - Node types
- `SceneNode` - Union of all node types
- `DesignState` - Application state structure
- `ToolType` - Available tools (16 tool types)

### `src/utils/` - Utility Functions

- **helpers.ts**: `createColor`, `toHex`, `hexToColor`, `colorToCss`, `generateId`, etc.
- **layout.ts**: `calculateLayout` - Auto-layout engine
- **codeGeneration.ts**: `generateCSS`, `generateReact` - Code generation
- **editOperations.ts**: Copy, paste, delete, duplicate operations
- **fileOperations.ts**: Save, load, export, import operations
- **groupOperations.ts**: Group, ungroup, frame selection operations
- **zoomOperations.ts**: Zoom in, out, fit, selection operations
- **migration.ts**: State migration for backward compatibility

### `src/components/` - UI Components

- **BottomDock.tsx**: Tool dock at bottom with pop-out menus
- **FloatingTopNav.tsx**: Top navigation with mode switcher, undo/redo, save/load
- **LayersPanel.tsx**: Left sidebar with file/assets tabs, pages, and layers
- **InspectorPanel.tsx**: Right sidebar property inspector
- **inspector/**: Inspector sub-components organized by function

## Core Concepts

### 1. Normalized State Structure

The state uses a flat map structure for O(1) lookups:

```typescript
interface DesignState {
  nodes: Record<NodeId, SceneNode>;  // All nodes indexed by ID
  rootIds: NodeId[];                 // Top-level nodes (defines hierarchy)
  selection: NodeId[];               // Currently selected nodes
  viewport: { x: number; y: number; zoom: number };
  mode: 'DESIGN' | 'DEV';
  projectName?: string;              // Project/file name
  snapToGrid: boolean;               // Grid snapping enabled
  gridSize: number;                  // Grid size in pixels (default: 8)
}
```

**Why this structure?**
- Fast lookups: `nodes[id]` is O(1)
- Easy updates: Update one node without touching others
- Simple serialization: Easy to save/load as JSON

### 2. Rendering Pipeline

```
User Interaction
    ↓
Event Handler (handlePointerDown/Move/Up)
    ↓
State Update (setState)
    ↓
History Commit (pushToHistory) - on mouse up
    ↓
Auto-Layout Calculation (calculateLayout)
    ↓
Render Scene (renderScene via useEffect)
    ↓
Canvas Drawing (drawNode recursively)
```

### 3. Coordinate System

Two coordinate systems exist:

- **Screen Space**: DOM pixels (0,0 = top-left of viewport)
- **World Space**: Canvas coordinates (0,0 = origin of design)

Transformations:
- `screenToWorld(sx, sy)` - Convert screen to world
- Viewport transform: `ctx.translate(viewport.x, viewport.y); ctx.scale(zoom, zoom)`

### 4. Node Hierarchy

Nodes form a tree structure via `parent` references:

```
frame-1 (root)
  ├── text-head (parent: 'frame-1')
  ├── img-1 (parent: 'frame-1')
  └── btn-1 (parent: 'frame-1')
```

To render:
1. Start with `rootIds`
2. For each root, call `drawNode(id, 0, 0)`
3. If node has children, recursively draw them with offset

### 5. Auto-Layout System

When `layoutMode !== 'NONE'`:
- Children are positioned automatically
- Parent size is calculated from content
- `itemSpacing` controls gap between items
- `padding` controls internal spacing

Layout calculation happens:
- After state changes (in `pushToHistory`)
- Before rendering
- For all frames with auto-layout enabled

## Key Functions Reference

### State Management

```typescript
setState(updater: (prev: DesignState) => DesignState)
```
Updates current state. Does NOT commit to history.

```typescript
pushToHistory(newState: DesignState)
```
Commits state to history (triggers auto-layout, adds to undo stack).

```typescript
undo() / redo()
```
Time-travel through history.

### Coordinate Transforms

```typescript
screenToWorld(sx: number, sy: number): Point
```
Converts screen coordinates to world coordinates.

```typescript
getAbsolutePosition(nodeId: string, nodes: Record<string, SceneNode>): Point
```
Calculates absolute position of a node (including parent offsets).

### Rendering

```typescript
renderScene()
```
Main render function. Called via `useEffect` when state changes.

```typescript
drawNode(id: string, absX: number, absY: number, overrides?: Record<string, any>)
```
Recursively draws a node and its children.

### Layout

```typescript
calculateLayout(nodeId: string, nodes: Record<string, SceneNode>): Record<string, SceneNode>
```
Calculates auto-layout positions and sizes. Returns updated nodes map.

### Code Generation

```typescript
generateCSS(node: SceneNode): string
generateReact(node: SceneNode): string
```
Generate CSS/React code for selected node.

## Event Flow

### Pointer Events

1. **Pointer Down**
   - Detect tool (HAND, SELECT, etc.)
   - Hit test to find clicked node
   - Start interaction (PAN, DRAG)

2. **Pointer Move**
   - Update viewport (if PAN)
   - Update node position (if DRAG)
   - Update hover state (in DEV mode)

3. **Pointer Up**
   - Commit to history (if DRAG)
   - Clear interaction state

### Hit Testing

Hit testing finds which node is under the cursor:

```typescript
const hitId = [...state.rootIds].reverse().find(id => {
  const n = state.nodes[id];
  const w = (n as any).width || 0;
  const h = (n as any).height || 0;
  return world.x >= n.x && world.x <= n.x + w && 
         world.y >= n.y && world.y <= n.y + h;
});
```

**Note**: Reverse order ensures top-most nodes are checked first.

## Adding New Features

### Adding a New Node Type

1. **Define the interface**:
```typescript
interface CircleNode extends BaseNode {
  type: 'CIRCLE';
  radius: number;
  fill: Color;
}
```

2. **Add to union type**:
```typescript
type SceneNode = FrameNode | RectangleNode | ... | CircleNode;
```

3. **Add rendering logic**:
```typescript
else if (props.type === 'CIRCLE') {
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
  ctx.fill();
}
```

4. **Add to layers panel** (if needed):
```typescript
{n.type==='CIRCLE' && <Circle size={12}/>}
```

### Adding a New Tool

1. **Add to ToolType**:
```typescript
type ToolType = 'SELECT' | 'HAND' | ... | 'CIRCLE';
```

2. **Add tool button**:
```typescript
<button onClick={() => setActiveTool('CIRCLE')}>
  <Circle size={16}/>
</button>
```

3. **Handle tool logic** in `handlePointerDown`:
```typescript
if (activeTool === 'CIRCLE') {
  // Create circle node
}
```

### Adding a New Property

1. **Add to node interface**:
```typescript
interface RectangleNode extends BaseNode {
  // ... existing
  strokeWidth?: number;
}
```

2. **Add to inspector UI**:
```typescript
<input 
  value={node.strokeWidth || 0}
  onChange={(e) => updateNode({ strokeWidth: Number(e.target.value) })}
/>
```

3. **Add to rendering**:
```typescript
if (node.strokeWidth) {
  ctx.lineWidth = node.strokeWidth;
  ctx.stroke();
}
```

4. **Add to code generation** (if needed):
```typescript
if (node.strokeWidth) {
  css += `border-width: ${node.strokeWidth}px;\n`;
}
```

## Debugging Tips

### State Inspection

Add console logs in `setState`:
```typescript
setState(prev => {
  const next = updater(prev);
  console.log('State update:', next);
  return next;
});
```

### Rendering Debug

Add visual debug info:
```typescript
// Draw node bounds
ctx.strokeStyle = 'red';
ctx.strokeRect(x, y, width, height);

// Draw node ID
ctx.fillText(node.id, x, y - 10);
```

### Performance Profiling

Use React DevTools Profiler to identify slow renders.

Use Chrome DevTools Performance tab to profile canvas rendering.

## Common Patterns

### Updating a Node Property

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

### Creating a New Node

```typescript
const newId = generateId();
const newNode: RectangleNode = {
  id: newId,
  type: 'RECTANGLE',
  name: 'New Rectangle',
  // ... properties
};
const newState = {
  ...state,
  nodes: { ...state.nodes, [newId]: newNode },
  rootIds: [...state.rootIds, newId],
  selection: [newId]
};
pushToHistory(newState);
```

### Finding Parent Node

```typescript
const getParent = (nodeId: NodeId): SceneNode | null => {
  const node = state.nodes[nodeId];
  if (!node || !node.parent) return null;
  return state.nodes[node.parent] || null;
};
```

## Current File Organization

The codebase has been refactored from a monolithic structure. Current organization:

```
src/
├── types.ts              # ✅ Node type definitions (extracted)
├── utils/
│   ├── helpers.ts        # ✅ Color and utility functions (extracted)
│   ├── layout.ts         # ✅ Auto-layout engine (extracted)
│   ├── codeGeneration.ts # ✅ Code generation (extracted)
│   ├── editOperations.ts # ✅ Edit operations (extracted)
│   ├── fileOperations.ts # ✅ File operations (extracted)
│   ├── groupOperations.ts# ✅ Group operations (extracted)
│   ├── zoomOperations.ts # ✅ Zoom operations (extracted)
│   └── migration.ts      # ✅ Migration utilities (extracted)
├── hooks/
│   └── useDesignHistory.ts # ✅ History hook (extracted)
├── components/
│   ├── BottomDock.tsx    # ✅ Tool dock (extracted)
│   ├── FloatingTopNav.tsx# ✅ Top nav (extracted)
│   ├── LayersPanel.tsx   # ✅ Layers panel (extracted)
│   ├── InspectorPanel.tsx# ✅ Inspector panel (extracted)
│   └── inspector/        # ✅ Inspector sub-components (extracted)
└── App.tsx               # Core canvas logic (still contains rendering)

Future improvements could extract:
- Canvas rendering to separate component
- Event handlers to custom hooks
- Tool logic to separate utilities
```

The current structure provides:
- ✅ Better maintainability (separated concerns)
- ✅ Improved testability (isolated utilities)
- ✅ Code reusability (shared utilities)
- ✅ Better developer experience (clearer organization)

