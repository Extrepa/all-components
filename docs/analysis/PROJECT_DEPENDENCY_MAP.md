# Project Dependency Map

**Date:** 2027-01-09  
**Status:** Complete  
**Phase:** Phase 5

## Overview

Comprehensive map of dependencies between projects, shared utilities, and external packages.

## Shared Code Dependencies

### Active Usage

#### `shared/hooks/useHistory.ts`
**Projects Using:**
- ✅ **figma-clone-engine** - Via `@/shared/*` path alias
- ✅ **multi-tool-app** - Via `@/shared/*` path alias
- ✅ **svg_editor** - Via `@/shared/*` path alias

**Status:** Active, but requires npm install in shared for TypeScript compilation

#### `shared/hooks/useKeyboardShortcuts.ts`
**Projects Using:**
- ✅ **figma-clone-engine** - Via `@/shared/*` path alias
- ✅ **multi-tool-app** - Via `@/shared/*` path alias
- ✅ **svg_editor** - Via `@/shared/*` path alias

**Status:** Active, but requires npm install in shared for TypeScript compilation

#### `shared/utils/paper/pathOperations.ts`
**Projects Using:**
- ✅ **multi-tool-app** - Via `@/shared/*` path alias
- ✅ **svg_editor** - Via `@/shared/*` path alias

**Status:** Active, but requires npm install in shared for TypeScript compilation

#### `shared/utils/export/zipExporter.ts`
**Projects Using:**
- ✅ **figma-clone-engine** - Via `@/shared/*` path alias

**Status:** Active, but requires npm install in shared for TypeScript compilation

#### `shared/utils/historyManager.ts`
**Projects Using:**
- ✅ **multi-tool-app** - Direct import

**Status:** Active

### Planned Usage

#### `shared/design-system/`
**Projects Planned:**
- ⏳ **errl_scene_builder** - Pilot project
- ⏳ **errl_vibecheck** - Planned
- ⏳ **multi-tool-app** - Planned
- ⏳ **figma-clone-engine** - Planned
- ⏳ **errl-forge---asset-remixer** - Planned
- ⏳ **errl-portal** - Planned

**Status:** Consolidation planned, migrations pending

## External Dependency Patterns

### React + Vite Projects

**Projects:**
- errl_vibecheck (React 19, Vite 6)
- errl-forge---asset-remixer (React 19, Vite)
- figma-clone-engine (React 18, Vite 4)
- errl-fluid (React 18, Vite)
- Errl_Components (React 19, Vite 7)
- psychedelic-liquid-light-show (React 19, Vite)
- multi-tool-app (React 18, Vite 7)
- liquid-light-show-simulator (Vite)
- errlstory_pivot_v8 (React 19, Vite 6)
- universal-component-extractor (React, Vite, Electron)
- errl-portal (React 19, Vite, Electron)
- svg_editor (Vite)
- errl-club (Vite)
- errl_scene_builder (Vite)

**Common Dependencies:**
- React (18 or 19)
- Vite (4-7)
- TypeScript
- TailwindCSS (various versions)

### Next.js Projects

**Projects:**
- errl-galaxy (Next.js 14, React 18)

### Three.js Projects

**Projects:**
- errl-fluid (@react-three/cannon, @react-spring/three)
- Errl_Components (@react-three/fiber, @react-three/drei)
- errl-club (three.js)
- errl-galaxy (three.js)
- psychedelic-liquid-light-show (PIXI.js)

### AI/API Dependencies

**Projects:**
- errl_vibecheck (@google/genai ^1.22.0)
- errl-forge---asset-remixer (@google/genai ^1.30.0)
- universal-component-extractor (@anthropic-ai/sdk ^0.27.0)

### Paper.js Projects

**Projects:**
- multi-tool-app (paper ^0.12.18)
- svg_editor (paper ^0.12.18)
- shared (paper ^0.12.18)

### Editor Dependencies

**Projects:**
- errl-portal (@monaco-editor/react, fabric.js)

## Project Relationships

### Component Libraries

1. **Errl_Components**
   - Used by: errl-portal (some components)
   - Status: Standalone component library

2. **all-components**
   - Used by: Reference only
   - Status: Archive/snapshot, not active library

