# InspectorPanel Refactoring Plan

## Overview

The `InspectorPanel.tsx` file has grown to **2,653 lines**, making it difficult to maintain, test, and extend. This plan outlines a comprehensive refactoring strategy to break it down into smaller, focused components.

## Current Structure Analysis

### Main Sections Identified

1. **Header Components** (~150 lines)
   - User icon, Preview dropdown, Share button
   - Design/Prototype tabs
   - Zoom dropdown

2. **Multi-Selection Inspector** (~200 lines)
   - Alignment tools
   - Distribution tools
   - Common properties

3. **Empty Selection Inspector** (~150 lines)
   - Page-level properties
   - Project settings

4. **Root Frame Inspector** (~200 lines)
   - Page inspector with header
   - Page-specific controls

5. **Single Selection Inspector** (~1,500 lines)
   - Position Section
   - Layout Section
   - Constraints Section
   - Appearance Section
   - Fill Section
   - Stroke Section
   - Effects Section
   - Typography Section
   - Export Section
   - Component Section
   - Variables Section
   - Styles Section
   - Interactions Section (Prototype tab)
   - Flow Starting Point Section (Prototype tab)
   - Prototype Settings Section (Prototype tab)

6. **Dev Mode Inspector** (~300 lines)
   - Inspect/Plugins tabs
   - Box model visualization
   - Layout properties
   - Code generation display

7. **Shared Logic** (~150 lines)
   - State management (expanded sections, dropdowns, collapse)
   - Resize handlers
   - Zoom handlers
   - Section toggle logic

## Refactoring Strategy

### Phase 1: Extract Header Components

**New Files:**
- `src/components/inspector/InspectorHeader.tsx` - Main header with user/preview/share
- `src/components/inspector/InspectorTabs.tsx` - Design/Prototype tab switcher
- `src/components/inspector/ZoomDropdown.tsx` - Zoom control dropdown

**Benefits:**
- Reusable header across all inspector states
- Easier to test header interactions
- Clear separation of concerns

### Phase 2: Extract Section Components

**New Files:**
- `src/components/inspector/sections/PositionSection.tsx`
- `src/components/inspector/sections/LayoutSection.tsx`
- `src/components/inspector/sections/ConstraintsSection.tsx`
- `src/components/inspector/sections/AppearanceSection.tsx`
- `src/components/inspector/sections/FillSection.tsx`
- `src/components/inspector/sections/StrokeSection.tsx`
- `src/components/inspector/sections/EffectsSection.tsx`
- `src/components/inspector/sections/TypographySection.tsx`
- `src/components/inspector/sections/ExportSection.tsx`
- `src/components/inspector/sections/ComponentSection.tsx`
- `src/components/inspector/sections/VariablesSection.tsx`
- `src/components/inspector/sections/StylesSection.tsx`
- `src/components/inspector/sections/InteractionsSection.tsx`
- `src/components/inspector/sections/FlowStartingPointSection.tsx`
- `src/components/inspector/sections/PrototypeSettingsSection.tsx`

**Shared Section Component:**
- `src/components/inspector/sections/SectionWrapper.tsx` - Accordion wrapper with consistent styling

**Benefits:**
- Each section is independently testable
- Easier to add new sections
- Clear prop interfaces
- Better code organization

### Phase 3: Extract Inspector Variants

**New Files:**
- `src/components/inspector/MultiSelectionInspector.tsx`
- `src/components/inspector/EmptySelectionInspector.tsx`
- `src/components/inspector/RootFrameInspector.tsx`
- `src/components/inspector/SingleSelectionInspector.tsx`
- `src/components/inspector/DevModeInspector.tsx`

**Benefits:**
- Clear separation of different inspector states
- Easier to understand and maintain
- Better conditional rendering logic

### Phase 4: Extract Shared Hooks and Utilities

**New Files:**
- `src/components/inspector/hooks/useInspectorState.ts` - State management hook
- `src/components/inspector/hooks/usePanelResize.ts` - Resize logic hook
- `src/components/inspector/hooks/useExpandedSections.ts` - Section expansion logic
- `src/components/inspector/utils/inspectorHelpers.ts` - Helper functions

**Benefits:**
- Reusable logic
- Easier to test
- Better separation of concerns

### Phase 5: Create Type Definitions

**New File:**
- `src/components/inspector/types.ts` - All inspector-related types

**Types to Define:**
- `InspectorSectionProps` - Props for section components
- `InspectorState` - State shape
- `SectionId` - Union type for section IDs

## File Structure After Refactoring

