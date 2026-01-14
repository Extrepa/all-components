# Feature Accessibility Checklist

This document verifies that all implemented features are accessible through the UI, keyboard shortcuts, or both.

## ✅ Fully Accessible Features

### Design Tools
- ✅ **Select Tool** - Bottom dock + Keyboard (`V`) - Pop-out: Move, Hand, Scale
- ✅ **Frame Tool** - Bottom dock (Grid tool) + Keyboard (`F`) - Pop-out: Section, Frame, Slice
- ✅ **Rectangle Tool** - Bottom dock + Keyboard (`R`) - Pop-out: Rectangle, Line, Arrow, Ellipse, Polygon, Star, Image
- ✅ **Text Tool** - Bottom dock + Keyboard (`T`)
- ✅ **Pen Tool** - Bottom dock + Keyboard (`P`) - Pop-out: Pen, Pencil
- ✅ **Hand Tool** - Bottom dock (Select pop-out) + Keyboard (`H`)
- ✅ **Scale Tool** - Bottom dock (Select pop-out) + Keyboard (`K`)
- ✅ **Line Tool** - Bottom dock (Rectangle pop-out) + Keyboard (`L`)
- ✅ **Arrow Tool** - Bottom dock (Rectangle pop-out) + Keyboard (`⇧L`)
- ✅ **Ellipse Tool** - Bottom dock (Rectangle pop-out) + Keyboard (`O`)
- ✅ **Polygon Tool** - Bottom dock (Rectangle pop-out)
- ✅ **Star Tool** - Bottom dock (Rectangle pop-out)
- ✅ **Section Tool** - Bottom dock (Grid pop-out) + Keyboard (`⇧S`)
- ✅ **Slice Tool** - Bottom dock (Grid pop-out) + Keyboard (`S`)
- ✅ **Pencil Tool** - Bottom dock (Pen pop-out) + Keyboard (`⇧P`)
- ✅ **Comment Tool** - Bottom dock (draw mode) - Click to place comments
- ✅ **Image Upload** - Bottom dock (Rectangle pop-out)

### History & File Operations
- ✅ **Undo** - Top nav + Keyboard (`Ctrl+Z` / `Cmd+Z`)
- ✅ **Redo** - Top nav + Keyboard (`Ctrl+Y` / `Cmd+Y`)
- ✅ **Save** - Top nav
- ✅ **Load** - Top nav

### View Controls
- ✅ **Zoom In/Out** - Top nav
- ✅ **Zoom** - Keyboard (`Ctrl/Cmd + Scroll`)
- ✅ **Pan** - Keyboard (`Space + Drag` or `Middle Mouse`)

### Selection & Editing
- ✅ **Select Layer** - Click canvas or Layers panel
- ✅ **Multi-select** - Keyboard (`Shift + Click`)
- ✅ **Copy** - Keyboard (`Ctrl+C` / `Cmd+C`)
- ✅ **Paste** - Keyboard (`Ctrl+V` / `Cmd+V`)
- ✅ **Duplicate** - Keyboard (`Ctrl+D` / `Cmd+D`)
- ✅ **Group** - Keyboard (`Ctrl+G` / `Cmd+G`)
- ✅ **Resize** - Drag handles on selected elements
- ✅ **Move** - Drag selected elements
- ✅ **Inline Text Edit** - Double-click text nodes

### Properties (Inspector Panel)
- ✅ **Position (X, Y)** - Right sidebar (collapsible)
- ✅ **Rotation** - Right sidebar
- ✅ **Size (Width, Height)** - Right sidebar
- ✅ **Corner Radius** - Right sidebar
- ✅ **Fill Color** - Right sidebar (collapsible, icon buttons)
- ✅ **Opacity** - Right sidebar
- ✅ **Auto-Layout** - Right sidebar
- ✅ **Gap/Spacing** - Right sidebar
- ✅ **Padding** - Right sidebar
- ✅ **Alignment** - Right sidebar (icon buttons)
- ✅ **Justification** - Right sidebar (icon buttons)
- ✅ **Border** - Right sidebar (collapsible)
- ✅ **Shadow** - Right sidebar (collapsible)
- ✅ **Typography** - Right sidebar (Text nodes, collapsible)
- ✅ **Export** - Right sidebar (collapsible, Design mode only)

### Dev Mode Features
- ✅ **Switch to Dev Mode** - Top nav
- ✅ **Switch to Design Mode** - Top nav (in Dev mode)
- ✅ **CSS Code Generation** - Right sidebar (Dev mode)
- ✅ **React Code Generation** - Right sidebar (Dev mode)
- ✅ **Distance Measurements** - Canvas (Dev mode, hover over elements)

## ⚠️ Partially Accessible Features

### Components
- ⚠️ **Component Creation** - Keyboard only (`Ctrl+G` on Frame, then convert)
- ✅ **Component Library** - Left panel Assets section (fully functional)
- ✅ **Instance Creation** - Drag components from Assets tab to canvas to create instances

