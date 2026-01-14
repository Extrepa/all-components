# Feature Overview

## 1. The Infinite Canvas
The core of the application is a high-performance, DPI-aware HTML5 Canvas rendering engine.
- **Pan:** Hold `Space` + Drag or use the Middle Mouse Button.
- **Zoom:** `Ctrl` + Scroll or use the zoom controls in the UI.
- **Infinite Grid:** A context-aware grid that adjusts opacity based on zoom level.

## 2. Component System (The "Killer Feature")
Unlike standard drawing tools, this application supports **Structural Inheritance**.
- **Master Components:** Define a layout once.
- **Instances:** Create copies that inherit properties from the Master.
- **Overrides:** (Architecture ready) Changes to instances don't break the link to the master.

## 3. Design Tools
- **Selection (V):** Multi-select support with `Shift`. Deep select through groups.
  - Pop-out menu: Move (V), Hand tool (H), Scale (K)
- **Frame (F):** Create container frames. Drag to create frames on canvas.
  - Accessible via Grid tool pop-out menu: Section (⇧S), Frame (F), Slice (S)
- **Rectangle (R):** Draw shape primitives. Drag to create rectangles.
  - Pop-out menu: Rectangle (R), Line (L), Arrow (⇧L), Ellipse (O), Polygon, Star, Image/video... (⇧⌘K)
- **Text (T):** On-canvas WYSIWYG text editing. Click to add, double-click to edit.
- **Pen (P):** Vector path drawing tool (Polyline support).
  - Pop-out menu: Pen (P), Pencil (⇧P)
- **Hand (H):** Pan the canvas without selecting objects.
  - Accessible via Move tool pop-out menu
- **Images:** Upload local images directly to the canvas.
  - Accessible via Rectangle tool pop-out menu
- **Additional Tools:** Circle, Components, Freehand, Measure, Code

## 4. Alignment & Layout
- **Smart Alignment:** Align Left, Center, Right, Top, Middle, Bottom.
- **Z-Index Control:** Bring to Front / Send to Back.
- **Grouping:** `Ctrl + G` to wrap items in a Frame.

## 5. Developer Mode (Handoff)
Switching to **Dev Mode** transforms the interface for engineers.
- **Code Generation:** Instantly view CSS and React JSX for selected elements.
- **Smart Measurement:** Select an element and hover over another to see exact pixel distances.
- **Read-Only Safety:** Prevents accidental edits while inspecting.

## 6. Persistence
- **History:** Robust Undo/Redo stack (`Ctrl+Z`, `Ctrl+Y`).
- **File System:** Save designs to `.json` and load them back on any device.

## 7. Export & File Management
- **Export Functionality:** Export selected nodes or entire canvas
  - PNG export with multiple scales (0.5x, 1x, 1.5x, 2x, 3x, 4x)
  - SVG export with full node hierarchy
  - JPG export with quality control
  - Quick export buttons for common formats
  - Custom export settings with format and scale selectors
- **Page Management:** Add and delete pages
  - Create new pages with sequential naming
  - Delete pages (prevents deleting last page)
  - Double-click to rename pages
  - Dynamic page listing

## 8. Advanced Features
- **Eyedropper Tool (I):** Pick colors directly from canvas
  - Updates selected node's fill or stroke
  - Automatically switches back to Select tool
- **Context Menu:** Right-click for quick access to common operations
  - Copy, Paste, Delete, Duplicate, Cut
  - Group/Ungroup, Lock/Unlock, Hide/Show
  - Layer ordering (Bring Forward, Send Backward, Bring to Front, Send to Back)
- **Alignment Guides:** Visual guides when aligning objects
  - Detects alignment opportunities during drag
  - Shows dashed guide lines
  - Threshold-based detection
- **Rulers:** Horizontal and vertical measurement rulers
  - Zoom-aware tick marks
  - Pixel measurements
  - Syncs with viewport

## 9. UI Enhancements
- **Bottom Dock Pop-out Menus:** Tools with chevrons show alternative tool options in pop-out menus
  - Move tool: Move, Hand tool, Scale
  - Grid tool: Section, Frame, Slice
  - Rectangle tool: Rectangle, Line, Arrow, Ellipse, Polygon, Star, Image
  - Pen tool: Pen, Pencil
- **Inspector Panel Object Controls:** Type-specific action buttons that update based on selected object
  - Frame objects: Code, Components, Boolean operations menu
  - Rectangle objects: Styles, Instances, Mask, Styles dropdown, Constraints
- **Section Header Icons:** All inspector sections include action icons (Grid, Plus, Eye, Minus, etc.)
- **Inline Name Editing:** Double-click any layer, page, or node name to edit inline
  - Enter to save, Esc to cancel
- **FileMenu Hover States:** Enhanced hover feedback and viewport-aware positioning
- **Layers Panel Styling:** Reduced padding and section dividers for cleaner layout