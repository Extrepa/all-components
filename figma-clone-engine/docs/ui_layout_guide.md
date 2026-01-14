# UI Layout Guide

This document maps out where all tools, features, and controls should be placed in the Figma Clone Engine interface, based on Figma's design patterns.

## Overview

The interface consists of:
- **Left Sidebar**: Layers panel, Pages, Assets
- **Right Sidebar**: Inspector/Properties panel
- **Bottom Dock**: Primary design tools (floating)
- **Top Nav**: Secondary controls (floating, optional)
- **Canvas**: Main design area

---

## Left Sidebar (`LayersPanel.tsx`)

**Location**: Fixed left side, collapsible
**Width**: 208px (w-52)
**Background**: `#2c2c2c`
**Top Spacing**: 64px (h-16) to avoid file button overlap

### Current Contents ✅
- **File/Assets Tabs** (tab switcher)
  - File tab: File name display, Status (Drafts • Free)
  - Assets tab: Component library, Master components list, Empty state message
  - Active tab highlighted with blue bottom border
  
- **Pages Section** (accordion)
  - List of pages/frames
  - Page 1 (default)
  
- **Layers Section** (accordion)
  - Search and filter bar
  - Layer hierarchy tree
  - Node type icons (Frame, Rectangle, Text, Image, Vector)
  - Selection highlighting (blue in Design, green in Dev)
  - Click to select layers

### Tab & Accordion Behavior
- File/Assets are tabs that switch content below
- Pages and Layers are accordion sections (collapsible with chevron icons)
- Default expanded: Pages, Layers
- Consistent spacing and styling throughout
- Panel is resizable (208px - 600px)

### Keyboard Shortcuts
- `Tab` - Toggle sidebar visibility (future)

---

## Right Sidebar (`InspectorPanel.tsx`)

**Location**: Fixed right side, collapsible, resizable
**Width**: 208px default (w-52), resizable 208px - 600px (matches left panel)
**Background**: `#2c2c2c` (Design) / `#111` (Dev)

### Current Contents ✅

#### Design Mode
- **Header**: Node type and name with action buttons on right (type-specific)
- **Object Header Buttons** (type-specific) ✅
  - **Frame Objects**: Code icon, Grid icon (components), Ellipsis menu (boolean operations)
  - **Rectangle Objects**: Grid icon (styles), Grid with diagonal (instances), Moon icon (mask), Layers icon (styles dropdown), LayoutGrid icon (constraints)
  - Buttons update dynamically based on selected object type
- **Position Section** (collapsible, expanded by default)
  - X, Y coordinates
  - Rotation with flip controls
  - Alignment controls (6 icons: left, horizontal center, right, top, vertical center, bottom)
  - Constraints dropdowns (H Center, I Center)
- **Layout Section** (collapsible)
  - Width, Height
  - Auto-layout controls (direction, gap, padding)
  - Alignment (alignItems, justifyContent)
- **Appearance Section** (collapsible) ✅
  - Eye icon (visibility toggle) and Teardrop icon (blend mode) in header
  - Opacity slider with percentage
  - Corner radius with unlink corners icon (four separate corner controls)
  - Blend mode dropdown (Normal, Multiply, Screen, Overlay, Darken, Lighten, etc.)
- **Fill Section** (collapsible) ✅
  - Grid icon (styles) and Plus icon (add fill) in header
  - Color picker (hex input)
  - Opacity slider
  - Gradient support
  - Eye icon (toggle visibility) and Minus icon (remove fill) for each fill
- **Stroke Section** (collapsible) ✅
  - Grid icon (styles) and Plus icon (add stroke) in header
  - Border color, width, style
  - Position dropdown (Outside, Inside, Center)
  - Weight input with Settings and Alignment icons
  - Eye icon (toggle visibility) and Minus icon (remove stroke)