```
src/components/
├── InspectorPanel.tsx (Main orchestrator, ~200 lines)
└── inspector/
    ├── types.ts
    ├── InspectorHeader.tsx
    ├── InspectorTabs.tsx
    ├── ZoomDropdown.tsx
    ├── MultiSelectionInspector.tsx
    ├── EmptySelectionInspector.tsx
    ├── RootFrameInspector.tsx
    ├── SingleSelectionInspector.tsx
    ├── DevModeInspector.tsx
    ├── hooks/
    │   ├── useInspectorState.ts
    │   ├── usePanelResize.ts
    │   └── useExpandedSections.ts
    ├── utils/
    │   └── inspectorHelpers.ts
    └── sections/
        ├── SectionWrapper.tsx
        ├── PositionSection.tsx
        ├── LayoutSection.tsx
        ├── ConstraintsSection.tsx
        ├── AppearanceSection.tsx
        ├── FillSection.tsx
        ├── StrokeSection.tsx
        ├── EffectsSection.tsx
        ├── TypographySection.tsx
        ├── ExportSection.tsx
        ├── ComponentSection.tsx
        ├── VariablesSection.tsx
        ├── StylesSection.tsx
        ├── InteractionsSection.tsx
        ├── FlowStartingPointSection.tsx
        └── PrototypeSettingsSection.tsx
```

## Implementation Steps

### Step 1: Create Directory Structure
- Create `src/components/inspector/` directory
- Create subdirectories: `sections/`, `hooks/`, `utils/`

### Step 2: Extract Types
- Create `types.ts` with all inspector-related interfaces
- Update imports in main file

### Step 3: Extract Header Components
- Create `InspectorHeader.tsx`
- Create `InspectorTabs.tsx`
- Create `ZoomDropdown.tsx`
- Update main `InspectorPanel.tsx` to use new components

### Step 4: Extract Section Components
- Create `SectionWrapper.tsx` first (reusable accordion)
- Extract each section one by one
- Test each section as it's extracted
- Update main file incrementally

### Step 5: Extract Inspector Variants
- Extract `MultiSelectionInspector.tsx`
- Extract `EmptySelectionInspector.tsx`
- Extract `RootFrameInspector.tsx`
- Extract `SingleSelectionInspector.tsx`
- Extract `DevModeInspector.tsx`

### Step 6: Extract Hooks
- Extract `useInspectorState.ts`
- Extract `usePanelResize.ts`
- Extract `useExpandedSections.ts`

### Step 7: Refactor Main Component
- Simplify `InspectorPanel.tsx` to orchestrate components
- Remove duplicate code
- Ensure all functionality preserved

### Step 8: Testing & Cleanup
- Test all inspector states
- Test all sections
- Test resize functionality
- Test collapse/expand
- Remove unused code
- Update imports

## Component Interfaces

### InspectorHeader Props
```typescript
interface InspectorHeaderProps {
  state: DesignState;
  previewDropdownOpen: boolean;
  setPreviewDropdownOpen: (open: boolean) => void;
  previewDropdownRef: React.RefObject<HTMLDivElement>;
}
```

### SectionWrapper Props
```typescript
interface SectionWrapperProps {
  id: string;
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}
```

### Section Component Props (Example: PositionSection)
```typescript
interface PositionSectionProps {
  node: SceneNode;
  onUpdate: (updates: Partial<SceneNode>) => void;
  expanded: boolean;
  onToggle: () => void;
}
```

## Benefits of Refactoring

1. **Maintainability**: Smaller files are easier to understand and modify
2. **Testability**: Components can be tested in isolation
3. **Reusability**: Section components can be reused elsewhere
4. **Performance**: Better code splitting opportunities
5. **Collaboration**: Multiple developers can work on different sections
6. **Documentation**: Clearer component boundaries
7. **Debugging**: Easier to locate and fix issues

## Migration Strategy

1. **Incremental**: Extract one component at a time
2. **Test After Each**: Ensure functionality preserved
3. **No Breaking Changes**: Maintain same external API
4. **Backward Compatible**: Existing code continues to work

## Estimated Effort

- **Phase 1 (Headers)**: 2-3 hours
- **Phase 2 (Sections)**: 8-10 hours
- **Phase 3 (Variants)**: 4-5 hours
- **Phase 4 (Hooks)**: 2-3 hours
- **Phase 5 (Types)**: 1 hour
- **Testing & Cleanup**: 3-4 hours

**Total**: ~20-26 hours

## Success Criteria

- [ ] InspectorPanel.tsx reduced to <300 lines
- [ ] All functionality preserved
- [ ] All tests passing
- [ ] No performance regressions
- [ ] Code is more maintainable
- [ ] Components are reusable
- [ ] Type safety maintained

## Notes

- Keep existing prop interfaces unchanged during refactoring
- Maintain backward compatibility
- Test thoroughly after each phase
- Document component interfaces
- Consider adding Storybook stories for components

