# Development Guidelines

## Code Style & Conventions

### TypeScript Standards

- **Always use explicit types** for function parameters and return values
- **Prefer interfaces over types** for object shapes (except for unions/intersections)
- **Use `NodeId` type alias** instead of `string` for node identifiers
- **Avoid `any`** - use type assertions or `unknown` when necessary

```typescript
// ✅ Good
const getNode = (id: NodeId): SceneNode | undefined => {
  return nodes[id];
};

// ❌ Bad
const getNode = (id: string): any => {
  return nodes[id];
};
```

### Naming Conventions

- **Components**: PascalCase (`FrameNode`, `TextNode`)
- **Functions**: camelCase (`calculateLayout`, `screenToWorld`)
- **Constants**: UPPER_SNAKE_CASE (`INITIAL_STATE`)
- **IDs**: kebab-case with prefix (`frame-1`, `text-head`, `btn-1`)
- **State variables**: descriptive names (`activeTool`, `hoveredId`, `interaction`)

### File Organization

- **Single Responsibility**: Each function should do one thing
- **Pure Functions First**: Prefer pure functions over side effects
- **Utility Functions**: Group related utilities together (e.g., color utilities, coordinate transforms)

## State Management Patterns

### Normalized State Structure

Always maintain a flat, normalized state structure:

```typescript
// ✅ Good - Normalized
interface DesignState {
  nodes: Record<NodeId, SceneNode>;  // O(1) lookup
  rootIds: NodeId[];                 // Hierarchy order
  selection: NodeId[];
}

// ❌ Bad - Nested
interface BadState {
  root: {
    children: {
      children: SceneNode[]
    }[]
  }
}
```

### State Updates

- **Immutable Updates**: Always create new objects/arrays, never mutate
- **Batch Updates**: Group related state changes in a single `setState` call
- **History Commit**: Only push to history on "commit" actions (mouse up, blur, etc.)

```typescript
// ✅ Good - Immutable
setState(prev => ({
  ...prev,
  nodes: {
    ...prev.nodes,
    [id]: { ...prev.nodes[id], x: newX, y: newY }
  }
}));

// ❌ Bad - Mutation
state.nodes[id].x = newX;
```

## Rendering Best Practices

### Canvas Rendering

- **Use `useCallback`** for render functions to prevent unnecessary re-renders
- **Check canvas context** before drawing operations
- **Handle DPI scaling** for high-resolution displays
- **Clear and redraw** on every frame (don't try to optimize by only drawing changes)

```typescript
const renderScene = useCallback(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Handle DPI
  const dpr = window.devicePixelRatio || 1;
  // ... rendering logic
}, [state, hoveredId]);
```

### Performance Considerations

- **Avoid inline functions** in render loops
- **Memoize expensive calculations** (use `useMemo`)
- **Debounce rapid updates** (e.g., during drag operations)
- **Limit re-renders** by splitting state into separate concerns

## Coordinate System

### Screen vs World Space

Always use the `screenToWorld` and `worldToScreen` helpers:

```typescript
// Convert screen coordinates to world coordinates
const world = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);

// Never mix coordinate systems
// ❌ Bad: Using screen coordinates directly in world space
node.x = e.clientX;
```

### Absolute Position Calculation

When dealing with nested nodes, always calculate absolute positions:

```typescript
const getAbsolutePosition = (nodeId: string, nodes: Record<string, SceneNode>): Point => {
  // Traverse up the parent chain
  let x = node.x;
  let y = node.y;
  let current = node;
  while (current.parent) {
    const parent = nodes[current.parent];
    if (!parent) break;
    x += parent.x;
    y += parent.y;
    current = parent;
  }
  return { x, y };
};
```

## Component System

### Master/Instance Pattern

- **Master Components**: Store the source of truth
- **Instances**: Reference master via `masterComponentId`
- **Overrides**: Apply instance-specific changes without breaking inheritance

```typescript
// Rendering an instance
if (props.type === 'INSTANCE') {
  const master = state.nodes[(props as InstanceNode).masterComponentId];
  if (master) {
    // Render master's children with instance's position/size
    (master as FrameNode).children.forEach(c => drawNode(c, x, y));
  }
}
```

## Auto-Layout Engine

### Layout Calculation Rules

1. **Only calculate for Frames/Components** with `layoutMode !== 'NONE'`
2. **Recalculate on every change** to children or layout properties
3. **Respect padding and itemSpacing**
4. **Update parent dimensions** based on content

```typescript
const calculateLayout = (nodeId: string, nodes: Record<string, SceneNode>) => {
  const node = nodes[nodeId];
  if (!node || (node.type !== 'FRAME' && node.type !== 'COMPONENT')) return nodes;
  const frame = node as FrameNode;
  if (frame.layoutMode === 'NONE') return nodes;
  
  // Calculate positions and update parent size
  // ...
};
```

## History Management

### When to Commit

- **Mouse Up** after drag operations
- **Blur** after text input changes
- **Explicit Save** actions
- **NOT** on every mouse move or keystroke

### History Structure

```typescript
interface HistoryState {
  past: DesignState[];    // Previous states (for undo)
  present: DesignState;   // Current state
  future: DesignState[];  // Redone states (for redo)
}
```

## Error Handling

### Defensive Programming

- **Null checks** before accessing node properties
- **Type guards** when narrowing union types
- **Fallback values** for missing data

```typescript
// ✅ Good - Defensive
const node = nodes[id];
if (!node || !node.visible) return;
const width = (node as any).width || 0;

// ❌ Bad - Assumes existence
const width = nodes[id].width;
```

## Testing Considerations

### Testable Functions

- **Pure functions** are easiest to test
- **Extract business logic** from React components
- **Mock canvas context** for rendering tests

### Key Functions to Test

- `calculateLayout` - Auto-layout engine
- `screenToWorld` / `worldToScreen` - Coordinate transforms
- `generateCSS` / `generateReact` - Code generation
- `getAbsolutePosition` - Hierarchy traversal

## Code Generation

### CSS Generation

- **Use absolute positioning** for non-layout nodes
- **Use flexbox** for auto-layout frames
- **Include all visual properties** (colors, borders, etc.)

### React Generation

- **Generate semantic JSX** (div, p, etc.)
- **Include style objects** with proper formatting
- **Preserve class names** for styling hooks

## Common Pitfalls

1. **Mutating State**: Always use immutable updates
2. **Mixing Coordinates**: Don't use screen coords in world space
3. **Forgetting DPI**: Always scale canvas for high-DPI displays
4. **Skipping History**: Remember to commit state changes
5. **Nested Updates**: Calculate absolute positions for nested nodes
6. **Type Assertions**: Use proper type guards instead of `as any`

## Code Review Checklist

- [ ] Types are explicit and correct
- [ ] State updates are immutable
- [ ] Coordinate transforms are used correctly
- [ ] History is committed at appropriate times
- [ ] Null checks are present
- [ ] Performance considerations are addressed
- [ ] Code follows naming conventions
- [ ] Comments explain "why" not "what"