- **Effects Section** (collapsible, expanded by default) ✅
  - Grid icon (styles) and Plus icon (add effect) in header
  - Effect type selector: Drop Shadow, Inner Shadow, Layer Blur, Background Blur
  - Dynamic controls based on selected effect type
  - Drop Shadow: Presets + custom input
  - Inner Shadow: Custom input
  - Layer/Background Blur: Radius slider
  - Eye icon (toggle visibility) and Minus icon (remove effect) for each effect
- **Typography Section** (collapsible, Text nodes only)
  - Font family, size, weight
  - Line height, letter spacing
  - Text align (icon buttons)
  - Text decoration
  
- **Export Section** (collapsible, expanded by default, Design mode only) ✅
  - Plus icon in header (add export)
  - Quick export options with scale and format dropdowns
  - Ellipsis icon (more options) and Minus icon (remove export) for each export
  - Custom export settings:
    - Format selector (PNG, SVG, JPG, PDF)
    - Scale selector (0.5x, 1x, 1.5x, 2x, 3x, 4x)
  - Export button with download icon

#### Dev Mode
- **CSS Code Block**
  - Generated CSS with copy button
- **React/JSX Code Block**
  - Generated React code with copy button

### Section Header Icons ✅
All sections now include action icons on the right side of the header:
- **Appearance**: Eye (visibility), Teardrop (blend mode)
- **Fill**: Grid (styles), Plus (add fill)
- **Stroke**: Grid (styles), Plus (add stroke)
- **Effects**: Grid (styles), Plus (add effect)
- **Export**: Plus (add export)

### Object-Specific Controls ✅
- **FrameControls Component**: Shows Code, Grid, and Ellipsis menu with boolean operations
- **RectangleControls Component**: Shows Styles grid, Instances grid, Mask, Styles dropdown, and Constraints icons
- Controls automatically switch based on selected object type

### Should Add 📋
- **Constraints Section** (Design mode)
  - Left, center, right constraints
  - Top, middle, bottom constraints
  - Fixed/Stretch options
  
- **Component Section** (Design mode, for Components)
  - Master component info
  - Override controls
  - Detach instance button

### Keyboard Shortcuts
- `Tab` - Toggle inspector visibility (future)

---

## Bottom Dock (`BottomDock.tsx`)

**Location**: Floating, bottom center
**Position**: `fixed bottom-4 left-1/2 transform -translate-x-1/2`
**Z-index**: 50
**Visibility**: Only in DESIGN mode
**Styling**: White rounded rectangle with subtle gray border, matching Figma design

### Current Contents ✅
- **Select/Move Tool** (V) ✅
  - Mouse pointer icon
  - Small chevron icon (pop-out menu)
  - Pop-out menu: Move (V), Hand tool (H), Scale (K)
  - Active state: Blue square background with white icon
  
- **Hash/Grid Tool** ✅
  - Hash/grid icon
  - Small chevron icon (pop-out menu)
  - Pop-out menu: Section (⇧S), Frame (F), Slice (S)
  - Active state highlighting
  
- **Rectangle Tool** (R) ✅
  - Square icon
  - Small chevron icon (pop-out menu)
  - Pop-out menu: Rectangle (R), Line (L), Arrow (⇧L), Ellipse (O), Polygon, Star, Image/video... (⇧⌘K)
  - Active state highlighting
  
- **Text Tool** (T) ✅
  - Type icon
  - No chevron (no pop-out menu)
  
- **Pen Tool** (P) ✅
  - Pen icon
  - Small chevron icon (pop-out menu)
  - Pop-out menu: Pen (P), Pencil (⇧P)
  
- **Circle/Ellipse Tool** ✅
  - Circle icon
  - No chevron (no pop-out menu)
  
- **Components Tool** ✅
  - Component icon
  - No chevron (no pop-out menu)
  
- **Divider** (visual separator)
  
- **Squiggly Line/Freehand Tool** ✅
  - Wavy line icon
  - No chevron (no pop-out menu)
  
- **Ruler/Measure Tool** ✅
  - Ruler with cursor icon
  - No chevron (no pop-out menu)
  
- **Code Tool** (</>) ✅
  - Code brackets icon
  - No chevron (no pop-out menu)

