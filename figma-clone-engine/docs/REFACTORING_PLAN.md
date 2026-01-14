# App.tsx Refactoring Plan

**Date:** 2026-01-10  
**File:** `src/App.tsx`  
**Current Size:** 2,362 lines  
**Target Size:** < 300 lines  
**Priority:** High

---

## Current Structure Analysis

### Line Count by Section

1. **Imports & Types** (Lines 1-27): ~27 lines
2. **Initial State** (Lines 29-58): ~30 lines
3. **State Management & Hooks** (Lines 60-104): ~45 lines
4. **Helper Functions** (Lines 105-179): ~75 lines
   - `screenToWorld`
   - `getAbsolutePosition`
   - `findParentFrameAtPoint`
   - `wrapText`
   - `handleImageUpload`
5. **Canvas Rendering** (Lines 181-520): ~340 lines
   - `renderScene` useCallback
   - Large `drawNode` function (nested)
   - Canvas setup and drawing logic
6. **Keyboard Shortcuts** (Lines 525-754): ~230 lines
   - `useEffect` with `handleKeyDown`
   - Tool shortcuts
   - Edit operations (undo/redo, copy/paste)
7. **Pointer Event Handlers** (Lines 757-1753): ~1000 lines
   - `handlePointerDown` - Tool interactions, node creation
   - `handlePointerMove` - Drag, resize, create interactions
   - `handlePointerUp` - Finish interactions
8. **Edit Operation Handlers** (Lines 1756-2037): ~280 lines
   - File operations (save, load, export, import)
   - Edit operations (copy, cut, paste, delete, duplicate)
   - Layer operations (group, ungroup, bring forward, etc.)
   - Zoom operations
   - Page operations
9. **UI Rendering** (Lines 2039-2362): ~323 lines
   - JSX return statement
   - Component orchestration

---

## Refactoring Strategy

### Goal
Split `App.tsx` into focused, maintainable components and hooks while preserving all functionality.

### Target Structure

```
src/
├── App.tsx                           # Main orchestrator (< 300 lines)
├── components/
│   ├── Canvas.tsx                    # Canvas rendering component (~400 lines)
│   ├── InteractionHandler.tsx        # Pointer event handling (~600 lines)
│   └── KeyboardHandler.tsx           # Keyboard shortcuts (~250 lines)
├── hooks/
│   ├── useCanvas.ts                  # Canvas rendering logic (~350 lines)
│   ├── useInteraction.ts             # Pointer interactions (~600 lines)
│   ├── useKeyboardShortcuts.ts       # Keyboard shortcuts (~230 lines)
│   └── useToolHandlers.ts            # Tool-specific logic (~400 lines)
└── utils/
    ├── canvasHelpers.ts              # Canvas helper functions (~100 lines)
    └── interactionHelpers.ts         # Interaction helper functions (~150 lines)
```

---

## Phase 1: Extract Canvas Rendering (Priority 1)

### Target: `src/components/Canvas.tsx` and `src/hooks/useCanvas.ts`

**Extract:**
- `renderScene` function (lines 181-520)
- `drawNode` nested function
- Canvas setup logic
- Drawing utilities

**Create:**
- `useCanvas.ts` hook - Canvas rendering logic
- `Canvas.tsx` component - Canvas wrapper component

**Benefits:**
- Separates rendering logic from component
- Easier to test canvas rendering
- Reduces App.tsx by ~340 lines

**Dependencies:**
- Requires state, viewport, hoveredId
- Uses helper functions (screenToWorld, getAbsolutePosition, wrapText)

---

## Phase 2: Extract Interaction Handlers (Priority 2)

### Target: `src/components/InteractionHandler.tsx` and `src/hooks/useInteraction.ts`

**Extract:**
- `handlePointerDown` (lines 757-1395)
- `handlePointerMove` (lines 1397-1731)
- `handlePointerUp` (lines 1733-1753)
- Tool creation logic (FRAME, RECTANGLE, TEXT, LINE, etc.)
- Drag, resize, scale interactions

**Create:**
- `useInteraction.ts` hook - Pointer interaction logic
- `InteractionHandler.tsx` component - Wrapper for interaction handling
- `useToolHandlers.ts` hook - Tool-specific creation logic

**Benefits:**
- Separates interaction logic from rendering
- Easier to test interactions
- Reduces App.tsx by ~1000 lines

