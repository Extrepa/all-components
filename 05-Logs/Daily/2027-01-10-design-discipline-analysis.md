# Design Discipline Analysis - 2027-01-10

## Summary

Analyzed projects with similar design disciplines to identify "nexus projects" (multi-tool hubs) and shared patterns across the monorepo.

## Key Findings

### Nexus Projects Identified

1. **multi-tool-app** ⭐ PRIMARY NEXUS
   - Combines: SVG Editing + FX Lab + Scene Maker
   - Design patterns: Dual-viewport, normalized state, Paper.js, inspector panels

2. **figma-clone-engine** ⭐ DESIGN TOOL NEXUS
   - Combines: Vector editing + Component system + Auto-layout
   - Design patterns: Dual-viewport, normalized state, canvas rendering

3. **errl-portal** ⭐ PORTAL NEXUS
   - Combines: Multiple apps (Studio, Gallery, Assets, etc.)
   - Design patterns: Multi-page architecture, shared navigation

### Shared Design Disciplines

1. **Dual-Viewport Pattern** (3 projects)
   - multi-tool-app, figma-clone-engine, errl_scene_builder
   - Left: Detail editing | Right: Overview/composition

2. **Normalized State + Zustand** (3 projects)
   - multi-tool-app, errl_scene_builder, figma-clone-engine
   - O(1) lookups, easy updates, simple serialization

3. **Inspector Panel Pattern** (4 projects)
   - multi-tool-app, figma-clone-engine, errl_scene_builder, svg_editor
   - Right sidebar, contextual content, property editing

4. **Paper.js Vector Editing** (2 projects)
   - svg_editor, multi-tool-app
   - Already consolidated in `shared/utils/paper/`

5. **Layer Management** (3 projects)
   - errl_scene_builder, multi-tool-app, figma-clone-engine
   - Tree view, drag-drop reordering, visibility toggles

## Actions Taken

### ✅ Completed

1. **Created Design Discipline Analysis Document**
   - `/DESIGN_DISCIPLINE_ANALYSIS.md`
   - Comprehensive analysis of shared patterns
   - Project clustering by design discipline
   - Recommendations for consolidation

2. **Integrated Design System into figma-clone-engine**
   - Added `@errl-design-system` alias to vite.config.ts
   - Added TypeScript path mapping
   - Imported design system CSS
   - Wrapped app with ThemeProvider
   - Added ThemeControls to FloatingTopNav

### 📋 Recommendations Created

1. **Extract Dual-Viewport Utilities**
   - Create `shared/components/DualViewport/`
   - Share between nexus projects

2. **Extract Inspector Panel Components**
   - Create `shared/components/Inspector/`
   - Share property editing patterns

3. **Document Normalized State Patterns**
   - Create guide for normalized state architecture
   - Share best practices

## Project Clustering

### Cluster 1: Creative Tools (Nexus Projects)
- multi-tool-app ⭐
- figma-clone-engine ⭐
- errl_scene_builder

**Shared:** Dual-viewport, normalized state, inspector panels, layer management

### Cluster 2: Vector Editing Tools
- svg_editor
- multi-tool-app (SVG mode)
- figma-clone-engine (vector mode)

**Shared:** Paper.js, path operations, boolean operations

### Cluster 3: Scene Composition Tools
- errl_scene_builder
- multi-tool-app (Scene mode)

**Shared:** Layer management, entity system, scene graph

## Next Steps

1. ⏳ Extract shared dual-viewport utilities
2. ⏳ Extract shared inspector panel components
3. ⏳ Document normalized state patterns
4. ⏳ Extract shared layer management components

## Files Created/Modified

- ✅ Created: `/DESIGN_DISCIPLINE_ANALYSIS.md`
- ✅ Modified: `figma-clone-engine/vite.config.ts`
- ✅ Modified: `figma-clone-engine/tsconfig.json`
- ✅ Modified: `figma-clone-engine/src/main.tsx`
- ✅ Modified: `figma-clone-engine/src/components/FloatingTopNav.tsx`