### Pop-out Menus ✅
- **DockPopOutMenu Component**: Reusable component for tool menus
- Dark gray background with white text
- Appears above the tool button
- Shows checkmark for currently selected tool
- Displays icons, labels, and keyboard shortcuts
- Closes on outside click or tool selection

### Visual Styling ✅
- **Background**: White rounded rectangle (`bg-white`)
- **Border**: Subtle gray border (`border-gray-300`)
- **Active Tool**: Blue square background (`bg-blue-600`) with white icon
- **Inactive Tools**: White outline icons on dark gray background (`text-gray-800`)
- **Chevrons**: Small (10px) downward-pointing chevrons positioned to the right of icons
- **Hover States**: Light gray background on hover (`hover:bg-gray-100`)

### Tool Organization
```
[Select▼] [Grid▼] [Rectangle▼] [Text] [Pen▼] [Circle] [Components] | [Freehand] [Measure] [Code]
```

### Keyboard Shortcuts
- `V` - Select/Move tool
- `H` - Hand tool (via pop-out menu)
- `K` - Scale tool (via pop-out menu, future)
- `F` - Frame tool (via Grid pop-out menu)
- `⇧S` - Section tool (via Grid pop-out menu, future)
- `S` - Slice tool (via Grid pop-out menu, future)
- `R` - Rectangle tool
- `L` - Line tool (via Rectangle pop-out menu, future)
- `⇧L` - Arrow tool (via Rectangle pop-out menu, future)
- `O` - Ellipse tool (via Rectangle pop-out menu, future)
- `T` - Text tool
- `P` - Pen tool
- `⇧P` - Pencil tool (via Pen pop-out menu, future)
- `⇧⌘K` - Image/video tool (via Rectangle pop-out menu)

---

## Floating Top Nav (`FloatingTopNav.tsx`)

**Location**: Floating, top center
**Position**: `fixed top-4 left-1/2 transform -translate-x-1/2`
**Z-index**: 50
**Visibility**: Always visible

### Current Contents ✅
- **Mode Toggle**
  - Design ↔ Dev mode switcher
  - Code icon in Design mode
  
- **Divider**
  
- **Undo** (Ctrl+Z)
  - Undo icon
  - Disabled when no history
  
- **Redo** (Ctrl+Y)
  - Redo icon
  - Disabled when no future
  
- **Divider**
  
- **Save**
  - Download icon
  - Save design to JSON
  
- **Load**
  - Upload icon
  - Load design from JSON
  
- **Divider**
  
- **Zoom Controls**
  - Zoom out (-)
  - Zoom percentage display
  - Zoom in (+)

### Should Add 📋
- **File Menu** (future)
  - New, Open, Save, Export
  - Recent files
  
- **Edit Menu** (future)
  - Cut, Copy, Paste, Duplicate
  - Select All, Deselect
  
- **View Menu** (future)
  - Show/Hide grid
  - Show/Hide rulers
  - Zoom to fit, zoom to selection

### Keyboard Shortcuts
- `Ctrl+Z` / `Cmd+Z` - Undo
- `Ctrl+Y` / `Cmd+Y` - Redo
- `Ctrl+S` / `Cmd+S` - Save (future)
- `Ctrl+O` / `Cmd+O` - Open (future)
- `Ctrl+0` / `Cmd+0` - Zoom to fit (future)
- `Ctrl+1` / `Cmd+1` - Zoom to 100% (future)

---

## Canvas Area

**Location**: Center, between sidebars
**Background**: `#1e1e1e`

### Current Features ✅
- **Grid Display**
  - Context-aware opacity
  - Adjusts with zoom level
  
- **Node Rendering**
  - Frames, Rectangles, Text, Images, Vectors
  - Auto-layout calculations
  - Transform handles (8 handles for resize)
  
- **Selection**
  - Single and multi-select
  - Selection outline
  - Resize handles
  