### Portal/Launcher

3. **errl-portal**
   - Integrates: Studio projects, components from Errl_Components
   - Status: Main portal application

### Design Tools

4. **figma-clone-engine**
   - Uses: shared hooks, shared export utilities
   - Status: Standalone design tool

5. **multi-tool-app**
   - Uses: shared hooks, shared Paper.js utilities, shared history manager
   - Combines: SVG editing, FX Lab, Scene Maker
   - Status: Unified creative suite

6. **svg_editor**
   - Uses: shared hooks, shared Paper.js utilities
   - Status: SVG editing tool (React migration in progress)

### AI-Powered Tools

7. **errl_vibecheck**
   - Uses: @google/genai
   - Status: AI visual coding playground

8. **errl-forge---asset-remixer**
   - Uses: @google/genai, MapleStory.io API
   - Status: Asset generation tool

9. **universal-component-extractor**
   - Uses: @anthropic-ai/sdk
   - Status: Component extraction tool

### 3D/Visualization

10. **errl-fluid**
    - Uses: @react-three/cannon, @react-spring/three
    - Status: Fluid simulation

11. **errl-galaxy**
    - Uses: Next.js, three.js
    - Status: Galaxy visualization

12. **errl-club**
    - Uses: three.js, @supabase/supabase-js
    - Status: 3D nightclub

13. **psychedelic-liquid-light-show**
    - Uses: PIXI.js, React 19
    - Status: Liquid light show

14. **liquid-light-show-simulator**
    - Uses: Vite, TypeScript
    - Status: Light show simulator

### Game Development

15. **errlstory_pivot_v8**
    - Uses: React 19, Vite
    - Status: Game project

### Scene Building

16. **errl_scene_builder**
    - Uses: Vite, React
    - Status: Scene building tool

### Specialized

17. **ErrlFXLab**
    - Status: Creative coding lab (Vanilla JS)

18. **ErrlOS-Plugin**
    - Status: Obsidian plugin (no external dependencies)

19. **Errl-Verse**
    - Status: Documentation project

20. **rainbowrider**
    - Status: Unity project

## Dependency Issues

### Shared Package Issues

1. **TypeScript Compilation Errors**
   - **Issue:** Projects using shared code cannot compile due to missing React types
   - **Root Cause:** Shared package has React as peerDependency but needs it installed for TypeScript
   - **Affected Projects:** figma-clone-engine, multi-tool-app, svg_editor
   - **Solution:** Run `npm install` in shared directory
   - **Status:** React added to shared devDependencies, needs npm install

2. **Version Inconsistencies**
   - **@google/genai:** errl_vibecheck (^1.22.0) vs errl-forge (^1.30.0)
   - **Recommendation:** Update errl_vibecheck to match errl-forge

## Dependency Graph

```
shared/
├── hooks/
│   ├── useHistory.ts → figma-clone-engine, multi-tool-app, svg_editor
│   └── useKeyboardShortcuts.ts → figma-clone-engine, multi-tool-app, svg_editor
├── utils/
│   ├── paper/ → multi-tool-app, svg_editor
│   ├── export/ → figma-clone-engine
│   └── historyManager.ts → multi-tool-app
└── design-system/ → (planned for 6 projects)

External Dependencies:
├── React 18/19 → 13+ projects
├── Vite → 13+ projects
├── Three.js → 5 projects
├── Paper.js → 2 projects (via shared)
├── @google/genai → 2 projects
└── @anthropic-ai/sdk → 1 project
```

## Next Steps

1. **Fix Shared Package**
   - Run `npm install` in shared directory
   - Verify TypeScript compilation works
   - Test builds for dependent projects

2. **Standardize Versions**
   - Update @google/genai in errl_vibecheck
   - Consider React version standardization (if feasible)

3. **Complete Migrations**
   - Migrate remaining projects to shared hooks
   - Migrate projects to shared design system

4. **Document Dependencies**
   - Keep this map updated
   - Document breaking changes
   - Track migration progress

## Notes

- Most projects are independent
- Shared code is used by 3-4 projects actively
- Design system consolidation is planned but not started
- Dependency issues are primarily TypeScript compilation (not runtime)
- External dependencies are generally up-to-date