**Dependencies:**
- Requires state, setState, pushToHistory, activeTool, interaction, setInteraction
- Uses helper functions (screenToWorld, getAbsolutePosition, findParentFrameAtPoint, snapToGrid)

---

## Phase 3: Extract Keyboard Shortcuts (Priority 3)

### Target: `src/components/KeyboardHandler.tsx` and `src/hooks/useKeyboardShortcuts.ts`

**Extract:**
- `useEffect` with `handleKeyDown` (lines 525-754)
- Tool shortcuts (v, f, r, t, h, p, i)
- Edit operations (undo/redo, copy/paste)
- Delete operations

**Create:**
- `useKeyboardShortcuts.ts` hook - Keyboard shortcut logic
- `KeyboardHandler.tsx` component - Keyboard event wrapper (if needed)

**Note:** May already have `@/shared/hooks/useKeyboardShortcuts` - check if it can be used

**Benefits:**
- Separates keyboard logic
- Easier to test shortcuts
- Reduces App.tsx by ~230 lines

**Dependencies:**
- Requires state, setState, undo, redo, clipboard, setClipboard
- Uses utility functions from utils/

---

## Phase 4: Extract Helper Functions (Priority 4)

### Target: `src/utils/canvasHelpers.ts` and `src/utils/interactionHelpers.ts`

**Extract:**
- `screenToWorld` → `utils/canvasHelpers.ts`
- `getAbsolutePosition` → `utils/canvasHelpers.ts`
- `findParentFrameAtPoint` → `utils/interactionHelpers.ts`
- `wrapText` → `utils/canvasHelpers.ts`
- `handleImageUpload` → `utils/fileOperations.ts` (may already exist)

**Benefits:**
- Reusable utilities
- Easier to test
- Reduces App.tsx by ~75 lines

---

## Phase 5: Consolidate Edit Operations (Priority 5)

### Target: Review and optimize existing `src/utils/` files

**Review:**
- `fileOperations.ts` - Already exists, verify usage
- `editOperations.ts` - Already exists, verify usage
- `layerOperations.ts` - Already exists, verify usage
- `zoomOperations.ts` - Already exists, verify usage
- `groupOperations.ts` - Already exists, verify usage

**Optimize:**
- Ensure all handlers use utility functions
- Remove duplicate logic
- Verify all operations use shared utilities

**Benefits:**
- Consistent code organization
- Easier to maintain
- Reduces App.tsx by ~280 lines

---

## Detailed Extraction Plan

### Step 1: Extract Canvas Rendering (~340 lines)

**Create: `src/hooks/useCanvas.ts`**
```typescript
import { useCallback } from 'react';
import { DesignState, SceneNode, FrameNode, TextNode, RectangleNode, VectorNode, ImageNode, InstanceNode, CommentNode, Point } from '../types';
import { getAbsolutePosition } from '../utils/canvasHelpers';
import { wrapText } from '../utils/canvasHelpers';

export function useCanvas(
  state: DesignState,
  hoveredId: string | null,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  containerRef: React.RefObject<HTMLDivElement>
) {
  const renderScene = useCallback(() => {
    // ... canvas rendering logic
  }, [state, hoveredId]);

  return { renderScene };
}
```

**Create: `src/components/Canvas.tsx`**
```typescript
import { useRef, useEffect } from 'react';
import { useCanvas } from '../hooks/useCanvas';

interface CanvasProps {
  state: DesignState;
  hoveredId: string | null;
  onRef: (ref: HTMLCanvasElement | null) => void;
}

export function Canvas({ state, hoveredId, onRef }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { renderScene } = useCanvas(state, hoveredId, canvasRef, containerRef);

  useEffect(() => {
    onRef(canvasRef.current);
  }, [onRef]);

  useEffect(() => {
    renderScene();
  }, [renderScene]);

  return (
    <div ref={containerRef} className="flex-1 relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}
```

---

### Step 2: Extract Interaction Handlers (~1000 lines)

