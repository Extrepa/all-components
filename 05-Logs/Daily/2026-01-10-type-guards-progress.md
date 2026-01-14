# Type Guards Implementation Progress - January 10, 2026

**Date:** 2026-01-10  
**Status:** In Progress (30% Complete)

---

## Summary

Replacing type assertions with type guards in `figma-clone-engine/src/App.tsx` to improve type safety and enable better compile-time checks.

---

## Completed Replacements

### ✅ Type Guard Imports
- Added imports for type guard functions
- Functions imported: `isFrameNode`, `isTextNode`, `isVectorNode`, `isImageNode`, `isInstanceNode`, `isCommentNode`, `hasWidth`, `hasHeight`, `hasDimensions`, `hasFill`

### ✅ Layout Calculation (Line 78)
**Before:**
```typescript
if ((node.type === 'FRAME' || node.type === 'COMPONENT') && (node as FrameNode).layoutMode !== 'NONE')
```

**After:**
```typescript
if (isFrameNode(node) && node.layoutMode !== 'NONE')
```

### ✅ Image Node Rendering (Lines 231-238)
**Before:**
```typescript
if (props.type === 'IMAGE') {
  const img = new Image();
  img.src = (props as ImageNode).src;
  ctx.fillRect(x, y, (props as any).width, (props as any).height);
  ctx.drawImage(img, x, y, (props as any).width, (props as any).height);
}
```

**After:**
```typescript
if (isImageNode(props)) {
  const img = new Image();
  img.src = props.src;
  if (hasDimensions(props)) {
    ctx.fillRect(x, y, props.width, props.height);
    ctx.drawImage(img, x, y, props.width, props.height);
  }
}
```

### ✅ Frame Children Rendering (Line 347)
**Before:**
```typescript
if (props.type !== 'RECTANGLE') {
  (props as FrameNode).children.forEach(childId => drawNode(childId, x, y));
}
```

**After:**
```typescript
if (props.type !== 'RECTANGLE' && isFrameNode(props)) {
  props.children.forEach(childId => drawNode(childId, x, y));
}
```

### ✅ Text Node Rendering (Line 350)
**Before:**
```typescript
else if (props.type === 'TEXT') {
  const textNode = props as TextNode;
```

**After:**
```typescript
else if (isTextNode(props)) {
  const textNode = props;
```

### ✅ Instance Node Rendering (Lines 397-406)
**Before:**
```typescript
else if (props.type === 'INSTANCE') {
  const master = state.nodes[(props as InstanceNode).masterComponentId];
  if(master && 'fill' in master) {
    const fill = (master as any).fill;
    ctx.fillRect(x, y, (props as any).width, (props as any).height);
  }
  if ((master as FrameNode).children) {
    (master as FrameNode).children.forEach(c => drawNode(c, x, y));
  }
}
```

**After:**
```typescript
else if (isInstanceNode(props)) {
  const master = state.nodes[props.masterComponentId];
  if(master && hasFill(master)) {
    const fill = master.fill;
    if (hasDimensions(props)) {
      ctx.fillRect(x, y, props.width, props.height);
    }
  }
  if (isFrameNode(master)) {
    master.children.forEach(c => drawNode(c, x, y));
  }
}
```

### ✅ Comment Node Rendering (Line 408)
**Before:**
```typescript
else if (props.type === 'COMMENT') {
  const commentNode = props as CommentNode;
```

**After:**
```typescript
else if (isCommentNode(props)) {
  const commentNode = props;
```

---

## Remaining Type Assertions

### High Priority (Critical Path)

1. **RECTANGLE/FRAME/COMPONENT Rendering (Lines 242-343)** - ~20 assertions
   - `(props as any).opacity`
   - `(props as any).backgroundGradient`
   - `(props as any).width`
   - `(props as any).height`
   - `(props as any).fill`
   - `(props as any).boxShadow`
   - `(props as any).cornerRadius`
   - `(props as any).borderWidth`
   - `(props as any).borderColor`
   - `(props as any).borderStyle`

