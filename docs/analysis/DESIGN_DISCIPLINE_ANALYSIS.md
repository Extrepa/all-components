# Design Discipline Analysis: Nexus Projects & Similar Patterns

**Generated:** 2027-01-10  
**Purpose:** Identify projects with similar design disciplines, architecture patterns, and UI/UX approaches

---

## Executive Summary

This analysis identifies **nexus projects** (multi-tool hubs) and projects sharing similar design disciplines across the monorepo. Key findings:

- **3 Nexus Projects** combine multiple tools/disciplines
- **5+ Projects** share dual-viewport design patterns
- **6+ Projects** use normalized state + Zustand architecture
- **4+ Projects** implement similar inspector panel patterns
- **3 Projects** share Paper.js vector editing patterns

---

## 1. Nexus Projects (Multi-Tool Hubs)

### 1.1 multi-tool-app ⭐ PRIMARY NEXUS

**Type:** Unified Creative Suite  
**Combines:** SVG Editing + FX Lab + Scene Maker

**Design Disciplines:**
- **Dual-Viewport System**: Focus Window (left) + Stage Canvas (right)
- **Normalized State**: Zustand store with flat node structure
- **Paper.js Integration**: Vector operations, path editing
- **Inspector Panels**: Contextual sidebars (SVG/FX/Scene inspectors)
- **Asset Library**: Bottom shelf with thumbnails
- **Mode Switching**: Seamless transitions between SVG/FX/Scene modes
- **Master-Instance Pattern**: Library assets → Scene instances

**Key Architecture:**
```typescript
// Normalized state structure
interface Project {
  library: {
    assets: Record<AssetId, Asset>;  // Source of truth
  };
  scene: {
    layers: Layer[];
    instances: Instance[];  // References library assets
  };
}
```

**Similar Projects:**
- `figma-clone-engine` - Similar dual-viewport, normalized state
- `errl_scene_builder` - Similar scene composition, layer management

---

### 1.2 errl-portal ⭐ SECONDARY NEXUS

**Type:** Portal Hub  
**Combines:** Multiple apps (Studio, Gallery, Assets, etc.)

**Design Disciplines:**
- **Multi-Page Architecture**: Static pages + React Studio app
- **Shared Components**: PortalHeader, navigation system
- **Design System Integration**: Uses errl-design-system
- **Unified Navigation**: Consistent header across all pages

**Similar Projects:**
- Projects using shared navigation patterns
- Projects integrated into portal ecosystem

---

### 1.3 figma-clone-engine ⭐ DESIGN TOOL NEXUS

**Type:** Design Tool  
**Combines:** Vector editing + Component system + Auto-layout

**Design Disciplines:**
- **Dual-Viewport**: Canvas + Inspector panels
- **Normalized State**: Flat node structure (O(1) lookups)
- **Component System**: Master/Instance pattern
- **Auto-Layout**: Frame-based layout system
- **Canvas Rendering**: HTML5 Canvas with optimized draw calls

**Similar Projects:**
- `multi-tool-app` - Similar dual-viewport, normalized state
- `svg_editor` - Similar vector editing patterns

---

## 2. Shared Design Disciplines

### 2.1 Dual-Viewport Pattern

**Projects:**
- `multi-tool-app` - Focus Window + Stage Canvas
- `figma-clone-engine` - Canvas + Inspector panels
- `errl_scene_builder` - Scene Viewport + Inspector panels

**Pattern Characteristics:**
- Left: Detailed editing view (high zoom, precision tools)
- Right: Overview/composition view (full scene, drag-drop)
- Synchronized selection between viewports
- Contextual toolbars based on active viewport

**Recommendation:** Extract shared dual-viewport utilities

---

### 2.2 Normalized State + Zustand

**Projects:**
- `multi-tool-app` - Zustand store with normalized project state
- `errl_scene_builder` - Zustand store with normalized scene graph
- `figma-clone-engine` - Normalized design state (not Zustand, but similar pattern)

**Pattern Characteristics:**
```typescript
// Common pattern
interface NormalizedState {
  entities: Record<Id, Entity>;  // O(1) lookups
  rootIds: Id[];                  // Hierarchy definition
  selection: Id[];                // Current selection
}
```

**Benefits:**
- Fast lookups (O(1) vs O(n))
- Easy updates (update one entity without touching others)
- Simple serialization (save/load as JSON)
- Minimal re-renders

**Recommendation:** Create shared normalized state utilities

---

### 2.3 Inspector Panel Pattern

**Projects:**
- `multi-tool-app` - ContextualPanel (SVG/FX/Scene inspectors)
- `figma-clone-engine` - InspectorPanel (property editing)
- `errl_scene_builder` - InspectorPanel (entity properties)
- `svg_editor` - Property panels

**Pattern Characteristics:**
- Right sidebar panel
- Contextual content based on selection
- Property editing (position, size, style, etc.)
- Tabbed sections for different property groups

**Recommendation:** Extract shared inspector panel components

---

### 2.4 Paper.js Vector Editing

**Projects:**
- `svg_editor` - Comprehensive Paper.js integration
- `multi-tool-app` - Paper.js for path operations

**Shared Utilities:**
- `shared/utils/paper/pathOffset.ts` - Path offset operations
- `shared/utils/paper/pathSimplifier.ts` - Path simplification
- `shared/utils/paper/booleanOps.ts` - Boolean operations

**Pattern Characteristics:**
- Path manipulation (offset, simplify, boolean)
- Vector operations (union, subtract, intersect)
- Coordinate transformations
- Paper.js wrapper patterns

**Status:** ✅ Already consolidated in `shared/utils/paper/`

---

### 2.5 Layer Management Pattern

