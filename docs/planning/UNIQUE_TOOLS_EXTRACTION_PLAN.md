# Unique Tools Extraction Plan

**Date:** 2026-01-09  
**Status:** Planning Document  
**Purpose:** Document unique tools from deprecated projects for potential extraction

## svg_editor Unique Tools

### Tools Not in multi-tool-app SVG Mode

**Color & Styling (2):**
1. **Color Replacer** - Auto-detect and batch replace colors
   - Location: `svg_editor/src/components/tools/ColorReplacer.tsx`
   - Use Case: Bulk color replacement across SVG
   - Priority: Medium

2. **Path Offset** - Expand strokes to filled shapes
   - Location: `svg_editor/src/components/tools/PathOffset.tsx`
   - Use Case: Convert strokes to fills
   - Priority: Low

**Path Operations (2):**
3. **Path Merger** - Merge multiple paths into one
   - Location: `svg_editor/src/components/tools/PathMerger.tsx`
   - Use Case: Combine multiple paths
   - Priority: Medium

4. **Path Simplifier** - Simplify paths with Douglas-Peucker algorithm
   - Location: `svg_editor/src/components/tools/PathSimplifier.tsx`
   - Use Case: Reduce path complexity
   - Priority: Low

**Advanced Features (5):**
5. **Image Tracer** - Convert PNG/JPG to SVG paths
   - Location: `svg_editor/src/components/tools/ImageTracer.tsx`
   - Use Case: Raster to vector conversion
   - Priority: High (useful feature)

6. **Animator** - GSAP-powered path animations
   - Location: `svg_editor/src/components/tools/Animator.tsx`
   - Use Case: Add animations to SVG paths
   - Priority: Medium

7. **Optimizer** - Clean and reduce file size
   - Location: `svg_editor/src/components/tools/Optimizer.tsx`
   - Use Case: SVG optimization
   - Priority: High (useful for production)

8. **Token Injector** - Apply design tokens from JSON
   - Location: `svg_editor/src/components/tools/TokenInjector.tsx`
   - Use Case: Apply design system tokens
   - Priority: Medium

9. **Comparator** - Compare two SVG files
   - Location: `svg_editor/src/components/tools/Comparator.tsx`
   - Use Case: Diff two SVG files
   - Priority: Low

**Generators (1):**
10. **Generators** - Radial repeat, bar charts, QR codes
    - Location: `svg_editor/src/components/tools/Generators.tsx`
    - Use Case: Generate common SVG patterns
    - Priority: Medium

**Cleanup (1):**
11. **Cleanup Tools** - Remove invisible objects, stray points
    - Location: `svg_editor/src/components/tools/CleanupTools.tsx`
    - Use Case: Clean up SVG files
    - Priority: Medium

**Export & System (3):**
12. **Advanced Export Manager** - Multiple export formats (PNG, JSX, Base64, etc.)
    - Location: `svg_editor/src/components/tools/ExportManager.tsx`
    - Use Case: Export in various formats
    - Priority: High (useful feature)

13. **Templates System** - Quick-start templates
    - Location: `svg_editor/src/components/tools/Templates.tsx`
    - Use Case: Save/load SVG templates
    - Priority: Low

14. **File Patch** - Update existing files
    - Location: `svg_editor/src/components/tools/FilePatch.tsx`
    - Use Case: Update external SVG references
    - Priority: Low

## errl_scene_builder Unique Features

### Features Not in multi-tool-app Scene Mode

1. **Comprehensive Template System** - 5 pre-built templates
   - FESTIVAL_STAGE, GRANDMA_TV, LAB_INTRO, SHRINE_ALTAR, VOID_ORBS
   - Use Case: Quick scene setup
   - Priority: Medium

2. **Errl Assist UI Integration** - AI-powered assistance
   - Use Case: AI-assisted scene building
   - Priority: Low

3. **Advanced Asset Panel System** - Comprehensive asset management
   - Use Case: Better asset organization
   - Priority: Medium

4. **Comprehensive Specification System** - 12 specification files
   - Use Case: Detailed scene specifications
   - Priority: Low

5. **Background Management System** - Dedicated background handling
   - Use Case: Background-specific features
   - Priority: Low

## Extraction Strategy

### Option 1: Extract to Shared Utilities
- Create `shared/utils/svg-tools/` for reusable SVG utilities
- Extract: Optimizer, Image Tracer, Path Simplifier, Cleanup Tools
- Benefits: Reusable across projects
- Effort: Medium

### Option 2: Migrate to multi-tool-app
- Add tools directly to multi-tool-app SVG mode
- Extract: Color Replacer, Path Merger, Image Tracer, Optimizer, Export Manager
- Benefits: Unified experience
- Effort: High

### Option 3: Keep as Standalone Utilities
- Extract tools to standalone npm packages or utilities
- Extract: Image Tracer, Optimizer, Generators
- Benefits: Maximum reusability
- Effort: High

## Recommended Approach

**Phase 1: High-Priority Tools (Immediate)**
- Image Tracer (useful feature)
- Optimizer (production value)
- Advanced Export Manager (useful feature)

**Phase 2: Medium-Priority Tools (Future)**
- Color Replacer
- Path Merger
- Animator
- Token Injector
- Generators
- Cleanup Tools

**Phase 3: Low-Priority Tools (Optional)**
- Path Offset
- Path Simplifier
- Comparator
- Templates System
- File Patch

## Implementation Notes

- Tools are in TypeScript/React format in svg_editor
- Some tools may need refactoring for multi-tool-app architecture
- Consider creating shared utility library for common operations
- Document extraction process for each tool

## Status

- ✅ Tools identified and documented
- ⏳ Extraction pending (can be done incrementally)
- ⏳ Migration to multi-tool-app pending (requires planning)