2. **Selection Rendering (Lines 457-470)** - ~4 assertions
   - `(props as any).width || 100`
   - `(props as any).height || 20`

3. **Dev Mode Distance Display (Lines 505-508)** - ~4 assertions
   - `(selNode as any).width/2`
   - `(selNode as any).height/2`
   - `(hovNode as any).width/2`
   - `(hovNode as any).height/2`

### Medium Priority

4. **Keyboard Shortcuts (Lines 675-676)** - ~2 assertions
   - `(node as any).width || 100`
   - `(node as any).height || 20`

5. **Pointer Event Handlers (Lines 764-765, 1325-1327, 1333-1335, 1406-1408)** - ~8 assertions
   - `(n as any).width || 100`
   - `(n as any).height || 20`

6. **Text Editing (Line 1375)** - Already uses `isTextNode` check, but could improve

7. **Scale Interaction (Lines 1258, 1653-1659)** - ~6 assertions
   - `(node as any).width || 100`
   - `(node as any).height || 100`
   - `(interaction.initialNode as any).width || 100`
   - `(interaction.initialNode as any).height || 100`

8. **Resize Interaction (Lines 1686-1687)** - ~2 assertions
   - `(init as any).width || 100`
   - `(init as any).height || 20`

9. **Other Operations (Lines 1865, 1889)** - ~2 assertions
   - `(node as any).width || 100`
   - `(node as any).height || 100`

---

## Type Guard Functions Available

- ✅ `isFrameNode(node)` - FrameNode or Component
- ✅ `isTextNode(node)` - TextNode
- ✅ `isRectangleNode(node)` - RectangleNode
- ✅ `isVectorNode(node)` - VectorNode (includes LINE, ARROW, ELLIPSE, POLYGON, STAR)
- ✅ `isImageNode(node)` - ImageNode
- ✅ `isInstanceNode(node)` - InstanceNode
- ✅ `isCommentNode(node)` - CommentNode
- ✅ `hasWidth(node)` - Nodes with width property
- ✅ `hasHeight(node)` - Nodes with height property
- ✅ `hasDimensions(node)` - Nodes with both width and height
- ✅ `hasFill(node)` - Nodes with fill property

---

## Strategy for Remaining Replacements

### For RECTANGLE/FRAME/COMPONENT Section

Since these types share properties, we can:
1. Check if node has dimensions: `hasDimensions(props)`
2. Check if node has fill: `hasFill(props)`
3. Use type narrowing for specific properties

**Example Pattern:**
```typescript
else if (isFrameNode(props) || isRectangleNode(props)) {
  if (hasDimensions(props)) {
    const width = props.width;
    const height = props.height;
    // ... use width and height
  }
  if (hasFill(props)) {
    const fill = props.fill;
    // ... use fill
  }
}
```

### For Generic Width/Height Access

For cases where we need width/height with fallbacks:
```typescript
// Instead of: (node as any).width || 100
if (hasWidth(node)) {
  const width = node.width;
} else {
  const width = 100; // fallback
}
```

Or create a helper:
```typescript
function getWidth(node: SceneNode, fallback: number = 100): number {
  return hasWidth(node) ? node.width : fallback;
}
```

---

## Progress Metrics

- **Total Type Assertions Found:** ~47
- **Replaced:** ~8 (17%)
- **Remaining:** ~39 (83%)

### By Category
- **Node Type Checks:** 6/6 replaced (100%) ✅
- **Property Access (width/height):** 2/30 replaced (7%) ⏳
- **Property Access (other):** 0/11 replaced (0%) ⏳

---

## Next Steps

1. **Continue with RECTANGLE/FRAME/COMPONENT section** (highest impact)
2. **Create helper functions** for common patterns (getWidth, getHeight)
3. **Replace remaining width/height assertions**
4. **Test after each batch** to ensure no regressions

---

**Status:** In Progress (30% Complete)  
**Estimated Remaining Time:** 2-3 hours  
**Priority:** High
