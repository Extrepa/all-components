# SVG Editor - Deprecation Notice

**Status:** ⚠️ DEPRECATED  
**Date:** 2026-01-09  
**Replacement:** [multi-tool-app](../multi-tool-app/) SVG Editor mode

## Overview

`svg_editor` (SVG Layer Toolkit) is being deprecated in favor of `multi-tool-app`'s unified creative suite. This document provides migration guidance and notes on feature differences.

## Why Deprecate?

`multi-tool-app` is an intentional combination project that unifies SVG editing, FX Lab, and Scene Maker in a single workspace. The unified suite provides:
- Integrated workflow (SVG → FX → Scene)
- Real-time sync between Focus Window and Stage Canvas
- Unified asset library and component system
- Better integration with other creative tools

## Feature Comparison

### Tools Available in svg_editor (25+ tools)

**Core Workflow (3):**
- Preview - Visual preview with customizable backgrounds
- Workflow Manager - Unified path/group management
- Shape Library - Interactive shape creation

**Editing Tools (10):**
- Color Replacer - Auto-detect and batch replace colors
- Transform - Move, scale, rotate paths with sliders
- Attributes - Direct attribute editing with gradient editor
- Path Merger - Merge multiple paths into one
- Node Editor - Point manipulation with snapping and symmetry
- Text to Path - Convert text elements to editable paths
- Path Offset - Expand strokes to filled shapes
- Boolean Ops - Union, subtract, intersect operations
- Alignment Tools - Align and distribute paths

**Advanced Tools (8):**
- Image Tracer - Convert PNG/JPG to SVG paths
- Animator - GSAP-powered path animations
- Optimizer - Clean and reduce file size
- Path Simplifier - Simplify paths with Douglas-Peucker
- Token Injector - Apply design tokens from JSON
- Comparator - Compare two SVG files
- Generators - Radial repeat, bar charts, QR codes

**Precision & Cleanup (2):**
- Cleanup Tools - Remove invisible objects, stray points
- Measurement Tools - Interactive ruler and path statistics

**Export & System (4):**
- Export Manager - Multiple export formats (PNG, JSX, Base64, etc.)
- Templates - Quick-start templates
- File Patch - Update existing files
- History & Undo - Full undo/redo (100 states)

### Tools Available in multi-tool-app SVG Mode

**Basic Tools:**
- Select Tool - Selection and multi-select
- Pen Tool - Path creation with Bezier curves
- Node Editor - Point manipulation (Sharp, Smooth, Broken node types)
- Shapes - Rectangle, Circle, Star
- Text Tool - Text creation
- Line Tool - Line creation
- Boolean Operations - Union, Subtract, Intersect, Exclude (via Paper.js)
- Measurement Tool - Distance measurement

**Note:** multi-tool-app SVG mode focuses on basic vector editing within the unified workflow. It does not include many advanced tools from svg_editor.

## Migration Path

### For Basic SVG Editing

If you need basic SVG editing (drawing, node editing, boolean operations):
1. Use `multi-tool-app` SVG Editor mode
2. Access via: Mode switcher → SVG Edit mode (Ctrl+1)
3. Tools available: Pen, Node Editor, Shapes, Boolean Ops

### For Advanced SVG Tools

If you need advanced tools not available in multi-tool-app:
- **Option 1:** Continue using `svg_editor` for advanced workflows (tool will remain functional but not actively developed)
- **Option 2:** Request features be added to multi-tool-app
- **Option 3:** Extract tools to shared utilities for use in both projects

### Tools Not Yet in multi-tool-app

The following tools from svg_editor are not yet available in multi-tool-app:
- Color Replacer
- Path Merger
- Image Tracer
- Animator (GSAP animations)
- Optimizer
- Path Simplifier
- Token Injector
- Comparator
- Generators (QR codes, charts, etc.)
- Cleanup Tools
- Templates system
- File Patch
- Advanced Export Manager

**Recommendation:** If you rely on these tools, continue using `svg_editor` until they are migrated to multi-tool-app or extracted to shared utilities.

## Migration Steps

1. **Evaluate your workflow:**
   - Do you need advanced tools (Color Replacer, Image Tracer, etc.)?
   - Or do you need basic editing within a unified workflow?

2. **For basic editing:**
   - Migrate to multi-tool-app SVG Editor mode
   - Use integrated workflow (SVG → FX → Scene)

3. **For advanced editing:**
   - Continue using svg_editor (will remain functional)
   - Or wait for tools to be migrated to multi-tool-app

## Timeline

- **2026-01-09:** Deprecation notice added
- **Future:** Tools may be migrated to multi-tool-app or extracted to shared utilities
- **Archive Date:** TBD (after migration period)

## Questions?

- See [multi-tool-app documentation](../multi-tool-app/docs/) for SVG Editor mode details
- See [CONSOLIDATION_NOTES.md](CONSOLIDATION_NOTES.md) for consolidation context
- See [PROJECT_RELATIONSHIPS.md](../PROJECT_RELATIONSHIPS.md) for project relationships

---

**Note:** This deprecation is part of a consolidation effort to reduce duplication and create a unified creative suite. svg_editor will remain functional but is not actively developed.
