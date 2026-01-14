# App.tsx Refactoring Checklist

**Date:** 2026-01-10  
**File:** `src/App.tsx` (2,362 lines → Target: < 300 lines)  
**Status:** Not Started

---

## Pre-Refactoring

- [ ] Review refactoring plan
- [ ] Create backup of App.tsx
- [ ] Set up test environment
- [ ] Document current behavior
- [ ] Create feature tests for critical functionality

## Phase 1: Extract Canvas Rendering (~340 lines)

### Setup
- [ ] Create `src/hooks/useCanvas.ts`
- [ ] Create `src/components/Canvas.tsx`
- [ ] Create `src/utils/canvasHelpers.ts`

### Extract Functions
- [ ] Move `renderScene` to `useCanvas` hook
- [ ] Move `drawNode` nested function
- [ ] Move `screenToWorld` to `canvasHelpers.ts`
- [ ] Move `getAbsolutePosition` to `canvasHelpers.ts`
- [ ] Move `wrapText` to `canvasHelpers.ts`

### Integration
- [ ] Update App.tsx to use Canvas component
- [ ] Update imports
- [ ] Test canvas rendering works
- [ ] Verify all node types render correctly

### Testing
- [ ] Test canvas renders on mount
- [ ] Test canvas updates on state change
- [ ] Test canvas handles viewport changes
- [ ] Test canvas handles hover state

## Phase 2: Extract Interaction Handlers (~1000 lines)

### Setup
- [ ] Create `src/hooks/useInteraction.ts`
- [ ] Create `src/hooks/useToolHandlers.ts`
- [ ] Create `src/components/InteractionHandler.tsx`
- [ ] Create `src/utils/interactionHelpers.ts`

### Extract Functions
- [ ] Move `handlePointerDown` to `useInteraction` hook
- [ ] Move `handlePointerMove` to `useInteraction` hook
- [ ] Move `handlePointerUp` to `useInteraction` hook
- [ ] Move tool creation logic to `useToolHandlers` hook
- [ ] Move `findParentFrameAtPoint` to `interactionHelpers.ts`

### Extract Tool Handlers
- [ ] Extract FRAME tool creation
- [ ] Extract RECTANGLE tool creation
- [ ] Extract TEXT tool creation
- [ ] Extract LINE/ARROW tool creation
- [ ] Extract ELLIPSE tool creation
- [ ] Extract POLYGON tool creation
- [ ] Extract STAR tool creation
- [ ] Extract SLICE tool creation
- [ ] Extract COMMENT tool creation
- [ ] Extract HAND tool logic
- [ ] Extract EYEDROPPER tool logic
- [ ] Extract SCALE tool logic

### Integration
- [ ] Update App.tsx to use InteractionHandler
- [ ] Update imports
- [ ] Test all pointer interactions
- [ ] Verify all tools work correctly

### Testing
- [ ] Test pointer down on canvas
- [ ] Test pointer move (drag, resize)
- [ ] Test pointer up
- [ ] Test each tool creation
- [ ] Test drag interaction
- [ ] Test resize handles
- [ ] Test scale interaction

## Phase 3: Extract Keyboard Shortcuts (~230 lines)

### Setup
- [ ] Create `src/hooks/useKeyboardShortcuts.ts`
- [ ] Check if `@/shared/hooks/useKeyboardShortcuts` exists
- [ ] Decide: use shared or create new

### Extract Functions
- [ ] Move `handleKeyDown` to `useKeyboardShortcuts` hook
- [ ] Extract tool shortcuts (v, f, r, t, h, p, i)
- [ ] Extract edit shortcuts (undo/redo, copy/paste, delete)

### Integration
- [ ] Update App.tsx to use useKeyboardShortcuts hook
- [ ] Update imports
- [ ] Test all keyboard shortcuts
- [ ] Verify shortcuts don't conflict