**Create: `src/hooks/useInteraction.ts`**
```typescript
import { useState, useCallback } from 'react';
import { DesignState, ToolType, Point } from '../types';
import { screenToWorld, getAbsolutePosition, findParentFrameAtPoint } from '../utils/interactionHelpers';
import { useToolHandlers } from './useToolHandlers';

export function useInteraction(
  state: DesignState,
  setState: (state: DesignState | ((prev: DesignState) => DesignState)) => void,
  pushToHistory: (state: DesignState) => void,
  activeTool: ToolType,
  containerRef: React.RefObject<HTMLDivElement>
) {
  const [interaction, setInteraction] = useState<any>(null);
  const { createFrame, createRectangle, createText, /* ... */ } = useToolHandlers(state, setState, pushToHistory);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // ... pointer down logic
  }, [state, activeTool, /* ... */]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    // ... pointer move logic
  }, [state, interaction, /* ... */]);

  const handlePointerUp = useCallback((e?: React.PointerEvent) => {
    // ... pointer up logic
  }, [interaction, /* ... */]);

  return {
    interaction,
    setInteraction,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
```

**Create: `src/hooks/useToolHandlers.ts`**
```typescript
import { useCallback } from 'react';
import { DesignState, ToolType, FrameNode, RectangleNode, TextNode, VectorNode, CommentNode, Point } from '../types';
import { generateId } from '../utils/helpers';
import { findParentFrameAtPoint, getAbsolutePosition, snapToGrid } from '../utils/interactionHelpers';

export function useToolHandlers(
  state: DesignState,
  setState: (state: DesignState | ((prev: DesignState) => DesignState)) => void,
  pushToHistory: (state: DesignState) => void,
  containerRef: React.RefObject<HTMLDivElement>
) {
  const createFrame = useCallback((world: Point, parentFrame?: FrameNode) => {
    // ... frame creation logic
  }, [state, setState, pushToHistory]);

  const createRectangle = useCallback((world: Point, parentFrame?: FrameNode) => {
    // ... rectangle creation logic
  }, [state, setState, pushToHistory]);

  const createText = useCallback((world: Point, parentFrame?: FrameNode) => {
    // ... text creation logic
  }, [state, setState, pushToHistory]);

  // ... other tool creation handlers

  return {
    createFrame,
    createRectangle,
    createText,
    // ... other handlers
  };
}
```

---

### Step 3: Extract Keyboard Shortcuts (~230 lines)

**Create: `src/hooks/useKeyboardShortcuts.ts`**
```typescript
import { useEffect } from 'react';
import { DesignState, ToolType } from '../types';
import { useHistory } from '@/shared/hooks';

export function useKeyboardShortcuts(
  state: DesignState,
  setState: (state: DesignState | ((prev: DesignState) => DesignState)) => void,
  activeTool: ToolType,
  setActiveTool: (tool: ToolType) => void,
  clipboard: SceneNode[],
  setClipboard: (nodes: SceneNode[]) => void,
  undo: () => void,
  redo: () => void
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ... keyboard shortcut logic
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, activeTool, clipboard, undo, redo, /* ... */]);
}
```

**Note:** Check if `@/shared/hooks/useKeyboardShortcuts` already exists and can be used

---

### Step 4: Extract Helper Functions (~75 lines)

**Create: `src/utils/canvasHelpers.ts`**
```typescript
import { Point, SceneNode } from '../types';

export function screenToWorld(sx: number, sy: number, viewport: Point, zoom: number): Point {
  return {
    x: (sx - viewport.x) / zoom,
    y: (sy - viewport.y) / zoom
  };
}

export function getAbsolutePosition(nodeId: string, nodes: Record<string, SceneNode>): Point {
  // ... implementation
}

export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  // ... implementation
}
```

**Create: `src/utils/interactionHelpers.ts`**
```typescript
import { Point, FrameNode, SceneNode } from '../types';

export function findParentFrameAtPoint(
  x: number,
  y: number,
  rootIds: string[],
  nodes: Record<string, SceneNode>,
  getAbsolutePosition: (id: string, nodes: Record<string, SceneNode>) => Point
): FrameNode | null {
  // ... implementation
}
```

---

### Step 5: Refactor App.tsx

