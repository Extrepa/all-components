# Changelog

All notable changes to the Figma Clone Engine project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### [Current Session] - All Features Complete

#### Added
- **Export Functionality** - Full PNG/SVG/JPG export with multiple scale options
  - PNG export with scales (0.5x, 1x, 1.5x, 2x, 3x, 4x)
  - SVG export with full node hierarchy conversion
  - JPG export with quality control
  - Quick export buttons and custom export settings
  - Full node hierarchy rendering support

- **Eyedropper Tool** - Color picking from canvas
  - Keyboard shortcut: `I`
  - Tool button in bottom dock
  - Automatically switches back to Select tool after picking
  - Updates selected node's fill or stroke color

- **Context Menu** - Right-click context menu
  - Copy, Paste, Delete, Duplicate, Cut operations
  - Group/Ungroup options
  - Lock/Unlock, Hide/Show nodes
  - Layer ordering (Bring Forward, Send Backward, Bring to Front, Send to Back)
  - Context-aware menu based on selection state

- **Layer Operations** - Complete Z-index and visibility management
  - Bring Forward, Send Backward
  - Bring to Front, Send to Back
  - Lock/Unlock nodes
  - Show/Hide nodes
  - Works with root and nested nodes

- **Component Drag-to-Canvas** - Instance creation via drag-and-drop
  - Components in Assets tab are draggable
  - Drop on canvas creates instance nodes
  - Snap-to-grid positioning support
  - Supports dropping inside frames

- **Page Management** - Add and delete pages
  - Add Page button creates new root frames
  - Delete Page with hover button (prevents deleting last page)
  - Sequential page naming (Page 1, Page 2, etc.)
  - Double-click to rename pages

- **Alignment Guides** - Visual alignment guides during drag
  - Detects alignment opportunities (top, center, bottom, left, right)
  - Shows dashed guide lines on canvas
  - Threshold-based detection (5px)

- **Rulers** - Measurement rulers
  - Horizontal and vertical rulers
  - Zoom-aware tick marks with measurements
  - Syncs with viewport transformations

- **Boolean Operations Framework** - UI and framework for boolean operations
  - Union, Subtract, Intersect, Exclude, Flatten operations
  - Use as mask functionality
  - Framework ready for geometry library integration

#### Changed
- **Documentation Consolidation** - Consolidated all redundant summary files into `IMPLEMENTATION_COMPLETE.md`
- **Implementation Status** - Updated all documentation to reflect completed features
- **Roadmap** - Updated to show Phase 8 (Advanced Features) as complete

### [2025-12-04] - Latest Session Changes

#### Added
- **Documentation Updates** - `2025-12-04 (Current)`
  - Comprehensive documentation review and updates across all docs
  - Updated `quick_reference.md` with all 16 tool types and complete node type definitions including CommentNode
  - Updated `implementation_status.md` with all implemented tools (Scale, Line, Arrow, Ellipse, Polygon, Star, Section, Slice, Pencil, Comment)
  - Updated `user_guide.md` with complete tool listing and keyboard shortcuts
  - Updated `feature_accessibility.md` with all accessible tools and their access methods
  - Updated `README.md` with comprehensive feature list
  - Updated `codebase_guide.md` with current file structure and organization (components, hooks, utils)
  - Updated `architecture.md` with complete DesignState interface (including snapToGrid, gridSize, projectName)
  - Updated `getting_started.md` with accurate file structure and line counts
  - Verified all node types match between `types.ts` and documentation
  - Verified all keyboard shortcuts are accurate and documented
  - All documentation now reflects current implementation state
- **File/Assets Tab System** - `2025-12-04 16:00:00`
  - Converted File and Assets from accordion sections to tabs
  - Tab switcher at top of LayersPanel
  - File tab shows file name and status
  - Assets tab shows component library
  - Active tab highlighted with blue bottom border
  - Smooth tab switching

- **File Menu Dropdown** - `2025-12-04 15:30:00`
  - Comprehensive file menu accessible from top-left file button
  - Main menu with all standard options: File, Edit, View, Object, Text, Arrange, Vector, Plugins, Widgets, Preferences, Libraries
  - "Actions..." search bar with ⌘K shortcut
  - Preferences submenu with full settings:
    - Snap settings (geometry, objects, pixel grid)
    - General settings (highlight layers, rename duplicated, show dimensions, etc.)
    - Interaction settings (scroll wheel zoom, right-click pan)
    - Appearance settings (Theme, Color profile, Keyboard layout, Accessibility, Permissions, Nudge amount)
  - Click-outside-to-close functionality
  - Hover-based submenu navigation

- **Resizable Side Panels** - `2025-12-04 14:00:00`
  - Both left (LayersPanel) and right (InspectorPanel) panels are now resizable
  - Minimum width: 208px (left), 288px (right)
  - Maximum width: 600px for both panels
  - Drag handles on the right edge of each panel
  - Smooth resize interaction with visual feedback