### Comments
- ✅ **Comment Tool** - Bottom dock (draw mode) + Click canvas to place
  - Accessible via MessageSquare icon in draw mode dock
  - Click anywhere on canvas to place comment
  - Comments visible in Layers panel

### Code View
- ⚠️ **Code View** - Placeholder button in dock (not functional, but available in Dev mode inspector)

### Export
- ✅ **Export** - Fully implemented in inspector
  - Quick export buttons (PNG @1x, @2x, @3x, SVG, JPG)
  - Custom export settings with format and scale selectors
  - Functional PNG/SVG/JPG export

## ✅ Recently Added Features

### Eyedropper Tool
- ✅ **Eyedropper Tool** - Fully implemented
  - Keyboard shortcut: `I`
  - Tool button in bottom dock
  - Color picking from canvas
  - Updates selected node colors

### Advanced Features
- ✅ **Export** - Fully functional in inspector panel
- ✅ **Constraints** - Fully implemented in inspector
- ✅ **Context Menu** - Fully implemented (right-click menu)
- ✅ **Component Drag-to-Canvas** - Drag components from Assets tab to canvas
- ✅ **Layer Operations** - Bring Forward/Backward, Lock/Unlock, Hide/Show
- ✅ **Page Management** - Add/delete pages (fully implemented)
- ✅ **Alignment Guides** - Visual guides when dragging (automatically shows)
- ✅ **Rulers** - Measurement rulers (can be enabled via state)
- ✅ **Eyedropper Tool** - Color picking from canvas (keyboard: I)

## Recommendations

### Immediate Actions
1. ✅ **Add Hand Tool to Bottom Dock** - *Completed*
2. ✅ **Add Frame Tool to Bottom Dock** - *Completed (via Grid tool)*
3. ✅ **Add Export Section** - *Completed (in Inspector panel)*
4. ✅ **Implement Context Menu** - *Completed (right-click menu for common actions)*
5. ✅ **Add Comment Tool** - *Completed (in draw mode dock)*
6. ✅ **Add Scale Tool** - *Completed (in Select tool pop-out)*
7. ✅ **Add Eyedropper Tool** - *Completed (keyboard: I)*
8. ✅ **Implement Component Drag-to-Canvas** - *Completed*

### Future Enhancements
1. ✅ **Pages Section** - *Completed (in left sidebar)*
2. ✅ **Assets Panel** - *Completed (in left sidebar)*
3. ✅ **Constraints Section** - *Completed (in right sidebar inspector)*
4. ✅ **Alignment Guides** - *Completed (shows automatically when dragging)*
5. ✅ **Rulers** - *Completed (can be enabled, framework ready)*

## Keyboard Shortcuts Summary

| Action | Shortcut | Status |
|--------|-----------|--------|
| Select Tool | `V` | ✅ |
| Frame Tool | `F` | ✅ |
| Rectangle Tool | `R` | ✅ |
| Text Tool | `T` | ✅ |
| Pen Tool | `P` | ✅ |
| Hand Tool | `H` | ✅ |
| Scale Tool | `K` | ✅ |
| Line Tool | `L` | ✅ |
| Arrow Tool | `⇧L` | ✅ |
| Ellipse Tool | `O` | ✅ |
| Section Tool | `⇧S` | ✅ |
| Slice Tool | `S` | ✅ |
| Pencil Tool | `⇧P` | ✅ |
| Undo | `Ctrl+Z` / `Cmd+Z` | ✅ |
| Redo | `Ctrl+Y` / `Cmd+Y` / `Ctrl+Shift+Z` | ✅ |
| Copy | `Ctrl+C` / `Cmd+C` | ✅ |
| Paste | `Ctrl+V` / `Cmd+V` | ✅ |
| Duplicate | `Ctrl+D` / `Cmd+D` | ✅ |
| Delete | `Delete` / `Backspace` | ✅ |
| Group | `Ctrl+G` / `Cmd+G` | ✅ |
| Ungroup | `Ctrl+Shift+G` / `Cmd+Shift+G` | ✅ |
| Pan | `Space + Drag` / Middle Mouse | ✅ |
| Zoom | `Ctrl/Cmd + Scroll` | ✅ |
| Eyedropper | `I` | ✅ |
| Context Menu | Right-click | ✅ |
| Page Management | Layers Panel UI | ✅ |
| Alignment Guides | Auto-shows on drag | ✅ |
| Rulers | Can be enabled | ✅ |

## Current UI Layout Status

### ✅ Complete
- Left Sidebar: Layers panel
- Right Sidebar: Inspector panel (Design & Dev modes)
- Bottom Dock: Primary tools
- Top Nav: Secondary controls

### ⏳ In Progress
- Bottom Dock: Adding missing tools (Hand tool added)
- Top Nav: May need export button

### 📋 Planned
- Left Sidebar: Pages, Assets tabs
- Right Sidebar: Export, Constraints sections
- Canvas: Context menu, guides, rulers