**After extraction, `App.tsx` should be:**
```typescript
import React, { useRef, useState } from 'react';
import { DesignState, ToolType } from './types';
import { useHistory } from '@/shared/hooks';
import { Canvas } from './components/Canvas';
import { InteractionHandler } from './components/InteractionHandler';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { INITIAL_STATE } from './constants';
// ... other imports

const App = () => {
  // State management
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const historyResult = useHistory(INITIAL_STATE, { /* ... */ });
  const { state, setState, pushToHistory, undo, redo, canUndo, canRedo } = historyResult;

  // UI state
  const [activeTool, setActiveTool] = useState<ToolType>('SELECT');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // ... other UI state

  // Interactions
  const {
    interaction,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useInteraction(state, setState, pushToHistory, activeTool, containerRef);

  // Keyboard shortcuts
  useKeyboardShortcuts(state, setState, activeTool, setActiveTool, clipboard, setClipboard, undo, redo);

  // Edit operation handlers (use existing utils)
  const handleSave = () => saveFile(state);
  const handleCopy = () => { /* ... */ };
  // ... other handlers

  return (
    <div className="flex h-screen w-full bg-[#1e1e1e] text-gray-300 font-sans overflow-hidden flex-col">
      {/* File Menu */}
      <FileMenu /* ... */ />

      {/* Floating Top Nav */}
      <FloatingTopNav /* ... */ />

      <div className="flex-1 flex overflow-hidden">
        <LayersPanel /* ... */ />
        
        <InteractionHandler
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <Canvas
            state={state}
            hoveredId={hoveredId}
            onRef={(ref) => { canvasRef.current = ref; }}
          />
        </InteractionHandler>

        <InspectorPanel /* ... */ />
      </div>

      {/* Bottom Dock */}
      <BottomDock /* ... */ />

      {/* Context Menu */}
      <ContextMenu /* ... */ />

      {/* Alignment Guides */}
      <AlignmentGuides /* ... */ />

      {/* Rulers */}
      <Rulers /* ... */ />
    </div>
  );
};

export default App;
```

**Estimated size after refactoring:** ~250-300 lines

---

## Implementation Phases

### Phase 1: Setup (1-2 hours)
- Create new file structure
- Set up TypeScript exports
- Create empty hooks/components

### Phase 2: Extract Canvas (3-4 hours)
- Move renderScene to useCanvas hook
- Create Canvas component
- Test canvas rendering
- Update App.tsx to use Canvas

### Phase 3: Extract Interactions (6-8 hours)
- Move pointer handlers to useInteraction hook
- Create tool handlers in useToolHandlers hook
- Test interactions
- Update App.tsx to use hooks

### Phase 4: Extract Keyboard (2-3 hours)
- Move keyboard shortcuts to useKeyboardShortcuts hook
- Test keyboard shortcuts
- Update App.tsx to use hook

### Phase 5: Extract Helpers (1-2 hours)
- Move helper functions to utils/
- Update imports
- Test helper functions

### Phase 6: Cleanup & Test (2-3 hours)
- Remove duplicate code
- Update all imports
- Test all functionality
- Fix any issues

**Total Estimated Time:** 15-22 hours

---

## Benefits

### Maintainability
- Each component/hook has a single responsibility
- Easier to understand and navigate
- Easier to test individual pieces

### Testability
- Canvas rendering can be tested independently
- Interactions can be tested with mocks
- Keyboard shortcuts can be tested in isolation

### Reusability
- Canvas component can be reused
- Interaction handlers can be reused
- Helper functions are reusable

### Performance
- Better code splitting opportunities
- Easier to optimize individual pieces
- Reduced bundle size potential

---

## Risks & Mitigation

### Risk 1: Breaking Existing Functionality
- **Mitigation:** Extract incrementally, test after each extraction
- **Backup:** Keep original App.tsx as backup until all tests pass

### Risk 2: Performance Regression
- **Mitigation:** Profile before and after refactoring
- **Test:** Ensure render performance is maintained

### Risk 3: Increased Complexity
- **Mitigation:** Keep interfaces simple, document well
- **Review:** Code review after each phase

---

## Success Criteria

1. ✅ App.tsx reduced to < 300 lines
2. ✅ All functionality preserved
3. ✅ All tests pass
4. ✅ No performance regression
5. ✅ Code is more maintainable
6. ✅ Each new file has single responsibility

---

## Next Steps

1. **Review this plan** with team/stakeholders
2. **Create backup** of current App.tsx
3. **Start Phase 1:** Extract canvas rendering
4. **Test incrementally** after each phase
5. **Document** as you go

---

**Status:** Plan Created  
**Priority:** High  
**Estimated Time:** 15-22 hours  
**Next Action:** Start Phase 1 (Extract Canvas Rendering)
