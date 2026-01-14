# Migration Guide: Paper.js Utilities Consolidation

**Created:** 2027-01-07  
**Priority:** Medium  
**Complexity:** Low  
**Estimated Time:** 2 weeks

---

## Overview

This guide covers extracting shared Paper.js utilities from `svg_editor` and `multi-tool-app` into `shared/utils/paper/`.

**Current State:**
- `svg_editor` - Paper.js for vector manipulation
- `multi-tool-app` - Paper.js for path operations (boolean ops, path offset, simplifier)

**Target State:**
- Shared Paper.js utilities in `shared/utils/paper/`
- Both projects using shared utilities

---

## Current State Analysis

### `svg_editor` Paper.js Usage

**Location:** [`svg_editor/src/`](svg_editor/)

**Usage:**
- Vector manipulation
- Path operations
- Node editing

**Key Operations:**
- Path manipulation
- Node editing
- Transform operations

---

### `multi-tool-app` Paper.js Usage

**Location:** [`multi-tool-app/src/utils/`](multi-tool-app/src/utils/)

**Files:**
- `pathOffset.ts` - Expand strokes to filled shapes
- `pathSimplifier.ts` - Simplify paths with Douglas-Peucker
- `booleanOperations.ts` - Union, subtract, intersect operations

**Key Operations:**
- Boolean operations (union, subtract, intersect)
- Path offset (stroke to fill)
- Path simplification

---

## Target State Design

### Shared Paper.js Utilities

**Location:** `shared/utils/paper/`

**Structure:**
```
shared/utils/paper/
├── index.ts
├── pathOperations.ts    # Basic path operations
├── booleanOps.ts        # Boolean operations
├── pathOffset.ts        # Path offset utilities
├── pathSimplifier.ts    # Path simplification
└── types.ts             # Paper.js type definitions
```

**API Design:**
```typescript
// Boolean operations
export function unionPaths(path1: paper.Path, path2: paper.Path): paper.Path;
export function subtractPaths(path1: paper.Path, path2: paper.Path): paper.Path;
export function intersectPaths(path1: paper.Path, path2: paper.Path): paper.Path;
export function excludePaths(path1: paper.Path, path2: paper.Path): paper.Path;

// Path offset
export function offsetPath(path: paper.Path, offset: number): paper.Path;

// Path simplification
export function simplifyPath(path: paper.Path, tolerance: number): paper.Path;

// Path utilities
export function pathToSVG(path: paper.Path): string;
export function svgToPath(svgPath: string): paper.Path;
```

---

## Step-by-Step Migration Process

### Step 1: Create Shared Utilities

1. **Create `shared/utils/paper/` structure**
   ```bash
   mkdir -p shared/utils/paper
   ```

2. **Extract boolean operations**
   - Copy from `multi-tool-app/src/utils/booleanOperations.ts`
   - Generalize for reuse
   - Create `shared/utils/paper/booleanOps.ts`

3. **Extract path offset**
   - Copy from `multi-tool-app/src/utils/pathOffset.ts`
   - Generalize for reuse
   - Create `shared/utils/paper/pathOffset.ts`

4. **Extract path simplifier**
   - Copy from `multi-tool-app/src/utils/pathSimplifier.ts`
   - Generalize for reuse
   - Create `shared/utils/paper/pathSimplifier.ts`

5. **Create path operations utilities**
   - Extract common path operations
   - Create `shared/utils/paper/pathOperations.ts`

6. **Write tests**
   - Test all operations
   - Test edge cases
   - Performance benchmarks

### Step 2: Migrate `multi-tool-app`

1. **Update imports**
   ```typescript
   // Before
   import { unionPaths } from '@/utils/booleanOperations';
   import { offsetPath } from '@/utils/pathOffset';
   
   // After
   import { unionPaths, offsetPath } from '@/shared/utils/paper';
   ```

2. **Update usage** (usually no changes needed)
   ```typescript
   // Usage remains the same
   const result = unionPaths(path1, path2);
   ```

3. **Remove old files**
   - Delete `multi-tool-app/src/utils/booleanOperations.ts`
   - Delete `multi-tool-app/src/utils/pathOffset.ts`
   - Delete `multi-tool-app/src/utils/pathSimplifier.ts`

