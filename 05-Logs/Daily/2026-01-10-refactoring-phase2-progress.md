# Refactoring Phase 2 Progress - January 10, 2026

**Date:** 2026-01-10  
**Phase:** Phase 2 - Extract Interaction Handlers  
**Status:** 🚧 In Progress (Helpers extracted, ~20% complete)

---

## Summary

Started Phase 2 of the App.tsx refactoring plan. Extracted interaction helper functions to a separate utility file. This is the foundation for extracting the larger interaction handlers.

---

## Completed Work

### ✅ Created New Files

1. **`src/utils/interactionHelpers.ts`** (~120 lines)
   - `findParentFrameAtPoint` - Find top-most frame at a point
   - `findNodeAtPoint` - Find top-most node at a point
   - `isPointInNode` - Check if point is within node bounds
   - `getResizeHandleBounds` - Calculate resize handle positions
   - `findResizeHandle` - Find which resize handle was clicked

### ✅ Updated Files

1. **`src/App.tsx`**
   - Removed `findParentFrameAtPoint` function (~12 lines)
   - Replaced inline hit detection with `findNodeAtPoint` (~4 instances)
   - Replaced inline resize handle detection with `findResizeHandle` (~1 instance)
   - Updated all `findParentFrameAtPoint` calls to use imported function (8 instances)

---

## Line Count Reduction

### Before
- **App.tsx:** 1,997 lines

### After
- **App.tsx:** 1,955 lines
- **interactionHelpers.ts:** ~120 lines (new)

### Net Reduction
- **App.tsx reduced by:** ~42 lines
- **Code reorganized:** Hit detection logic now reusable

---

## Integration Details

### Helper Functions Extraction

**Before:**
```typescript
const findParentFrameAtPoint = (x: number, y: number): FrameNode | null => {
  // Check all frames in reverse order (top-most first)
  for (const id of [...state.rootIds].reverse()) {
    const node = state.nodes[id];
    if (isFrameNode(node)) {
      const absPos = getAbsolutePosition(id, state.nodes);
      if (x >= absPos.x && x <= absPos.x + node.width &&
          y >= absPos.y && y <= absPos.y + node.height) {
        return node;
      }
    }
  }
  return null;
};

// Inline hit detection repeated multiple times:
const hitId = [...state.rootIds].reverse().find(id => {
  const n = state.nodes[id];
  const w = hasWidth(n) ? n.width : 100;
  const h = hasHeight(n) ? n.height : 20;
  return world.x >= n.x && world.x <= n.x + w && world.y >= n.y && world.y <= n.y + h;
});

// Inline resize handle detection:
const handles = [
  { x: absPos.x - hs/2, y: absPos.y - hs/2, type: 'nw' },
  // ... 7 more handles
];
const clickedHandle = handles.find(h => 
  world.x >= h.x && world.x <= h.x + hs &&
  world.y >= h.y && world.y <= h.y + hs
);
```

**After:**
```typescript
import { findParentFrameAtPoint, findNodeAtPoint, findResizeHandle } from './utils/interactionHelpers';

// Reusable helper functions:
const parentFrame = findParentFrameAtPoint(world.x, world.y, state);
const hitId = findNodeAtPoint(world.x, world.y, state);
const clickedHandle = findResizeHandle({ x: world.x, y: world.y }, hitId, state, state.viewport.zoom);
```

---

## Benefits Achieved

### 1. Code Reusability ✅
- Hit detection logic now reusable across the codebase
- Resize handle detection standardized
- Parent frame finding centralized

### 2. Maintainability ✅
- Easier to update hit detection logic in one place
- Clear separation of concerns
- Better testability

### 3. Type Safety ✅
- All helper functions properly typed
- Uses existing type guards
- No type assertions introduced

---

## Remaining Work for Phase 2

### High Priority
- [ ] Extract tool creation logic (~400 lines)
  - FRAME, RECTANGLE, TEXT, LINE, ELLIPSE, POLYGON, STAR, SECTION, SLICE, COMMENT tools
  - Create `useToolHandlers` hook
- [ ] Extract `handlePointerDown` (~600 lines)
  - Tool-specific handling
  - Selection logic
  - Interaction setup
- [ ] Extract `handlePointerMove` (~330 lines)
  - Interaction updates
  - Shape creation updates
  - Drag/resize/scale updates
- [ ] Extract `handlePointerUp` (~20 lines)
  - Interaction cleanup
  - History push
  - Tool switching

### Medium Priority
- [ ] Create `useInteraction` hook to coordinate all handlers
- [ ] Extract eyedropper tool logic
- [ ] Extract dev mode hit detection

---

## Files Created/Modified

### Created
- ✅ `src/utils/interactionHelpers.ts` - Interaction helper functions

### Modified
- ✅ `src/App.tsx` - Use imported helper functions

---

## Next Steps

1. **Extract Tool Creation Logic** (~400 lines)
   - Create `useToolHandlers.ts` hook
   - Extract all tool creation functions (FRAME, RECTANGLE, TEXT, etc.)
   - Test tool creation independently

2. **Extract Interaction Handlers** (~950 lines)
   - Create `useInteraction.ts` hook
   - Extract `handlePointerDown`, `handlePointerMove`, `handlePointerUp`
   - Coordinate with tool handlers

3. **Integration & Testing**
   - Integrate hooks into App.tsx
   - Test all interactions
   - Verify no regressions

---

### ✅ Created Tool Creator Functions

1. **`src/utils/toolCreators.ts`** (~350 lines)
   - `createFrameNode` - Create frame nodes
   - `createRectangleNode` - Create rectangle nodes
   - `createTextNode` - Create text nodes
   - `createLineNode` - Create line/arrow nodes
   - `createEllipseNode` - Create ellipse nodes
   - `createPolygonNode` - Create polygon nodes
   - `createStarNode` - Create star nodes
   - `createSectionNode` - Create section nodes
   - `createSliceNode` - Create slice nodes
   - `createCommentNode` - Create comment nodes
   - `addNodeToState` - Helper to add node to state structure

**Status:** 🚧 Phase 2 In Progress (40% complete)  
**App.tsx Size:** 1,955 lines (down from 2,362, 17% reduction overall)  
**Next:** Refactor App.tsx to use tool creator functions, then extract interaction handlers
