# Implementation Plan: Adding Missing Features

This document outlines a comprehensive plan to add all missing features identified in the feature comparison, bringing the Figma Clone Engine to parity with modern design tools like v0.dev.

## 📋 Table of Contents

1. [Overview & Strategy](#overview--strategy)
2. [Phase 1: Foundation Extensions](#phase-1-foundation-extensions)
3. [Phase 2: Typography System](#phase-2-typography-system)
4. [Phase 3: Layout & Spacing](#phase-3-layout--spacing)
5. [Phase 4: Visual Effects](#phase-4-visual-effects)
6. [Phase 5: Design System](#phase-5-design-system)
7. [Phase 6: Enhanced Inspector](#phase-6-enhanced-inspector)
8. [Phase 7: Advanced Features](#phase-7-advanced-features)
9. [Testing Strategy](#testing-strategy)
10. [Timeline & Milestones](#timeline--milestones)

## Overview & Strategy

### Goals
- Add all missing features from v0.dev comparison
- Maintain code quality and architecture
- Ensure backward compatibility
- Incremental delivery with working features at each phase

### Principles
1. **Extend, Don't Break** - All changes should be backward compatible
2. **Incremental** - Each phase delivers working features
3. **Testable** - Features should be testable in isolation
4. **Documented** - Update docs as features are added

### Architecture Approach
- Extend existing node interfaces with optional properties
- Add new utility functions for new features
- Enhance inspector UI incrementally
- Maintain normalized state structure

## Phase 1: Foundation Extensions

**Duration**: 1-2 weeks  
**Priority**: Critical  
**Dependencies**: None

### 1.1 Extend Type Definitions

**Files to Modify**: `src/App.tsx`

#### TextNode Extensions
```typescript
interface TextNode extends BaseNode {
  type: 'TEXT';
  content: string;
  fontSize: number;
  fill: Color;
  // NEW:
  fontFamily?: string;        // Default: 'Inter, sans-serif'
  fontWeight?: string;        // 'normal' | 'bold' | '100' | '200' | ... | '900'
  lineHeight?: number | string; // number (px) or string ('1.5', '150%')
  letterSpacing?: number;     // px
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: string;    // 'none' | 'underline' | 'line-through'
}
```

#### FrameNode Extensions
```typescript
interface FrameNode extends BaseNode {
  // ... existing properties
  // NEW:
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
  flexWrap?: 'wrap' | 'nowrap';
  margin?: number | { top: number; right: number; bottom: number; left: number };
}
```

#### BaseNode Extensions (for all nodes)
```typescript
interface StylableProperties {
  borderColor?: Color;
  borderWidth?: number | { top: number; right: number; bottom: number; left: number };
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderRadius?: number | { topLeft: number; topRight: number; bottomRight: number; bottomLeft: number };
  boxShadow?: string;  // CSS shadow string: "0px 2px 4px rgba(0,0,0,0.1)"
  opacity?: number;     // 0-1
  backgroundImage?: string;  // URL or data URL
  backgroundGradient?: string; // CSS gradient string
}
```

**Tasks**:
- [ ] Add new properties to interfaces
- [ ] Update type unions
- [ ] Add default value helpers
- [ ] Update initial state with examples

### 1.2 Migration Utilities

**New File**: `src/utils/migration.ts`

```typescript
// Migrate old nodes to new format
export const migrateNode = (node: SceneNode): SceneNode => {
  // Add default values for new optional properties
  if (node.type === 'TEXT') {
    const textNode = node as TextNode;
    return {
      ...textNode,
      fontFamily: textNode.fontFamily || 'Inter, sans-serif',
      fontWeight: textNode.fontWeight || 'normal',
      textAlign: textNode.textAlign || 'left',
      // ... other defaults
    };
  }
  // ... handle other types
  return node;
};
```

**Tasks**:
- [ ] Create migration utility
- [ ] Add migration on state load
- [ ] Test with existing saved files

### 1.3 Update Code Generation

**Files to Modify**: `src/App.tsx` (generateCSS, generateReact functions)

**Tasks**:
- [ ] Update `generateCSS` to include new properties
- [ ] Update `generateReact` to include new properties
- [ ] Test code generation with new properties
- [ ] Ensure backward compatibility

**Deliverables**:
- ✅ Extended type definitions
- ✅ Migration utilities
- ✅ Updated code generation
- ✅ Backward compatibility maintained

---

## Phase 2: Typography System

**Duration**: 2-3 weeks  
**Priority**: High  
**Dependencies**: Phase 1

### 2.1 Font System

**New File**: `src/utils/fonts.ts`

```typescript
export const FONT_FAMILIES = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'System UI',
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Courier New',
] as const;

export const FONT_WEIGHTS = [
  { label: 'Thin', value: '100' },
  { label: 'Extra Light', value: '200' },
  { label: 'Light', value: '300' },
  { label: 'Regular', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'Semi Bold', value: '600' },
  { label: 'Bold', value: '700' },
  { label: 'Extra Bold', value: '800' },
  { label: 'Black', value: '900' },
] as const;
```

**Tasks**:
- [ ] Create font system constants
- [ ] Add font loading utilities
- [ ] Create font preview component
- [ ] Integrate with inspector

### 2.2 Typography Inspector UI

**Files to Modify**: `src/App.tsx` (Inspector section)

**New Components** (consider extracting to separate files):
- Font Family Selector (dropdown with preview)
- Font Weight Selector
- Line Height Input (number or ratio)
- Letter Spacing Input
- Text Alignment Buttons
- Text Decoration Toggles

**Tasks**:
- [ ] Create typography section in inspector
- [ ] Add font family dropdown
- [ ] Add font weight selector
- [ ] Add line height input
- [ ] Add letter spacing input
- [ ] Add text alignment buttons
- [ ] Add text decoration toggles
- [ ] Style to match existing UI

### 2.3 Typography Rendering

**Files to Modify**: `src/App.tsx` (drawNode function)

**Tasks**:
- [ ] Update text rendering to use fontFamily
- [ ] Apply fontWeight to canvas font
- [ ] Handle lineHeight (multi-line text support)
- [ ] Apply letterSpacing
- [ ] Apply textAlign
- [ ] Apply textDecoration
- [ ] Test with various font combinations

### 2.4 Inline Text Editing

**New Feature**: Click text to edit inline

**Tasks**:
- [ ] Add double-click handler for text nodes
- [ ] Create inline text input overlay
- [ ] Handle text editing state
- [ ] Update content on blur/enter
- [ ] Style editing UI

**Deliverables**:
- ✅ Complete typography system
- ✅ Typography inspector UI
- ✅ Typography rendering
- ✅ Inline text editing

---

## Phase 3: Layout & Spacing

**Duration**: 2 weeks  
**Priority**: High  
**Dependencies**: Phase 1

### 3.1 Layout Properties

**Files to Modify**: `src/App.tsx`

#### Add to FrameNode Inspector

**New Controls**:
- Alignment (align-items): Visual button group
- Justification (justify-content): Visual button group
- Flex Wrap: Toggle button
- Margin: Individual side inputs or unified input

**Tasks**:
- [ ] Add alignment controls (start/center/end/stretch)
- [ ] Add justification controls (start/center/end/space-between/etc.)
- [ ] Add flex wrap toggle
- [ ] Add margin controls
- [ ] Style controls to match existing UI

### 3.2 Layout Calculation Updates

**Files to Modify**: `src/App.tsx` (calculateLayout function)

**Tasks**:
- [ ] Update layout engine to respect alignItems
- [ ] Update layout engine to respect justifyContent
- [ ] Handle flexWrap (multi-line layouts)
- [ ] Apply margin to children
- [ ] Test edge cases

### 3.3 Layout Rendering

**Files to Modify**: `src/App.tsx` (generateCSS function)

**Tasks**:
- [ ] Generate CSS for alignItems
- [ ] Generate CSS for justifyContent
- [ ] Generate CSS for flexWrap
- [ ] Generate CSS for margin
- [ ] Test code generation

**Deliverables**:
- ✅ Layout controls in inspector
- ✅ Layout calculation updates
- ✅ Layout code generation

---

## Phase 4: Visual Effects

**Duration**: 2-3 weeks  
**Priority**: Medium  
**Dependencies**: Phase 1

### 4.1 Border System

**New File**: `src/utils/borders.ts`

```typescript
export const BORDER_STYLES = ['solid', 'dashed', 'dotted', 'none'] as const;
export const BORDER_PRESETS = {
  none: { width: 0, style: 'none' },
  thin: { width: 1, style: 'solid' },
  medium: { width: 2, style: 'solid' },
  thick: { width: 4, style: 'solid' },
} as const;
```

**Tasks**:
- [ ] Create border utilities
- [ ] Add border controls to inspector
- [ ] Add border color picker
- [ ] Add border width input
- [ ] Add border style selector
- [ ] Add individual side controls (optional)
- [ ] Update rendering to draw borders
- [ ] Update code generation

### 4.2 Shadow System

**New File**: `src/utils/shadows.ts`

```typescript
export const SHADOW_PRESETS = {
  none: 'none',
  small: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  medium: '0px 4px 6px rgba(0, 0, 0, 0.1)',
  large: '0px 10px 15px rgba(0, 0, 0, 0.1)',
  glow: '0px 0px 20px rgba(59, 130, 246, 0.5)',
  solid: '0px 0px 0px 1px rgba(0, 0, 0, 0.1)',
} as const;

export interface ShadowConfig {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: Color;
}
```

**Tasks**:
- [ ] Create shadow presets
- [ ] Create shadow builder utility
- [ ] Add shadow controls to inspector
- [ ] Add shadow preset selector
- [ ] Add custom shadow builder (advanced)
- [ ] Update rendering (canvas doesn't support box-shadow, need workaround)
- [ ] Update code generation

**Note**: Canvas doesn't support CSS box-shadow. Options:
1. Draw shadow manually (complex, performance impact)
2. Only show in code generation (recommended)
3. Use filter effects (limited browser support)

### 4.3 Opacity System

**Tasks**:
- [ ] Add opacity slider to inspector
- [ ] Apply opacity in rendering (ctx.globalAlpha)
- [ ] Update code generation
- [ ] Test with various node types

### 4.4 Background System

**Tasks**:
- [ ] Add background type selector (solid/gradient/image)
- [ ] Add gradient builder UI
- [ ] Add background image upload
- [ ] Add background position/size controls
- [ ] Update rendering for gradients/images
- [ ] Update code generation

**Deliverables**:
- ✅ Border system
- ✅ Shadow system
- ✅ Opacity controls
- ✅ Background system

---

## Phase 5: Design System

**Duration**: 3-4 weeks  
**Priority**: Medium  
**Dependencies**: Phases 1-4

### 5.1 Design Tokens Structure

**New File**: `src/types/designSystem.ts`

```typescript
export interface DesignSystem {
  colors: {
    [key: string]: Color;
  };
  typography: {
    fonts: string[];
    scales: {
      [key: string]: {
        fontSize: number;
        lineHeight: number;
        fontWeight: string;
      };
    };
  };
  spacing: {
    [key: string]: number;
  };
  radius: {
    [key: string]: number;
  };
  shadows: {
    [key: string]: string;
  };
}
```

**Tasks**:
- [ ] Define design system types
- [ ] Create default design system
- [ ] Add design system to state
- [ ] Create design system persistence

### 5.2 Color Tokens

**New File**: `src/components/DesignSystem/ColorTokens.tsx`

**Tasks**:
- [ ] Create color token manager UI
- [ ] Add color picker for tokens
- [ ] Add token name input
- [ ] Display color palette
- [ ] Allow editing/deleting tokens
- [ ] Integrate tokens into color picker

### 5.3 Typography Scale

**New File**: `src/components/DesignSystem/TypographyScale.tsx`

**Tasks**:
- [ ] Create typography scale manager
- [ ] Add scale presets (h1, h2, body, etc.)
- [ ] Allow custom scale definitions
- [ ] Integrate scale into text inspector
- [ ] Apply scale to text nodes

### 5.4 Spacing & Radius Tokens

**Tasks**:
- [ ] Create spacing token manager
- [ ] Create radius token manager
- [ ] Integrate tokens into inspector
- [ ] Apply tokens to nodes

### 5.5 Design System UI

**New Component**: Design System Panel

**Tasks**:
- [ ] Create design system sidebar tab
- [ ] Add sections for each token type
- [ ] Add import/export functionality
- [ ] Add preset design systems
- [ ] Style to match existing UI

**Deliverables**:
- ✅ Design system structure
- ✅ Color tokens
- ✅ Typography scale
- ✅ Spacing & radius tokens
- ✅ Design system UI

---

## Phase 6: Enhanced Inspector

**Duration**: 2-3 weeks  
**Priority**: Medium  
**Dependencies**: Phases 1-5

### 6.1 Inspector Refactoring

**Goal**: Extract inspector into separate component for maintainability

**New File**: `src/components/Inspector/PropertyInspector.tsx`

**Tasks**:
- [ ] Extract inspector from App.tsx
- [ ] Create property section components
- [ ] Add collapsible sections
- [ ] Add section icons
- [ ] Improve visual hierarchy

### 6.2 Categorized Properties

**Sections**:
- Layout (position, size, margin, padding)
- Typography (font, weight, spacing, alignment)
- Appearance (fill, border, radius, opacity)
- Effects (shadow, filters)
- Background (color, gradient, image)

**Tasks**:
- [ ] Organize properties into sections
- [ ] Add section headers
- [ ] Make sections collapsible
- [ ] Add section icons
- [ ] Style sections consistently

### 6.3 Visual Controls

**Tasks**:
- [ ] Create visual alignment picker
- [ ] Create visual spacing controls
- [ ] Create visual color picker (enhanced)
- [ ] Create visual shadow builder
- [ ] Add previews where helpful

### 6.4 Preset Selectors

**Tasks**:
- [ ] Add preset dropdowns for common values
- [ ] Add quick action buttons
- [ ] Add "Reset to default" options
- [ ] Add "Copy from..." options

**Deliverables**:
- ✅ Refactored inspector
- ✅ Categorized properties
- ✅ Visual controls
- ✅ Preset selectors

---

## Phase 7: Advanced Features

**Duration**: 4-6 weeks  
**Priority**: Low  
**Dependencies**: Phases 1-6

### 7.1 Multi-Project System

**New File**: `src/types/project.ts`

```typescript
export interface Project {
  id: string;
  name: string;
  designState: DesignState;
  designSystem: DesignSystem;
  createdAt: Date;
  updatedAt: Date;
}
```

**Tasks**:
- [ ] Create project type
- [ ] Add project management state
- [ ] Create project list UI
- [ ] Add project creation/deletion
- [ ] Add tab system
- [ ] Add project switching
- [ ] Add project persistence

### 7.2 Component Library

**New File**: `src/components/ComponentLibrary/ComponentLibrary.tsx`

**Tasks**:
- [ ] Create component library UI
- [ ] Add component browser
- [ ] Add component preview
- [ ] Add component insertion
- [ ] Add component organization
- [ ] Add component search

### 7.3 Image Upload UI

**Tasks**:
- [ ] Add image upload button to toolbar
- [ ] Create image upload dialog
- [ ] Add drag-and-drop support
- [ ] Add image preview
- [ ] Handle upload errors
- [ ] Add image optimization (optional)

### 7.4 Responsive Preview

**Tasks**:
- [ ] Add breakpoint system
- [ ] Add viewport size selector
- [ ] Add responsive preview mode
- [ ] Add breakpoint-specific properties (optional)

### 7.5 Export System

**Tasks**:
- [ ] Add export menu
- [ ] Add PNG export
- [ ] Add SVG export
- [ ] Add PDF export (optional)
- [ ] Add code export (enhance existing)

### 7.6 AI Features (Future)

**Note**: This requires external API integration

**Tasks**:
- [ ] Research AI API options
- [ ] Design AI integration architecture
- [ ] Add "Refine element" feature
- [ ] Add chat interface
- [ ] Handle API responses
- [ ] Add error handling

**Deliverables**:
- ✅ Multi-project system
- ✅ Component library
- ✅ Image upload UI
- ✅ Responsive preview
- ✅ Export system
- ⏳ AI features (future)

---

## Testing Strategy

### Unit Tests

**Files to Create**:
- `src/utils/__tests__/layout.test.ts`
- `src/utils/__tests__/typography.test.ts`
- `src/utils/__tests__/borders.test.ts`
- `src/utils/__tests__/shadows.test.ts`

**Tasks**:
- [ ] Test layout calculations
- [ ] Test typography utilities
- [ ] Test border utilities
- [ ] Test shadow utilities
- [ ] Test code generation

### Integration Tests

**Tasks**:
- [ ] Test state updates
- [ ] Test rendering pipeline
- [ ] Test inspector interactions
- [ ] Test code generation

### Manual Testing Checklist

For each feature:
- [ ] Create element with feature
- [ ] Modify feature property
- [ ] Verify rendering
- [ ] Verify code generation
- [ ] Test undo/redo
- [ ] Test save/load
- [ ] Test edge cases

---

## Timeline & Milestones

### Phase 1: Foundation (Weeks 1-2)
- Week 1: Type extensions, migration utilities
- Week 2: Code generation updates, testing

### Phase 2: Typography (Weeks 3-5)
- Week 3: Font system, inspector UI
- Week 4: Rendering updates, inline editing
- Week 5: Testing, polish

### Phase 3: Layout (Weeks 6-7)
- Week 6: Layout controls, calculation updates
- Week 7: Rendering, code generation, testing

### Phase 4: Visual Effects (Weeks 8-10)
- Week 8: Border system
- Week 9: Shadow system, opacity
- Week 10: Background system, testing

### Phase 5: Design System (Weeks 11-14)
- Week 11: Design system structure
- Week 12: Color & typography tokens
- Week 13: Spacing & radius tokens
- Week 14: Design system UI, testing

### Phase 6: Enhanced Inspector (Weeks 15-17)
- Week 15: Inspector refactoring
- Week 16: Categorized properties, visual controls
- Week 17: Preset selectors, polish

### Phase 7: Advanced Features (Weeks 18-23)
- Week 18-19: Multi-project system
- Week 20: Component library
- Week 21: Image upload, responsive preview
- Week 22: Export system
- Week 23: Testing, polish

**Total Estimated Duration**: 23 weeks (~6 months)

### Milestones

- **M1** (Week 2): Foundation complete
- **M2** (Week 5): Typography complete
- **M3** (Week 7): Layout complete
- **M4** (Week 10): Visual effects complete
- **M5** (Week 14): Design system complete
- **M6** (Week 17): Enhanced inspector complete
- **M7** (Week 23): All features complete

---

## Risk Management

### Technical Risks

1. **Canvas Limitations**
   - Risk: Canvas doesn't support all CSS features
   - Mitigation: Use workarounds or only show in code generation

2. **Performance**
   - Risk: Too many features slow down rendering
   - Mitigation: Optimize rendering, use memoization, profile regularly

3. **State Complexity**
   - Risk: State becomes too complex
   - Mitigation: Keep normalized structure, use TypeScript strictly

### Scope Risks

1. **Feature Creep**
   - Risk: Adding too many features at once
   - Mitigation: Stick to plan, prioritize phases

2. **Time Overruns**
   - Risk: Phases take longer than estimated
   - Mitigation: Regular reviews, adjust scope if needed

---

## Success Criteria

### Phase Completion Criteria

Each phase is complete when:
- ✅ All tasks in phase are done
- ✅ Features work as specified
- ✅ Code is tested
- ✅ Documentation is updated
- ✅ No regressions introduced

### Overall Success Criteria

Project is successful when:
- ✅ All features from comparison are implemented
- ✅ Code quality is maintained
- ✅ Performance is acceptable
- ✅ Documentation is complete
- ✅ Users can create designs with all features

---

## Next Steps

1. **Review this plan** with team/stakeholders
2. **Prioritize phases** based on needs
3. **Set up project tracking** (issues, milestones)
4. **Begin Phase 1** - Foundation Extensions
5. **Regular reviews** - Weekly progress checks

---

## Appendix: File Structure

After implementation, the codebase should look like:

```
src/
├── App.tsx                    # Main app (refactored)
├── components/
│   ├── Inspector/
│   │   ├── PropertyInspector.tsx
│   │   ├── TypographySection.tsx
│   │   ├── LayoutSection.tsx
│   │   └── ...
│   ├── DesignSystem/
│   │   ├── ColorTokens.tsx
│   │   ├── TypographyScale.tsx
│   │   └── ...
│   └── ComponentLibrary/
│       └── ComponentLibrary.tsx
├── types/
│   ├── nodes.ts              # Node type definitions
│   ├── designSystem.ts       # Design system types
│   └── project.ts            # Project types
├── utils/
│   ├── migration.ts           # Migration utilities
│   ├── fonts.ts               # Font system
│   ├── borders.ts             # Border utilities
│   ├── shadows.ts             # Shadow utilities
│   ├── layout.ts              # Layout calculations
│   └── codegen.ts             # Code generation
└── hooks/
    ├── useDesignState.ts     # State management
    └── useCanvas.ts           # Canvas rendering
```

---

**Last Updated**: [Date]  
**Status**: Planning  
**Next Review**: [Date]

