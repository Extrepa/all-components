# Type Safety Improvements Plan - January 10, 2026

**Date:** 2026-01-10  
**Phase:** Phase 2 - Code Quality & Testing  
**Status:** In Progress

---

## Summary

Comprehensive plan to improve type safety across the codebase by removing `any` types, adding proper type definitions, and using type guards instead of type assertions.

---

## Current Type Safety Status

### ✅ Well-Typed Code

1. **Shared Hooks** ✅
   - `useHistory.ts` - Well-typed, minimal type assertions (necessary for function overloads)
   - `useKeyboardShortcuts.ts` - Well-typed, proper interfaces

2. **Core Types** ✅
   - Most projects have proper TypeScript type definitions
   - Strict mode enabled in all projects ✅

### ⚠️ Type Safety Issues Found

1. **figma-clone-engine/src/App.tsx**
   - Line 93: `const [interaction, setInteraction] = useState<any>(null);` - Should be properly typed
   - Multiple `(props as any)` assertions in renderScene
   - Multiple `(node as FrameNode)` assertions (could use type guards)

2. **Shared Paper.js Utilities**
   - `shared/utils/paper/*.ts` - Uses `any` for Paper.js (acceptable - library may not have types or be loaded from CDN)
   - These are acceptable due to dynamic loading nature

3. **Other Projects**
   - Need comprehensive review for `any` types
   - Need review for type assertions that could be type guards

---

## Type Safety Improvement Plan

### Phase 1: Fix Critical Type Issues (High Priority)

#### 1.1 Fix Interaction Type in figma-clone-engine

**Issue:** `interaction` state uses `any` type

**Fix:**
- ✅ Create `src/types/interaction.ts` with proper Interaction types
- Update `App.tsx` to use `Interaction | null` instead of `any`

**Files:**
- `figma-clone-engine/src/types/interaction.ts` - ✅ Created
- `figma-clone-engine/src/App.tsx` - Needs update

**Estimated Time:** 1 hour

#### 1.2 Replace Type Assertions with Type Guards

**Issue:** Multiple `as FrameNode`, `as TextNode`, `as any` assertions

**Fix:**
- Create type guard functions
- Replace assertions with type guards

**Example:**
```typescript
// Instead of:
if ((node as FrameNode).layoutMode !== 'NONE') { ... }

// Use:
function isFrameNode(node: SceneNode): node is FrameNode {
  return node.type === 'FRAME' || node.type === 'COMPONENT';
}

if (isFrameNode(node) && node.layoutMode !== 'NONE') { ... }
```

**Estimated Time:** 3 hours

### Phase 2: Improve Paper.js Types (Medium Priority)

#### 2.1 Create Paper.js Type Definitions

**Issue:** Paper.js utilities use `any` because library may not have types

**Fix:**
- Create minimal type definitions for Paper.js interfaces used
- Use conditional types for optional Paper.js

**Example:**
```typescript
// Create shared/types/paper.d.ts
declare module 'paper' {
  export class Path {
    // Minimal interface for what we use
  }
  // ... other types
}

// Use:
type PaperPath = typeof paper extends { Path: infer T } ? T : any;
```

**Estimated Time:** 4 hours

### Phase 3: Review All Projects (Low Priority)

#### 3.1 Comprehensive Type Audit

**Tasks:**
- Review all projects for `any` types
- Review all type assertions
- Identify opportunities for type guards
- Document type safety improvements

**Estimated Time:** 8 hours per project (160 hours total)

---

## Detailed Fixes

### Fix 1: Interaction Types in figma-clone-engine

**Current Code:**
```typescript
const [interaction, setInteraction] = useState<any>(null);
```

**Fixed Code:**
```typescript
import { Interaction } from './types/interaction';

const [interaction, setInteraction] = useState<Interaction | null>(null);
```

**Benefits:**
- Type-safe interaction state
- Better autocomplete
- Catch errors at compile time

---

### Fix 2: Type Guards for Node Types