- **Interaction**
  - Pan (Space + drag, middle mouse)
  - Zoom (Ctrl/Cmd + scroll)
  - Drag to move
  - Resize handles
  - Inline text editing (double-click)

### Dev Mode Features ✅
- **Distance Measurements**
  - Red lines between selected and hovered elements
  - Pixel distance labels
  
- **Read-only Mode**
  - Prevents accidental edits
  - Visual feedback (green theme)

### Should Add 📋
- **Alignment Guides**
  - Smart guides when aligning
  - Snap to guides
  
- **Rulers** (top and left)
  - Show measurements
  - Drag guides from rulers
  
- **Context Menu** (right-click)
  - Cut, Copy, Paste
  - Duplicate, Delete
  - Group, Ungroup
  - Bring to Front, Send to Back
  - Create Component
  
- **Transform Controls**
  - Rotation handle
  - Corner radius handles
  - Constraint indicators

---

## Feature Placement Summary

### ✅ Currently Implemented
- Left Sidebar: Layers panel
- Right Sidebar: Inspector with collapsible sections
- Bottom Dock: Primary design tools
- Top Nav: Mode toggle, undo/redo, save/load, zoom

### 📋 Missing Features to Add

#### Left Sidebar
- [ ] Pages section
- [ ] Assets/Components tab
- [ ] Collapse/expand toggle

#### Right Sidebar
- [ ] Export section
- [ ] Constraints section
- [ ] Component override controls

#### Bottom Dock
- ✅ Pop-out menus with chevrons for Move, Grid, Rectangle, and Pen tools
- ✅ White background styling matching Figma
- ✅ All tools properly organized with dividers
- [ ] Eyedropper tool
- [ ] Implement remaining tools from pop-out menus (Scale, Section, Slice, Line, Arrow, Polygon, Star, Pencil)

#### Top Nav
- [ ] File menu (New, Open, Save, Export)
- [ ] Edit menu (Cut, Copy, Paste)
- [ ] View menu (Grid, Rulers, Zoom presets)

#### Canvas
- [ ] Alignment guides
- [ ] Rulers
- [ ] Context menu
- [ ] Enhanced transform controls

---

## Design Mode vs Dev Mode

### Design Mode
- **Bottom Dock**: Visible with all tools
- **Top Nav**: Shows "Dev" button to switch
- **Inspector**: Property editing panels
- **Canvas**: Full editing capabilities

### Dev Mode
- **Bottom Dock**: Hidden
- **Top Nav**: Shows "Design" button to switch
- **Inspector**: Code generation (CSS/React)
- **Canvas**: Read-only, measurement mode

---

## Resizable Panels

### Left Panel (LayersPanel)
- Default width: 208px
- Resizable range: 208px - 600px
- Resize handle on right edge
- Minimum width ensures content visibility

### Right Panel (InspectorPanel)
- Default width: 208px (matches left panel)
- Resizable range: 208px - 600px
- Resize handle on right edge
- Minimum width ensures content visibility

### Resize Interaction
- Drag handle to resize
- Visual feedback on hover (blue highlight)
- Smooth resize animation
- Width persists during session

## Responsive Behavior

### Large Screens (> 1920px)
- All panels visible
- Full width sidebars (resizable)

### Medium Screens (1280px - 1920px)
- Sidebars can collapse
- Resizable within constraints
- Floating navs remain

### Small Screens (< 1280px)
- Sidebars auto-collapse
- Bottom dock remains accessible
- Top nav remains accessible

---

## Accessibility

### Keyboard Navigation
- `Tab` - Navigate between panels (future)
- `Esc` - Deselect / Close panels
- Tool shortcuts (V, R, T, P, etc.)

### Screen Reader Support (future)
- ARIA labels on all buttons
- Panel announcements
- Tool state announcements

---

## Notes

- All floating elements use `z-50` to stay above canvas
- Sidebars use `shrink-0` to prevent collapsing
- Canvas uses `flex-1` to fill remaining space
- All panels should be collapsible for maximum canvas space
- Floating navs should have subtle shadows for depth

