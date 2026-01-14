# Migration Guide: Component Libraries Strategy

**Created:** 2027-01-07  
**Priority:** High  
**Complexity:** Low  
**Estimated Time:** 1 week

---

## Overview

This guide clarifies the strategy for three component library collections and establishes clear relationships between them.

**Current State:**
- `Errl_Components` - Active component library (13 components)
- `all-components` - Archive of 199 components from 9 projects
- `errl-portal-shared` - Shared components for errl-portal

**Target State:**
- Clear purpose for each collection
- Defined source of truth
- Migration path for `all-components` (archive vs. active)

---

## Current State Analysis

### `Errl_Components`

**Location:** [`Errl_Components/`](Errl_Components/)

**Purpose:** Active React/Three.js component library

**Contents:**
- 13 components (BubbleButton, BubbleMesh, ErrlContentLayout, TrippyScene, etc.)
- Shaders and stores
- React + Three.js components

**Status:** Active development

**Usage:**
- Imported by projects needing 3D components
- Source of truth for Errl 3D components

---

### `all-components`

**Location:** [`all-components/`](all-components/)

**Purpose:** Archive/snapshot of components from multiple projects

**Contents:**
- 199 component files total
- Components from 9 projects:
  - `errl-club-ui` (50+ components)
  - `figma-clone-engine` (41 components)
  - `errl_scene_builder` (24 components)
  - `errl_vibecheck` (11 components)
  - `errl-forge` (12 components)
  - `Errl_Components` (13 components)
  - `errl-portal` (5 components)
  - `errl-portal-shared` (various)

**Status:** Archive (snapshot from December 22, 2024)

**Usage:**
- Reference/preview
- Component catalog viewer
- Not a live library

**Key Files:**
- `all-components/preview/` - Component preview/catalog
- `all-components/README.md` - Documents as archive

---

### `errl-portal-shared`

**Location:** [`all-components/errl-portal-shared/`](all-components/errl-portal-shared/)

**Purpose:** Shared components and utilities for `errl-portal`

**Contents:**
- Component library catalog
- Project components (bubble-mouse-trail, gravity-sticker-field, etc.)
- SVG utilities
- UI components

**Status:** Active (used by `errl-portal`)

**Usage:**
- Imported by `errl-portal`
- Shared utilities for portal projects

---

## Strategy Decision

### Recommended Strategy

1. **`Errl_Components`** - Keep as active 3D component library
   - Source of truth for React/Three.js components
   - Continue active development

2. **`all-components`** - Keep as archive/reference
   - Document clearly as archive
   - Use for reference/preview only
   - Do not use as source for new projects

3. **`errl-portal-shared`** - Keep as portal-specific shared code
   - Source of truth for portal components
   - Used by `errl-portal` project

### Component Sharing Strategy

**For New Projects:**
- Use `Errl_Components` for 3D components
- Use `errl-portal-shared` for portal-specific components
- Reference `all-components` for examples/inspiration only
- Create project-specific components when needed

**For Existing Projects:**
- Continue using current component sources
- Migrate to shared utilities when beneficial
- Don't force migration if not needed

---

## Step-by-Step Migration Process

### Step 1: Document Current State

1. **Create `COMPONENT_LIBRARY_STRATEGY.md`**
   - Document purpose of each collection
   - Define source of truth
   - Establish usage guidelines

2. **Update `all-components/README.md`**
   - Clearly mark as archive
   - Add warning about not using as source
   - Link to active component libraries

3. **Update `Errl_Components/README.md`**
   - Document as active 3D component library
   - Add usage guidelines
   - Link to other component collections

### Step 2: Clarify Relationships

1. **Document component flow**
   - Which projects use which components
   - How components are shared
   - Migration paths

2. **Create component catalog**
   - List all components in each collection
   - Document purpose and usage
   - Link to source projects

### Step 3: Establish Guidelines

1. **Create usage guidelines**
   - When to use `Errl_Components`
   - When to use `errl-portal-shared`
   - When to reference `all-components`
   - When to create new components

2. **Document component extraction process**
   - How to extract components from projects
   - When to add to shared libraries
   - When to keep project-specific

---

## Code Examples

### Using Errl_Components (Active)

```tsx
// Import from active component library
import { BubbleButton, TrippyScene } from '@/Errl_Components';

function MyComponent() {
  return (
    <TrippyScene>
      <BubbleButton>Click me</BubbleButton>
    </TrippyScene>
  );
}
```

### Using errl-portal-shared (Portal Components)

```tsx
// Import from portal shared components
import { GravityStickerField } from '@/all-components/errl-portal-shared/projects/gravity-sticker-field';

function PortalComponent() {
  return <GravityStickerField />;
}
```

### Referencing all-components (Archive)

```markdown
<!-- Reference only, don't import directly -->
See [all-components/figma-clone-engine/](all-components/figma-clone-engine/) 
for examples of Figma clone components.

For active components, use the source project.
```

---

## Testing Checklist

### Documentation

- [ ] `COMPONENT_LIBRARY_STRATEGY.md` created
- [ ] All READMEs updated
- [ ] Usage guidelines clear
- [ ] Component catalog created

### Relationships

- [ ] Component flow documented
- [ ] Source of truth defined
- [ ] Migration paths clear
- [ ] No confusion about which to use

---

## Rollback Procedures

### If Strategy Changes

1. **Update Documentation**
   - Revise `COMPONENT_LIBRARY_STRATEGY.md`
   - Update READMEs
   - Update guidelines

2. **No Code Changes Needed**
   - Strategy is documentation-only
   - Projects continue using current components
   - No breaking changes

---

## Migration Timeline

**Day 1-2:**
- Analyze current state
- Document findings
- Create strategy document

**Day 3-4:**
- Update all READMEs
- Create component catalog
- Document relationships

**Day 5:**
- Create usage guidelines
- Update project references
- Finalize documentation

---

## Success Criteria

- [ ] Clear purpose for each collection
- [ ] Source of truth defined
- [ ] Usage guidelines established
- [ ] All documentation updated
- [ ] No confusion about which to use

---

## References

- [Component Library Strategy](COMPONENT_LIBRARY_STRATEGY.md) - Detailed strategy
- [Project Similarity Analysis](PROJECT_SIMILARITY_ANALYSIS.md)
- [Consolidation Strategy](CONSOLIDATION_STRATEGY.md)