**Projects:**
- `errl_scene_builder` - LayerPanel with drag-drop reordering
- `multi-tool-app` - Scene layer tree in inspector
- `figma-clone-engine` - LayersPanel with hierarchy

**Pattern Characteristics:**
- Tree view of layers
- Drag-drop reordering
- Visibility toggles
- Lock/unlock functionality
- Z-index management

**Recommendation:** Extract shared layer management components

---

### 2.6 History/Undo-Redo Pattern

**Projects:**
- `multi-tool-app` - History in Zustand store
- `errl_scene_builder` - HistoryManager utility
- `figma-clone-engine` - useDesignHistory hook
- `svg_editor` - useHistory hook
- `psychedelic-liquid-light-show` - useHistory hook

**Pattern Variations:**
1. **Past/Present/Future** (figma-clone-engine, multi-tool-app)
2. **Index-Based Array** (errl_scene_builder, svg_editor)

**Status:** ✅ Already consolidated in `shared/utils/historyManager.ts`

---

### 2.7 Canvas Rendering Patterns

**Projects:**
- `figma-clone-engine` - HTML5 Canvas rendering
- `multi-tool-app` - Paper.js canvas rendering
- `errl_scene_builder` - SVG rendering

**Pattern Characteristics:**
- Optimized draw calls
- Viewport transformations
- Coordinate system conversions (screen ↔ world)
- Selection rendering
- Grid/ruler overlays

**Recommendation:** Document shared canvas patterns

---

## 3. Design System Integration Status

### Projects Using errl-design-system ✅

1. ✅ `errl_scene_builder` - Fully integrated
2. ✅ `errl-fluid` - Fully integrated
3. ✅ `errl_vibecheck` - Fully integrated
4. ✅ `errl-forge---asset-remixer` - Fully integrated
5. ✅ `multi-tool-app` - Fully integrated
6. ✅ `svg_editor` - Fully integrated
7. ✅ `psychedelic-liquid-light-show` - Fully integrated
8. ✅ `errlstory_pivot_v8` - Fully integrated
9. ✅ `errl-portal` (Studio) - Fully integrated

### Projects NOT Using Design System ⚠️

- `theme-lab` - Vanilla TypeScript (not React)

### Projects Recently Integrated ✅

- ✅ `figma-clone-engine` - **JUST INTEGRATED** - Added ThemeProvider and ThemeControls

---

## 4. Technology Stack Patterns

### React + Vite + Zustand + TailwindCSS

**Projects:**
- `multi-tool-app`
- `errl_scene_builder`
- `errl_vibecheck`
- `errl-forge---asset-remixer`
- `svg_editor`
- `figma-clone-engine` (no TailwindCSS)

**Shared Patterns:**
- React hooks for state management
- Zustand for global state
- Vite for build tooling
- TypeScript for type safety

---

## 5. Recommendations

### High Priority

1. ✅ **COMPLETE** - Integrate Design System into figma-clone-engine
   - ✅ Added ThemeProvider
   - ✅ Added ThemeControls
   - ✅ Configured aliases

2. **Extract Dual-Viewport Utilities**
   - Create `shared/components/DualViewport/`
   - Share between `multi-tool-app`, `figma-clone-engine`, `errl_scene_builder`

3. **Extract Inspector Panel Components**
   - Create `shared/components/Inspector/`
   - Share property editing patterns

4. **Document Normalized State Patterns**
   - Create guide for normalized state architecture
   - Share best practices

### Medium Priority

5. **Extract Layer Management Components**
   - Create `shared/components/LayerPanel/`
   - Share drag-drop reordering logic

6. **Consolidate Canvas Rendering Patterns**
   - Document shared patterns
   - Create utilities for coordinate transformations

### Low Priority

7. **Create Design Discipline Documentation**
   - Document each pattern
   - Provide examples and best practices

---

## 6. Project Clustering by Design Discipline

### Cluster 1: Creative Tools (Nexus Projects)
- `multi-tool-app` ⭐
- `figma-clone-engine` ⭐
- `errl_scene_builder`

**Shared:** Dual-viewport, normalized state, inspector panels, layer management

### Cluster 2: Vector Editing Tools
- `svg_editor`
- `multi-tool-app` (SVG mode)
- `figma-clone-engine` (vector mode)

**Shared:** Paper.js, path operations, boolean operations

### Cluster 3: Scene Composition Tools
- `errl_scene_builder`
- `multi-tool-app` (Scene mode)

**Shared:** Layer management, entity system, scene graph

### Cluster 4: Visual Effects Tools
- `errl_vibecheck`
- `multi-tool-app` (FX mode)
- `psychedelic-liquid-light-show`

**Shared:** Visual effects, animation systems

---

## 7. Next Steps

1. ✅ **Complete** - Design system integration across all React projects
2. ✅ **Complete** - Identify projects with similar design disciplines
3. ✅ **Complete** - Integrate design system into `figma-clone-engine`
4. ⏳ **Pending** - Extract shared dual-viewport utilities
5. ⏳ **Pending** - Extract shared inspector panel components
6. ⏳ **Pending** - Document normalized state patterns
7. ⏳ **Pending** - Extract shared layer management components

---

## Appendix: Design Pattern Reference

### Dual-Viewport Pattern
```typescript
interface DualViewportProps {
  leftViewport: ReactNode;   // Focus/detail view
  rightViewport: ReactNode;   // Overview/composition view
  syncSelection?: boolean;    // Sync selection between views
}
```

### Normalized State Pattern
```typescript
interface NormalizedState<T> {
  entities: Record<string, T>;
  rootIds: string[];
  selection: string[];
}
```

### Inspector Panel Pattern
```typescript
interface InspectorPanelProps {
  selectedId?: string;
  onPropertyChange: (id: string, property: string, value: any) => void;
  sections: InspectorSection[];
}
```

---

**Last Updated:** 2027-01-10
