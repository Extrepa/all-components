# All Components Catalog

**Date:** 2026-01-10  
**Status:** Complete  
**Total Components:** 199 component files from 9 projects

## Overview

All Components is a reference library containing components copied from various projects in the workspace. It serves as a centralized component catalog for browsing, comparison, and reference.

**Note:** Components are copies, not shared dependencies. This is a snapshot/archive from December 22, 2024.

## Component Organization by Project

### 1. errl-club-ui (50+ Components)

**Largest Collection** - UI components for the errl-club project

**Base Components:**
- Button, Dropdown, InputField, Modal, Slider
- VibesLiquidBar, VibesMarquee

**UI Modules:**
- AssetManagerUI
- AudioPlayer
- CameraSettingsUI
- ControlDock
- ControlsReferenceUI
- And more...

**Screen Components:**
- FriendsList
- MainMenu
- ProfileScreen
- RoomBrowser
- SettingsScreen
- And more...

**Location:** `errl-club-ui/components/` and `errl-club-ui/screens/`

---

### 2. figma-clone-engine (41 Components)

**Editor Components** - React/TypeScript components for the design tool

**Main Components:**
- LayersPanel
- InspectorPanel
- Rulers
- AlignmentGuides

**Inspector System:**
- Controls (FrameControls, RectangleControls, ShapeControls, etc.)
- Sections (PositionSection, LayoutSection, TypographySection, etc.)
- Hooks (useExpandedSections, usePanelResize, etc.)
- Utilities

**Location:** `figma-clone-engine/components/`

---

### 3. errl_scene_builder (24 Components)

**Scene Building Components** - Components for scene composition

**Main Components:**
- AppShell
- AssetPanel
- CanvasSettings
- ErrlEditor
- SceneViewport
- TemplateGrid
- TemplatePicker
- TopToolbar
- VariantSwitcher

**Supporting:**
- ExportDialog
- FxPanel
- FxWeatherPanel
- GuidedSetup
- HelpOverlay
- InspectorPanel
- LayerPanel
- LayerPanelNew
- MainLayout
- PlaybackControls
- RightPanel

**Additional:**
- ErrlSprite
- Viewer
- Hooks (useHistory, useKeyboardShortcuts, useSceneDragDrop)
- Renderer utilities
- Scene utilities

**Location:** `errl_scene_builder/`

---

### 4. Errl_Components (13 Components)

**WebGL Components** - High-performance WebGL-powered components

**Components:**
- ErrlPage (main orchestrator)
- ProjectorRig (shader background)
- InstancedBubbleSystem (bubble rendering)
- ExplosionSystem (particle effects)
- ErrlContentLayout (content wrapper)
- BubbleButton (navigation buttons)
- BubbleMesh (individual bubbles)
- BubblePositionSync (position sync)
- ScrollController (scroll control)
- PerformanceMonitor (FPS tracking)
- TrippyScene (visual effects)
- TriggerButton (trigger buttons)
- ErrorBoundary (error handling)

**Additional:**
- Shaders (fragmentShader.glsl, vertexShader.glsl)
- Stores (useErrlInteractions, useHypnoStore, useScrollStore)

**Location:** `Errl_Components/`

**Note:** See Errl_Components/docs/COMPONENT_CATALOG.md for detailed documentation.

---

### 5. errl_vibecheck (11 Components)

**AI Visual Coding Components** - Components for AI-powered visual coding playground

**Components:**
- App
- Collection
- FeedItem
- Header
- Renderer
- Result
- Screensaver
- And more...

**Location:** `errl_vibecheck/`

---

### 6. errl-forge (12 Components)

**Asset Remixer Components** - Components for asset generation and remixing

**Components:**
- AssetEditor
- AssetLibrary
- AnimationGenerator
- BatchGenerator
- CategorySelector
- DownloadButton
- HitboxEditor
- MyAssetsTab
- PresetsTab
- Settings
- VersionSelector
- ArchivedTab

**Location:** `errl-forge/`

---

### 7. errl-portal (5 Components)

**UI Components** - Basic UI component library

**Components:**
- button.tsx
- card.tsx
- input.tsx
- scroll-area.tsx
- tabs.tsx

**Location:** `errl-portal/ui/`

---

### 8. errl-portal-shared (Multiple Components)

**Shared Components** - Shared components and project-specific components

**Project Components:**
- bubble-mouse-trail/BubbleMouseTrail.tsx
- gravity-sticker-field/GravityStickerField.tsx
- holographic-cursor-trail/HolographicCursorTrail.tsx
- ripple-face/RippleFace.tsx
- sparkle-worklet-pin/SparkleWorkletPin.tsx

**UI Components:**
- badge.tsx
- button.tsx
- card.tsx
- input.tsx
- scroll-area.tsx
- tabs.tsx

