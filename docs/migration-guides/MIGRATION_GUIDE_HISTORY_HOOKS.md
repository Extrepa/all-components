# Migration Guide: History Hooks Consolidation

**Created:** 2027-01-07  
**Priority:** High  
**Complexity:** Medium  
**Estimated Time:** 3 weeks

---

## Overview

This guide covers migrating 5+ projects from their individual history/undo-redo implementations to a shared `useHistory` hook in `shared/hooks/useHistory.ts`.

**Current State:**
- 5+ projects with similar but separate history implementations
- Two main patterns: index-based array and past/present/future

**Target State:**
- Single shared `useHistory` hook supporting both patterns
- All projects using shared implementation

---

## Current State Analysis

### Projects with History Systems

1. **`figma-clone-engine`** - Past/present/future pattern
   - File: [`figma-clone-engine/src/hooks/useDesignHistory.ts`](figma-clone-engine/src/hooks/useDesignHistory.ts)
   - Pattern: Past/present/future with migration and layout calculation

2. **`multi-tool-app`** - Past/present/future pattern (Zustand)
   - File: [`multi-tool-app/src/state/useStore.ts`](multi-tool-app/src/state/useStore.ts)
   - Pattern: Past/present/future in Zustand store with 50-entry limit

3. **`errl_scene_builder`** - Index-based array pattern
   - File: [`errl_scene_builder/src/hooks/useHistory.ts`](errl_scene_builder/src/hooks/useHistory.ts)
   - Pattern: Index-based array, generic TypeScript

4. **`svg_editor`** - Index-based array pattern
   - File: [`svg_editor/src/hooks/useHistory.ts`](svg_editor/src/hooks/useHistory.ts)
   - Pattern: Index-based with XML serialization, 100-entry limit

5. **`psychedelic-liquid-light-show`** - Index-based array pattern
   - File: [`psychedelic-liquid-light-show/hooks/useHistory.ts`](psychedelic-liquid-light-show/hooks/useHistory.ts)
   - Pattern: Index-based array

---

## Target State Design

### Shared History Hook

**Location:** `shared/hooks/useHistory.ts`

**API Design:**
```typescript
// Index-based mode (default)
interface UseHistoryOptions<T> {
  mode?: 'index-based' | 'past-present-future';
  maxHistory?: number;
  onStateChange?: (state: T) => void;
  transform?: (state: T) => T; // For migration/calculation
}

function useHistory<T>(
  initialState: T,
  options?: UseHistoryOptions<T>
): {
  state: T;
  setState: (next: T | ((prev: T) => T)) => void;
  pushToHistory?: (state: T) => void; // For past/present/future mode
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clearHistory: () => void;
  historyLength: number;
};
```

**Features:**
- Support both patterns via mode option
- Optional history limits
- Optional state transformation (for migration/calculation)
- Generic TypeScript implementation
- Clear API for both use cases

---

## Step-by-Step Migration Process

### Step 1: Implement Shared Hook

1. **Create `shared/hooks/useHistory.ts`**
   - Implement index-based mode
   - Implement past/present/future mode
   - Add configuration options
   - Write comprehensive tests

2. **Create TypeScript types**
   - Create `shared/types/history.ts`
   - Define interfaces for both patterns
   - Export types

3. **Write tests**
   - Test both modes
   - Test history limits
   - Test state transformation
   - Test edge cases

### Step 2: Migrate Pilot Project

**Choose:** `figma-clone-engine` (past/present/future pattern)

1. **Install shared hook**
   ```typescript
   // Update imports
   import { useHistory } from '@/shared/hooks';
   ```

2. **Update hook usage**
   ```typescript
   // Before
   const { state, setState, pushToHistory, undo, redo, canUndo, canRedo } = 
     useDesignHistory(initialState);
   
   // After
   const { state, setState, pushToHistory, undo, redo, canUndo, canRedo } = 
     useHistory(initialState, {
       mode: 'past-present-future',
       transform: (state) => {
         // Apply migration and layout calculation
         let migratedNodes = migrateDesignState(state);
         let calculatedNodes = calculateLayout(migratedNodes);
         return { ...state, nodes: calculatedNodes };
       },
     });
   ```

3. **Test thoroughly**
   - Test all undo/redo operations
   - Test history limits
   - Test state transformation
   - Visual regression testing

4. **Remove old implementation**
   - Delete `figma-clone-engine/src/hooks/useDesignHistory.ts`
   - Update all imports

### Step 3: Migrate Index-Based Projects

**Projects:** `errl_scene_builder`, `svg_editor`, `psychedelic-liquid-light-show`

1. **Update imports**
   ```typescript
   // Before
   import { useHistory } from './hooks/useHistory';
   
   // After
   import { useHistory } from '@/shared/hooks';
   ```

2. **Update hook usage** (usually no changes needed)
   ```typescript
   // Before and After (API is compatible)
   const { state, setState, undo, redo, canUndo, canRedo } = 
     useHistory(initialState);
   ```

3. **Add history limits if needed**
   ```typescript
   // For svg_editor (100-entry limit)
   const { state, setState, undo, redo } = useHistory(initialState, {
     maxHistory: 100,
   });
   ```

4. **Test thoroughly**
   - Test all undo/redo operations
   - Test history limits
   - Test edge cases

5. **Remove old implementations**
   - Delete project-specific history hooks
   - Update all imports

### Step 4: Migrate Zustand Store

**Project:** `multi-tool-app`