- **Table Controls for Shapes** - `2025-12-04 14:00:00`
  - Icon button row for Rectangle and Frame nodes in InspectorPanel
  - Controls: Select matching layers, Create component, Use as mask, Union, Edit object
  - Only visible in Design mode for shape nodes
  - Proper hover states and tooltips

- **Dynamic Effects Controls** - `2025-12-04 14:00:00`
  - Effect type selector with 4 options: Drop Shadow, Inner Shadow, Layer Blur, Background Blur
  - Dynamic controls that change based on selected effect type:
    - Drop Shadow: Preset buttons + custom CSS input
    - Inner Shadow: Custom CSS input
    - Layer Blur / Background Blur: Radius slider
  - Effect type auto-detected from node properties
  - Visual icons for each effect type

- **Enhanced Export Options** - `2025-12-04 14:00:00`
  - Multiple quick export buttons:
    - PNG @1x, @2x, @3x
    - SVG @1x
    - JPG @1x
    - PDF @1x
  - Custom export settings:
    - Format selector (PNG, SVG, JPG, PDF)
    - Scale selector (0.5x, 1x, 1.5x, 2x, 3x, 4x)
    - Export button with download icon

- **All Accordions Expanded by Default** - `2025-12-04 14:00:00`
  - Left panel: Pages, Layers expanded by default (File/Assets are now tabs)
  - Right panel: Position, Layout, Appearance, Fill, Stroke, Effects, Typography, Export all expanded by default
  - Sections remain collapsible for user preference

#### Changed
- **Left Panel Structure** - `2025-12-04 16:00:00`
  - File and Assets are now tabs instead of accordion sections
  - Pages and Layers remain as accordion sections below tabs
  - Improved visual hierarchy

- **Right Panel Structure** - `2025-12-04 14:00:00`
  - All sections expanded by default for better discoverability
  - Effects section now has dynamic controls based on effect type
  - Export section enhanced with multiple export options

- **Panel Widths** - `2025-12-04 14:00:00`
  - Default widths: 208px for both left and right panels (matching)
  - Both panels resizable between 208-600px
  - Updated: `2025-12-04 16:30:00` - Right panel default width changed from 288px to 208px to match left panel

#### Fixed
- **Panel Resize Handles** - `2025-12-04 14:00:00`
  - Panel resize handles properly positioned
  - File button no longer blocks left panel content (top spacing maintained)
  - Accordion state management improved
  - Effect type detection and state synchronization

## [1.0.0] - 2024-01-01 - Initial Release

### Added
- **Auto-Layout System**
  - Vertical and horizontal layout modes
  - Gap and padding controls
  - Alignment and justification options
  - Flexbox-based rendering

- **Corner Radius**
  - Radius property for Rectangles and Frames
  - Visual corner radius controls

- **Image Support**
  - Upload images directly to canvas
  - Image node type with proper rendering

- **Code Generation**
  - CSS generation for Dev Mode
  - React/JSX code generation
  - Auto-layout interpreted as Flexbox

- **Design Tools**
  - Select Tool (V)
  - Frame Tool (F)
  - Rectangle Tool (R)
  - Text Tool (T)
  - Pen Tool (P)
  - Hand Tool (H)

- **Inspector Panel**
  - Position controls (X, Y, Rotation)
  - Layout controls (Width, Height, Auto-layout)
  - Appearance controls (Opacity, Corner Radius)
  - Fill controls (Color picker, Gradient support)
  - Stroke controls (Border color, width, style)
  - Typography controls (Font family, size, weight, line height, letter spacing, text align)

- **Layers Panel**
  - Layer hierarchy display
  - Search and filter functionality
  - Selection highlighting
  - Component library view

- **History System**
  - Undo/Redo functionality
  - Keyboard shortcuts (Ctrl+Z, Ctrl+Y)

- **Save/Load**
  - JSON-based design state persistence
  - File save and load functionality

- **Dev Mode**
  - Code generation view
  - Measurement mode
  - Read-only canvas

### Known Limitations
- Auto-Layout: Reordering children requires manual x/y adjustment
- Text: Single-line only
- Export: UI exists but actual rendering to canvas needs implementation

---

## Version History

- **[Unreleased]**: Current development version with latest features (2025-12-04)
- **[1.0.0]**: Initial release with core functionality (2024-01-01)

## Change Log Format

Each entry includes:
- **Date**: YYYY-MM-DD format
- **Time**: HH:MM:SS format (when available)
- **Category**: Added, Changed, Fixed, Deprecated, Removed, Security
- **Description**: Detailed description of the change

Entries are organized chronologically within each version, with most recent changes first.

---

## Notes

- All changes are backward compatible through migration utilities
- TypeScript types are extended, not replaced
- Saved design files from previous versions are automatically migrated