4. **Test thoroughly**
   - Test all Paper.js operations
   - Visual regression testing
   - Performance testing

### Step 3: Migrate `svg_editor`

1. **Analyze Paper.js usage**
   - Identify which operations are used
   - Check if shared utilities cover needs
   - Identify any unique operations

2. **Update imports**
   ```typescript
   // Before
   import paper from 'paper';
   // Direct Paper.js usage
   
   // After
   import { unionPaths, offsetPath, simplifyPath } from '@/shared/utils/paper';
   ```

3. **Update usage**
   ```typescript
   // Before
   const result = path1.unite(path2);
   
   // After
   const result = unionPaths(path1, path2);
   ```

4. **Test thoroughly**
   - Test all SVG operations
   - Visual regression testing
   - Performance testing

---

## Code Examples

### Before: Project-Specific Implementation

```typescript
// multi-tool-app/src/utils/booleanOperations.ts
import paper from 'paper';

export function unionPaths(path1: paper.Path, path2: paper.Path): paper.Path {
  const result = path1.unite(path2);
  return result;
}

export function subtractPaths(path1: paper.Path, path2: paper.Path): paper.Path {
  const result = path1.subtract(path2);
  return result;
}
```

### After: Shared Implementation

```typescript
// shared/utils/paper/booleanOps.ts
import paper from 'paper';

export function unionPaths(path1: paper.Path, path2: paper.Path): paper.Path {
  // Add error handling, validation, etc.
  if (!path1 || !path2) throw new Error('Paths required');
  const result = path1.unite(path2);
  return result;
}

export function subtractPaths(path1: paper.Path, path2: paper.Path): paper.Path {
  if (!path1 || !path2) throw new Error('Paths required');
  const result = path1.subtract(path2);
  return result;
}

// ... other operations
```

### Usage in Projects

```typescript
// multi-tool-app or svg_editor
import { unionPaths, subtractPaths, offsetPath, simplifyPath } from '@/shared/utils/paper';

function handleBooleanOp(type: 'union' | 'subtract', path1: paper.Path, path2: paper.Path) {
  switch (type) {
    case 'union':
      return unionPaths(path1, path2);
    case 'subtract':
      return subtractPaths(path1, path2);
  }
}
```

---

## Testing Checklist

### Functional Testing

- [ ] Boolean operations work correctly
- [ ] Path offset works correctly
- [ ] Path simplification works correctly
- [ ] All path operations work
- [ ] Error handling works
- [ ] Edge cases handled

### Integration Testing

- [ ] Works with `multi-tool-app`
- [ ] Works with `svg_editor`
- [ ] Performance maintained
- [ ] No regressions

### Performance Testing

- [ ] Benchmark before/after
- [ ] No performance degradation
- [ ] Memory usage acceptable

---

## Rollback Procedures

### If Issues Occur

1. **Immediate Rollback**
   ```bash
   # Revert to project-specific implementations
   git checkout HEAD~1 shared/utils/paper/
   ```

2. **Project-Specific Rollback**
   ```typescript
   // Temporarily use old implementations
   import { unionPaths } from '@/utils/booleanOperations'; // Old local version
   ```

3. **Gradual Rollback**
   - Keep old implementations available
   - Migrate projects back one at a time if needed
   - Fix issues before continuing

---

## Migration Timeline

**Week 1:**
- Create shared utilities
- Extract from `multi-tool-app`
- Write tests

**Week 2:**
- Migrate `multi-tool-app`
- Migrate `svg_editor`
- Test thoroughly
- Cleanup

---

## Success Criteria

- [ ] Shared Paper.js utilities created
- [ ] Both projects using shared utilities
- [ ] All operations work correctly
- [ ] Performance maintained
- [ ] Code reduction achieved
- [ ] Documentation updated

---

## References

- [Code Patterns](CODE_PATTERNS.md) - Paper.js pattern documentation
- [Consolidation Strategy](CONSOLIDATION_STRATEGY.md)
- [Consolidation Roadmap](CONSOLIDATION_ROADMAP.md)