**Create: `src/utils/typeGuards.ts`**
```typescript
import { SceneNode, FrameNode, TextNode, RectangleNode, VectorNode, ImageNode, InstanceNode, CommentNode } from '../types';

export function isFrameNode(node: SceneNode): node is FrameNode {
  return node.type === 'FRAME' || node.type === 'COMPONENT';
}

export function isTextNode(node: SceneNode): node is TextNode {
  return node.type === 'TEXT';
}

export function isRectangleNode(node: SceneNode): node is RectangleNode {
  return node.type === 'RECTANGLE';
}

export function isVectorNode(node: SceneNode): node is VectorNode {
  return node.type === 'VECTOR' || node.type === 'LINE' || node.type === 'ARROW' || node.type === 'ELLIPSE' || node.type === 'POLYGON' || node.type === 'STAR';
}

export function isImageNode(node: SceneNode): node is ImageNode {
  return node.type === 'IMAGE';
}

export function isInstanceNode(node: SceneNode): node is InstanceNode {
  return node.type === 'INSTANCE';
}

export function isCommentNode(node: SceneNode): node is CommentNode {
  return node.type === 'COMMENT';
}

export function hasWidth(node: SceneNode): node is SceneNode & { width: number } {
  return 'width' in node;
}

export function hasHeight(node: SceneNode): node is SceneNode & { height: number } {
  return 'height' in node;
}
```

**Usage:**
```typescript
// Instead of:
if ((node as FrameNode).layoutMode !== 'NONE') { ... }

// Use:
if (isFrameNode(node) && node.layoutMode !== 'NONE') { ... }
```

**Benefits:**
- Type-safe node type checking
- Better autocomplete
- Compile-time type narrowing

---

### Fix 3: Remove `as any` Assertions in renderScene

**Current Code:**
```typescript
const width = (props as any).width || 100;
const height = (props as any).height || 20;
```

**Fixed Code:**
```typescript
import { hasWidth, hasHeight } from '../utils/typeGuards';

if (hasWidth(props) && hasHeight(props)) {
  const width = props.width;
  const height = props.height;
  // ... use width and height
}
```

**Benefits:**
- Type-safe property access
- Better error messages
- Compile-time checks

---

## Priority Recommendations

### High Priority (Fix First)

1. **Fix Interaction Types** (1h)
   - Create Interaction type definitions ✅
   - Update App.tsx to use proper types
   - Impact: Immediate type safety improvement

2. **Create Type Guards** (3h)
   - Create type guard functions
   - Replace type assertions with guards
   - Impact: Better type safety throughout

### Medium Priority (Fix Second)

3. **Improve Paper.js Types** (4h)
   - Create minimal type definitions
   - Use conditional types
   - Impact: Better type safety for Paper.js utilities

4. **Remove `as any` in renderScene** (2h)
   - Use type guards
   - Proper property access
   - Impact: Type-safe canvas rendering

### Low Priority (Fix Last)

5. **Comprehensive Type Audit** (160h)
   - Review all 20 projects
   - Document all `any` types
   - Fix critical issues
   - Impact: Long-term type safety improvement

---

## Files Created/Modified

### Created Files
- ✅ `figma-clone-engine/src/types/interaction.ts` - Interaction type definitions
- ✅ `figma-clone-engine/docs/REFACTORING_PLAN.md` - Detailed refactoring plan
- ✅ `figma-clone-engine/docs/REFACTORING_CHECKLIST.md` - Refactoring checklist
- ✅ `TYPE_SAFETY_IMPROVEMENTS_2026-01-10.md` - This file

### Files to Modify
- `figma-clone-engine/src/App.tsx` - Update interaction type, add type guards
- `figma-clone-engine/src/utils/typeGuards.ts` - Create type guard functions
- `figma-clone-engine/src/types.ts` - Export interaction types

---

## Next Steps

### Immediate (Can Do Now)

1. ✅ Create Interaction type definitions
2. ⏳ Update App.tsx to use Interaction type
3. ⏳ Create type guard functions
4. ⏳ Replace type assertions with type guards

### Requires Running Code

5. Test type safety improvements
6. Fix any TypeScript errors
7. Verify no runtime issues

---

## Success Criteria

1. ✅ Interaction types defined
2. ⏳ No `any` types in critical paths
3. ⏳ All type assertions replaced with type guards (where possible)
4. ⏳ All TypeScript errors resolved
5. ⏳ No runtime issues introduced

---

**Status:** Type Safety Improvements - Planning Complete  
**Next:** Implement Interaction types, create type guards, update App.tsx
