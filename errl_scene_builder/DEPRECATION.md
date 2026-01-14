# Errl Scene Builder - Deprecation Notice

**Status:** ⚠️ DEPRECATED  
**Date:** 2026-01-09  
**Replacement:** [multi-tool-app](../multi-tool-app/) Scene Maker mode

## Overview

`errl_scene_builder` is being deprecated in favor of `multi-tool-app`'s unified creative suite. This document provides migration guidance and notes on feature differences.

## Why Deprecate?

`multi-tool-app` is an intentional combination project that unifies SVG editing, FX Lab, and Scene Maker in a single workspace. The unified suite provides:
- Integrated workflow (SVG → FX → Scene)
- Real-time sync between Focus Window and Stage Canvas
- Unified asset library and component system
- Better integration with other creative tools

## Feature Comparison

### Features Available in errl_scene_builder

**Core Features:**
- Scene synthesis and building
- Comprehensive UI component system
- Asset and background management
- Effects and behaviors system
- Template system (FESTIVAL_STAGE, GRANDMA_TV, LAB_INTRO, SHRINE_ALTAR, VOID_ORBS)
- Errl Assist UI integration
- Asset panels with library management
- Layer management with templates
- Export functionality

**Technical Features:**
- React-based architecture
- Zustand state management
- Normalized scene store
- SVG rendering system
- Template system
- Comprehensive specification system (12 spec files)

### Features Available in multi-tool-app Scene Maker Mode

**Core Features:**
- Scene composition (Stage Canvas)
- Drag-and-drop assets from Asset Tray
- Layer management (Layer Tree)
- Transform handles (8-point resize + rotation)
- Multi-select support
- Group/ungroup functionality
- Real-time sync with Focus Window
- Z-index management
- Grid snapping and alignment guides

**Technical Features:**
- Integrated with SVG Editor and FX Lab
- Unified project structure
- Scene graph with instances
- Component system (Assets + Vibes)
- Export pipeline (Flash bundle, React components, SVG, JSON)

## Migration Path

### For Basic Scene Building

If you need basic scene composition (drag assets, layer management):
1. Use `multi-tool-app` Scene Maker mode
2. Access via: Mode switcher → Scene Maker mode (Ctrl+3)
3. Features: Drag from Asset Tray, transform handles, layer tree

### For Advanced Scene Features

If you need advanced features not available in multi-tool-app:
- **Option 1:** Continue using `errl_scene_builder` for advanced workflows (tool will remain functional but not actively developed)
- **Option 2:** Request features be added to multi-tool-app
- **Option 3:** Extract features to shared utilities for use in both projects

### Features Not Yet in multi-tool-app

The following features from errl_scene_builder are not yet available in multi-tool-app:
- Comprehensive template system (5 pre-built templates)
- Errl Assist UI integration
- Advanced asset panel system
- Comprehensive specification system
- Background management system
- Advanced effects/behaviors system

**Recommendation:** If you rely on these features, continue using `errl_scene_builder` until they are migrated to multi-tool-app or extracted to shared utilities.

## Migration Steps

1. **Evaluate your workflow:**
   - Do you need basic scene composition?
   - Or do you need advanced templates and specifications?

2. **For basic scene building:**
   - Migrate to multi-tool-app Scene Maker mode
   - Use integrated workflow (SVG → FX → Scene)

3. **For advanced scene building:**
   - Continue using errl_scene_builder (will remain functional)
   - Or wait for features to be migrated to multi-tool-app

## Timeline

- **2026-01-09:** Deprecation notice added
- **Future:** Features may be migrated to multi-tool-app or extracted to shared utilities
- **Archive Date:** TBD (after migration period)

## Questions?

- See [multi-tool-app documentation](../multi-tool-app/docs/) for Scene Maker mode details
- See [CONSOLIDATION_NOTES.md](CONSOLIDATION_NOTES.md) for consolidation context
- See [PROJECT_RELATIONSHIPS.md](../PROJECT_RELATIONSHIPS.md) for project relationships

---

**Note:** This deprecation is part of a consolidation effort to reduce duplication and create a unified creative suite. errl_scene_builder will remain functional but is not actively developed.
