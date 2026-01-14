# Dock Pop-Out Menu Mapping

Based on the screenshot files in `/Users/extrepa/Desktop/FigmaDesignReferences/Dock_Screenshot/`, this document maps out the exact structure of each pop-out menu in the bottom dock.

## Screenshot Files
1. `Dock_MoveHandScaleDrawer.png` - Move/Hand/Scale tool drawer
2. `Dock_FrameSectionSliceDrawer.png` - Frame/Section/Slice tool drawer
3. `Dock_RectangleLineArrowEllipsePolygonStarImage:VideoDrawer.png` - Shape tools drawer
4. `Dock_PenPencilDrawer.png` - Pen/Pencil tool drawer
5. `Dock_ActionsDrawerPopup.png` - Actions drawer (if applicable)
6. `DockScreenshot7.png` - Additional dock reference
7. `DevModeBottomDock.png` - Dev mode dock (if different)

## Menu Structure

### 1. Move/Hand/Scale Drawer (Move Tool Group)
**Icon:** MousePointer2 (Move/Select tool)
**Chevron:** Upward pointing chevron
**Menu Items:**
- Move (V) - SELECT tool
- Hand tool (H) - HAND tool
- Scale (K) - SCALE tool

### 2. Frame/Section/Slice Drawer (Frame Tool Group)
**Icon:** Hash (#) - Frame tool
**Chevron:** Upward pointing chevron
**Menu Items:**
- Section (⇧S) - SECTION tool
- Frame (F) - FRAME tool
- Slice (S) - SLICE tool

### 3. Rectangle/Line/Arrow/Ellipse/Polygon/Star/Image Drawer (Shape Tool Group)
**Icon:** Square - Rectangle tool
**Chevron:** Upward pointing chevron
**Menu Items:**
- Rectangle (R) - RECTANGLE tool
- Line (L) - LINE tool
- Arrow (⇧L) - ARROW tool
- Ellipse (O) - ELLIPSE tool (moved here from standalone)
- Polygon - POLYGON tool
- Star - STAR tool
- Image/video... (⇧⌘K) - IMAGE tool

**Note:** Ellipse should NOT be a standalone button - it should be inside this drawer.

### 4. Pen/Pencil Drawer (Pen Tool Group)
**Icon:** PenTool
**Chevron:** Upward pointing chevron
**Menu Items:**
- Pen (P) - PEN tool
- Pencil (⇧P) - PENCIL tool

### 5. Standalone Tools (No Drawer)
- Text (T) - TEXT tool - No chevron, no drawer
- Components - No chevron, no drawer
- Freehand (Squiggly line) - No chevron, no drawer
- Measure (Ruler) - No chevron, no drawer
- Code - No chevron, no drawer

## Tool Organization Summary

**With Drawers (Chevron buttons):**
1. Move/Select tool → Move, Hand, Scale
2. Frame tool → Section, Frame, Slice
3. Rectangle tool → Rectangle, Line, Arrow, **Ellipse**, Polygon, Star, Image
4. Pen tool → Pen, Pencil

**Standalone (No drawer):**
- Text
- Components
- Freehand
- Measure
- Code

## Key Changes Needed
1. **Remove standalone Ellipse button** - it should only be in the Rectangle drawer
2. **Fix pop-out positioning** - menus should appear above the button group
3. **Fix anchor reference** - should reference the entire button group, not just the icon button
4. **Ensure z-index is correct** - menus should appear above everything