1. **Create wrapper or migrate to hook**
   ```typescript
   // Option 1: Keep Zustand, use shared hook internally
   import { useHistory } from '@/shared/hooks';
   
   // In Zustand store
   const historyHook = useHistory(project, { maxHistory: 50 });
   
   // Option 2: Migrate to hook (if Zustand not needed for other state)
   // Replace Zustand history with shared hook
   ```

2. **Update store**
   ```typescript
   // Before
   pushToHistory: () => {
     const snapshot = JSON.parse(JSON.stringify(project));
     set({ history: { past: [...past, present], present: snapshot, future: [] } });
   },
   
   // After
   pushToHistory: () => {
     historyHook.pushToHistory(project);
   },
   ```

3. **Test thoroughly**
   - Test all history operations
   - Test with other Zustand state
   - Performance testing

---

## Code Examples

### Before: Index-Based Pattern

```typescript
// errl_scene_builder/src/hooks/useHistory.ts
export function useHistory<T>(initialState: T) {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<T[]>([initialState]);

  const setState = useCallback(
    (next: T | ((prev: T) => T)) => {
      setHistory((prev) => {
        const current = prev[index];
        const resolved = typeof next === "function" ? (next as (p: T) => T)(current) : next;
        const newHistory = prev.slice(0, index + 1).concat([resolved]);
        setIndex(newHistory.length - 1);
        return newHistory;
      });
    },
    [index]
  );

  const undo = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const redo = useCallback(() => {
    setIndex((i) => Math.min(i + 1, history.length - 1));
  }, [history.length]);

  return {
    state: history[index],
    setState,
    undo,
    redo,
    canUndo: index > 0,
    canRedo: index < history.length - 1,
  };
}
```

### After: Using Shared Hook

```typescript
// Component using shared hook
import { useHistory } from '@/shared/hooks';

function MyComponent() {
  const { state, setState, undo, redo, canUndo, canRedo } = 
    useHistory(initialState, { maxHistory: 50 });
  
  // Usage is identical!
  const handleAction = () => {
    setState(newState);
  };
  
  return (
    <div>
      <button onClick={undo} disabled={!canUndo}>Undo</button>
      <button onClick={redo} disabled={!canRedo}>Redo</button>
    </div>
  );
}
```

### Before: Past/Present/Future Pattern

```typescript
// figma-clone-engine/src/hooks/useDesignHistory.ts
export const useDesignHistory = (initialState: DesignState) => {
  const [history, setHistory] = useState<HistoryState>({ 
    past: [], 
    present: migratedInitialState, 
    future: [] 
  });
  
  const pushToHistory = useCallback((newState: DesignState) => {
    let migratedNodes = migrateDesignState(newState);
    let calculatedNodes = calculateLayout(migratedNodes);
    
    setHistory(prev => ({ 
      past: [...prev.past, prev.present], 
      present: { ...newState, nodes: calculatedNodes }, 
      future: [] 
    }));
  }, []);
  
  // ... undo, redo, etc.
};
```

### After: Using Shared Hook

```typescript
// Component using shared hook with past/present/future mode
import { useHistory } from '@/shared/hooks';

function MyComponent() {
  const { state, setState, pushToHistory, undo, redo, canUndo, canRedo } = 
    useHistory(initialState, {
      mode: 'past-present-future',
      transform: (state) => {
        // Apply migration and layout calculation
        let migratedNodes = migrateDesignState(state);
        let calculatedNodes = calculateLayout(migratedNodes);
        return { ...state, nodes: calculatedNodes };
      },
    });
  
  // Usage is similar, just different import!
  const handleAction = () => {
    const newState = updateState(state);
    pushToHistory(newState);
  };
}
```

---

## Testing Checklist

### Functional Testing

- [ ] Undo works correctly
- [ ] Redo works correctly
- [ ] History limits enforced
- [ ] State transformation applied
- [ ] Can undo/redo flags correct
- [ ] History cleared correctly
- [ ] Edge cases handled (empty history, etc.)

### Integration Testing

- [ ] Works with React components
- [ ] Works with Zustand stores
- [ ] Works with different state types
- [ ] Performance acceptable
- [ ] Memory usage reasonable

### Cross-Project Testing

- [ ] All projects migrated successfully
- [ ] No regressions
- [ ] All history operations work
- [ ] Visual regression testing passed

---

## Rollback Procedures

### If Issues Occur

1. **Immediate Rollback**
   ```bash
   # Revert to old history hook
   git checkout HEAD~1 shared/hooks/useHistory.ts
   ```

2. **Project-Specific Rollback**
   ```typescript
   // Temporarily use old implementation
   import { useHistory } from './hooks/useHistory'; // Old local version
   ```

3. **Gradual Rollback**
   - Keep old implementations available
   - Migrate projects back one at a time if needed
   - Fix issues before continuing

### Backup Strategy

- Create git branch before migration
- Tag current state
- Keep old history hooks in archive folder
- Document rollback steps

---

## Migration Timeline

**Week 1:**
- Implement shared hook
- Write tests
- Create migration guide

**Week 2:**
- Migrate pilot project (`figma-clone-engine`)
- Test thoroughly
- Fix issues

**Week 3:**
- Migrate remaining projects
- Update documentation
- Cleanup

---

## Success Criteria

- [ ] All projects using shared history hook
- [ ] All undo/redo operations work
- [ ] No data loss
- [ ] Performance maintained
- [ ] Documentation updated
- [ ] Old implementations archived

---

## References

- [Architecture Decision Record](docs/decisions/002-shared-history-hook.md)
- [Code Patterns](CODE_PATTERNS.md) - History pattern documentation
- [Consolidation Strategy](CONSOLIDATION_STRATEGY.md)
- [Consolidation Roadmap](CONSOLIDATION_ROADMAP.md)