### Testing
- [ ] Test tool shortcuts (v, f, r, t, h, p, i)
- [ ] Test undo/redo (Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z)
- [ ] Test copy/paste (Cmd/Ctrl+C, Cmd/Ctrl+V)
- [ ] Test delete (Delete, Backspace)
- [ ] Test shortcuts don't work in inputs

## Phase 4: Extract Helper Functions (~75 lines)

### Setup
- [ ] Create `src/utils/canvasHelpers.ts`
- [ ] Create `src/utils/interactionHelpers.ts`

### Extract Functions
- [ ] Move `screenToWorld` to `canvasHelpers.ts`
- [ ] Move `getAbsolutePosition` to `canvasHelpers.ts`
- [ ] Move `wrapText` to `canvasHelpers.ts`
- [ ] Move `findParentFrameAtPoint` to `interactionHelpers.ts`
- [ ] Move `handleImageUpload` to appropriate file

### Integration
- [ ] Update all imports to use new helpers
- [ ] Test helper functions work correctly
- [ ] Verify no circular dependencies

### Testing
- [ ] Test screenToWorld conversion
- [ ] Test getAbsolutePosition calculation
- [ ] Test wrapText function
- [ ] Test findParentFrameAtPoint function

## Phase 5: Consolidate Edit Operations (~280 lines)

### Review Existing Utils
- [ ] Review `fileOperations.ts` - ensure all file ops use it
- [ ] Review `editOperations.ts` - ensure all edit ops use it
- [ ] Review `layerOperations.ts` - ensure all layer ops use it
- [ ] Review `zoomOperations.ts` - ensure all zoom ops use it
- [ ] Review `groupOperations.ts` - ensure all group ops use it

### Optimize Handlers
- [ ] Update `handleSave` to use `saveFile` from utils
- [ ] Update `handleLoad` to use `loadFile` from utils
- [ ] Update `handleCopy` to use `copyNodes` from utils
- [ ] Update `handlePaste` to use `pasteNodes` from utils
- [ ] Update `handleDelete` to use `deleteNodes` from utils
- [ ] Update `handleDuplicate` to use `duplicateNodes` from utils
- [ ] Update `handleGroup` to use `groupNodes` from utils
- [ ] Update `handleUngroup` to use `ungroupNodes` from utils
- [ ] Update zoom handlers to use zoom utils
- [ ] Update layer handlers to use layer utils

### Integration
- [ ] Remove duplicate logic from App.tsx
- [ ] Ensure all handlers use utility functions
- [ ] Test all edit operations

### Testing
- [ ] Test file operations (save, load, export, import)
- [ ] Test edit operations (copy, cut, paste, delete, duplicate)
- [ ] Test layer operations (group, ungroup, bring forward, etc.)
- [ ] Test zoom operations (zoom in, out, fit, selection)

## Phase 6: Final Cleanup

### Code Review
- [ ] Remove unused imports
- [ ] Remove duplicate code
- [ ] Fix any TypeScript errors
- [ ] Fix any linting errors
- [ ] Update documentation

### Testing
- [ ] Run all existing tests
- [ ] Test critical user flows
- [ ] Test edge cases
- [ ] Performance test (ensure no regression)

### Documentation
- [ ] Update README with new structure
- [ ] Update architecture docs
- [ ] Document new hooks/components
- [ ] Create migration guide if needed

## Verification

### Functionality
- [ ] All features work as before
- [ ] No regressions
- [ ] All interactions work
- [ ] All tools work
- [ ] All shortcuts work

### Code Quality
- [ ] App.tsx < 300 lines ✅
- [ ] Each new file < 500 lines
- [ ] No circular dependencies
- [ ] All types are correct
- [ ] All functions are documented

### Performance
- [ ] Render performance maintained
- [ ] Interaction performance maintained
- [ ] No memory leaks
- [ ] Bundle size not significantly increased

## Post-Refactoring

- [ ] Update project documentation
- [ ] Update codebase guide
- [ ] Create PR with changes
- [ ] Get code review
- [ ] Merge after approval

---

**Status:** Not Started  
**Priority:** High  
**Estimated Time:** 15-22 hours  
**Current Progress:** 0%
