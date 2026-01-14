# Inspector Controls by Node Type

This document outlines what controls should appear in the InspectorPanel (right sidebar) based on the selected node type, based on Figma's behavior and research.

## Overview

The InspectorPanel dynamically changes its content based on:
1. **Node Type** (Text, Rectangle, Frame, Image, Vector, Component, Instance)
2. **Selection State** (Nothing selected, Single selection, Multi-selection)
3. **Mode** (Design vs Dev)

---

## Node Type: Nothing Selected / Page Selected

### Current Implementation ✅
- **Page Section**
  - Color swatch + hex code
  - Opacity (100%)
  - Eye icon (show/hide)
  - "Show in exports" checkbox
- **Variables Section** (with filter icon)
- **Styles Section** (with plus icon)
- **Export Section**
  - Scale selector (1x dropdown)
  - Format selector (PNG dropdown)
  - More options and remove buttons
  - Export button
  - Preview link

---

## Node Type: TEXT

### Current Implementation ✅
- **Position Section**: X, Y, Rotation
- **Layout Section**: Width, Height (auto for text)
- **Appearance Section**: Opacity, Corner Radius (if applicable)
- **Fill Section**: Text color picker
- **Typography Section** ✅
  - Font family selector
  - Font size
  - Font weight
  - Line height
  - Letter spacing
  - Text align (icon buttons: left, center, right, justify)
  - Text decoration (underline, strikethrough)

### Missing / Should Add 📋
- **Text Content Editor**: Inline text editing (double-click to edit)
- **Text Style**: Apply text styles
- **Character Styles**: Individual character formatting
- **Paragraph Styles**: Paragraph-level formatting
- **Text Auto-resize**: Auto width/height options
- **Text Overflow**: Truncate, wrap, auto-height options

---

## Node Type: RECTANGLE

### Current Implementation ✅
- **RectangleControls Component** ✅
  - Grid icon (styles/components)
  - Grid icon with diagonal (instances/variants)
  - Moon/half-circle icon (mask/blend mode)
  - Stack of papers icon with dropdown (styles/presets)
  - Square with four dots icon (constraints/auto-layout)
- **Position Section**: X, Y, Rotation, Alignment controls, Constraints ✅
- **Layout Section**: Width, Height
- **Appearance Section**: Opacity, Corner Radius, Blend Mode dropdown ✅
  - Eye icon (visibility toggle) and Teardrop icon (blend mode) in header ✅
  - Unlink corners icon for separate corner radius controls ✅
- **Fill Section**: Color picker, Gradient support ✅
  - Grid icon (styles) and Plus icon (add fill) in header ✅
  - Eye icon (visibility) and Minus icon (remove fill) for each fill ✅
- **Stroke Section**: Border color, width, style, Position dropdown ✅
  - Grid icon (styles) and Plus icon (add stroke) in header ✅
  - Position dropdown (Outside, Inside, Center) ✅
  - Weight input with Settings and Alignment icons ✅
  - Eye icon (visibility) and Minus icon (remove stroke) ✅
- **Effects Section**: Dynamic effects (Drop Shadow, Inner Shadow, Layer Blur, Background Blur) ✅
  - Grid icon (styles) and Plus icon (add effect) in header ✅
  - Eye icon (visibility) and Minus icon (remove effect) for each effect ✅

### Missing / Should Add 📋
- **Boolean Operations**: Union, Subtract, Intersect, Exclude (UI exists in FrameControls, needs implementation)
- **Path Editing**: Convert to vector, edit points
- **Image Fill**: Use image as fill (not just color/gradient)
- **Constraints**: Pin to edges, center, stretch (icon exists, section needs implementation)

---

## Node Type: FRAME

### Current Implementation ✅
- **FrameControls Component** ✅
  - Code icon (`</>`) - Developer mode/code export
  - Grid icon - Components/assets (2x2 grid of squares)
  - Ellipsis menu (three dots) - Opens dropdown with:
    - Use as mask (^⌘M)
    - Union (⌥⇧U)
    - Subtract (⌥⇧S)
    - Intersect (⌥⇧I)
    - Exclude (⌥⇧E)
    - Flatten (⌥⇧F)
- **Position Section**: X, Y, Rotation, Alignment controls, Constraints ✅
- **Layout Section**: Width, Height
  - **Auto-layout Controls** ✅
    - Layout mode (Horizontal/Vertical)
    - Gap (itemSpacing)
    - Padding
    - Alignment (alignItems, justifyContent) - icon buttons ✅
- **Appearance Section**: Opacity, Corner Radius, Blend Mode dropdown ✅
  - Eye icon (visibility toggle) and Teardrop icon (blend mode) in header ✅
  - Unlink corners icon for separate corner radius controls ✅
- **Fill Section**: Color picker, Gradient support ✅
  - Grid icon (styles) and Plus icon (add fill) in header ✅
  - Eye icon (visibility) and Minus icon (remove fill) for each fill ✅
- **Stroke Section**: Border color, width, style, Position dropdown ✅
  - Grid icon (styles) and Plus icon (add stroke) in header ✅
  - Position dropdown (Outside, Inside, Center) ✅
  - Weight input with Settings and Alignment icons ✅
  - Eye icon (visibility) and Minus icon (remove stroke) ✅
- **Effects Section**: Dynamic effects ✅
  - Grid icon (styles) and Plus icon (add effect) in header ✅
  - Eye icon (visibility) and Minus icon (remove effect) for each effect ✅