**SVG Utilities:**
- cleanupSvgAttribute.ts
- cleanupSvgAttribute.test.ts

**Component Library Catalog:**
- Errl_Component_Catalog/ (HTML catalog)
- Component examples (ascii-orb, control-dock, kaleido-bg, optical-grid, ripple)

**Location:** `errl-portal-shared/`

---

### 9. errl-design-system (Design System)

**Design System Components** - Theme and design system components

**Components:**
- ErrlWrapper.tsx
- ThemeControls.tsx

**Core:**
- ThemeProvider.tsx
- useErrlTheme.ts
- errlDesignSystem.ts

**Location:** `errl-design-system/src/`

---

## Component Categories

### UI Components
- **Base:** Button, Dropdown, InputField, Modal, Slider
- **Portal UI:** button, card, input, scroll-area, tabs
- **Club UI:** 50+ specialized UI components

### Editor Components
- **Design Tools:** LayersPanel, InspectorPanel, Rulers, AlignmentGuides
- **Scene Tools:** AssetPanel, CanvasSettings, SceneViewport

### WebGL/3D Components
- **Errl Components:** ProjectorRig, InstancedBubbleSystem, BubbleMesh
- **Visual Effects:** TrippyScene, ExplosionSystem

### Specialized Components
- **AI Tools:** App, Collection, FeedItem, Renderer (errl_vibecheck)
- **Asset Tools:** AssetEditor, AssetLibrary, AnimationGenerator (errl-forge)
- **Project Components:** BubbleMouseTrail, GravityStickerField, etc. (errl-portal-shared)

## Component Catalog System

### Preview System

**Location:** `preview/` directory

**Features:**
- Interactive component catalog
- Component browsing interface
- Component examples
- Search and filter capabilities

**Files:**
- `preview.html` - Standalone preview
- `preview/src/` - React preview app
- `preview/src/data/componentCatalog.ts` - Component catalog data

### Component Catalog Data

The preview system includes a structured component catalog with:
- Component metadata
- Categories
- Descriptions
- Usage examples

## Usage Guidelines

### Reference Only

**Important:** This is a reference library. Components are copies, not shared dependencies.

**Do:**
- Browse components for reference
- Compare implementations
- Use as inspiration
- Copy components to your project if needed

**Don't:**
- Import directly from all-components
- Use as shared dependencies
- Modify expecting changes to propagate

### Finding Components

1. **By Project:** Browse project directories
2. **By Category:** Use component categories above
3. **By Preview:** Use preview system in `preview/` directory
4. **By Search:** Search component files

## Component Statistics

| Project | Component Count | Type |
|---------|----------------|------|
| errl-club-ui | 50+ | UI Components |
| figma-clone-engine | 41 | Editor Components |
| errl_scene_builder | 24 | Scene Building |
| Errl_Components | 13 | WebGL Components |
| errl-forge | 12 | Asset Tools |
| errl_vibecheck | 11 | AI Tools |
| errl-portal-shared | Multiple | Shared/Project |
| errl-portal | 5 | UI Components |
| errl-design-system | 3 | Design System |
| **Total** | **199+** | **Mixed** |

## Component File Types

- **TypeScript React:** `.tsx` files
- **TypeScript:** `.ts` files
- **JavaScript React:** `.jsx` files
- **JavaScript:** `.js` files

## Organization Notes

### Project-Based Structure

Components are organized by source project to:
- Maintain context
- Preserve original structure
- Enable easy tracing to source
- Support comparison across projects

### Snapshot Date

**Copied on:** December 22, 2024

**Note:** Components reflect the state of source projects at that date. Source projects may have evolved since.

## Preview System

### Running the Preview

```bash
cd preview
npm install
npm run dev
```

### Preview Features

- Interactive component browser
- Component examples
- Search and filter
- Component metadata display

## Integration with Source Projects

### Component Origins

Components in all-components are copies from:
- errl-club
- figma-clone-engine
- errl_scene_builder
- Errl_Components
- errl_vibecheck
- errl-forge---asset-remixer
- errl-portal
- errl-portal-shared
- errl-design-system

### Using Components

To use a component from all-components:
1. Find the component in the appropriate project directory
2. Copy the component file(s) to your project
3. Copy any dependencies (stores, utilities, etc.)
4. Adapt as needed for your project

## Notes

- This is a reference library, not a live component library
- Components are organized by source project
- Preview system available for browsing
- Total of 199+ component files
- Snapshot from December 22, 2024
- Components may have evolved in source projects since snapshot

## Related Documentation

- [Errl_Components Catalog](../Errl_Components/docs/COMPONENT_CATALOG.md) - Detailed Errl_Components documentation
- [Architecture](architecture.md) - Technical architecture
- [Project Structure](project-structure.md) - File organization