### Missing / Should Add 📋
- **Constraints Section**: Layout constraints (left/center/right, top/middle/bottom) - UI exists, needs full implementation
- **Clip Content**: Checkbox to clip children to frame bounds
- **Overflow Behavior**: Scroll, hidden, visible
- **Grid Layout**: Grid system (rows/columns)
- **Frame Fill Options**: Image fill, pattern fill
- **Boolean Operations**: UI exists in FrameControls, needs implementation

---

## Node Type: IMAGE

### Current Implementation ⚠️
- **Position Section**: X, Y, Rotation
- **Layout Section**: Width, Height
- **Appearance Section**: Opacity

### Missing / Should Add 📋
- **Image Controls Section**
  - Replace image button
  - Image fill mode (Fill, Fit, Crop, Tile)
  - Image filters/effects
  - Image opacity (separate from layer opacity)
- **Fill Section**: Image-specific fill options
- **Stroke Section**: Border around image
- **Effects Section**: Same as Rectangle
- **Constraints**: Pin to edges, maintain aspect ratio
- **Crop Tool**: Visual crop handles

---

## Node Type: VECTOR

### Current Implementation ⚠️
- **Position Section**: X, Y, Rotation
- **Layout Section**: Width, Height
- Basic stroke properties

### Missing / Should Add 📋
- **Vector Controls Section**
  - Edit path button
  - Convert to shape
  - Flatten path
  - Simplify path
- **Stroke Section** (Enhanced)
  - Stroke color
  - Stroke width
  - Stroke alignment (inside, center, outside)
  - Stroke caps (round, square, flat)
  - Stroke joins (miter, round, bevel)
  - Dashed stroke options
- **Fill Section**: Vector fill (color, gradient, pattern)
- **Effects Section**: Same as Rectangle
- **Path Operations**: Union, Subtract, Intersect, Exclude
- **Vector Editing**: Point editing, bezier handles

---

## Node Type: COMPONENT

### Current Implementation ⚠️
- Same as Frame (inherits Frame controls)

### Missing / Should Add 📋
- **Component Section**
  - Component name
  - Component description
  - Component properties panel
  - Variant properties (if variants exist)
  - Detach instance button
  - Reset instance button
- **Component Properties**: Define component props
- **Variants**: Variant management UI
- **Usage Count**: Show how many instances exist

---

## Node Type: INSTANCE

### Current Implementation ❌
- Not fully implemented

### Missing / Should Add 📋
- **Instance Section**
  - Master component name/link
  - Override controls
  - Reset overrides button
  - Detach instance button
  - Swap instance button
- **Overrides Panel**: 
  - Text overrides
  - Image overrides
  - Boolean overrides
  - Instance swap overrides
- **Component Properties**: Inherited from master
- **Variant Properties**: If master has variants

---

## Multi-Selection

### Current Implementation ⚠️
- Basic multi-select support exists
- Inspector shows first selected item

### Missing / Should Add 📋
- **Multi-Selection Inspector**
  - Common properties (position, size if all same)
  - Alignment tools (align left/center/right, top/middle/bottom)
  - Distribution tools (space evenly)
  - Group button
  - Frame selection button
  - Boolean operations (Union, Subtract, etc.)
  - Common styling (if all have same fill/stroke)

---

## Special Cases

### Groups
- **Group Section**
  - Ungroup button
  - Group name
  - Group properties (if groups have properties)

### Masks
- **Mask Section**
  - Release mask button
  - Mask mode (alpha, luminance)

### Constraints
- **Constraints Section** (for all node types)
  - Horizontal: Left, Center, Right, Left & Right, Scale
  - Vertical: Top, Center, Bottom, Top & Bottom, Scale

---

## Implementation Priority

### High Priority (Core Functionality)
1. ✅ Text node typography controls (DONE)
2. ✅ Rectangle/Frame table controls (DONE)
3. ✅ Effects controls (DONE)
4. ⚠️ Image controls (Replace, Fill mode)
5. ⚠️ Vector stroke controls (alignment, caps, joins)
6. ⚠️ Component/Instance overrides

### Medium Priority (Enhanced Features)
1. Constraints section for all nodes
2. Boolean operations UI
3. Multi-selection inspector
4. Blend modes
5. Image fill options

### Low Priority (Advanced Features)
1. Path editing tools
2. Variant management
3. Component properties UI
4. Advanced vector editing

---

## Current Status Summary

### ✅ Fully Implemented
- Text: Typography controls
- Rectangle: Table controls, Fill, Stroke, Effects
- Frame: Table controls, Auto-layout, Fill, Stroke, Effects
- Empty/Page: Page inspector

### ⚠️ Partially Implemented
- Image: Basic position/size, missing image-specific controls
- Vector: Basic properties, missing vector-specific controls
- Component: Inherits Frame, missing component-specific controls
- Instance: Not implemented

### ❌ Not Implemented
- Multi-selection inspector
- Constraints section
- Boolean operations UI
- Image fill modes
- Vector path editing
- Component overrides
- Instance overrides

---

## Next Steps

1. **Add Image Controls Section**
   - Replace image button
   - Fill mode selector
   - Image filters

2. **Add Vector Controls Section**
   - Enhanced stroke controls
   - Path operations
   - Edit path button

3. **Add Component/Instance Sections**
   - Override controls
   - Component properties
   - Instance management

4. **Add Constraints Section**
   - For all node types
   - Horizontal/vertical constraints
   - Pin to edges

5. **Add Multi-Selection Inspector**
   - Common properties
   - Alignment tools
   - Distribution tools

