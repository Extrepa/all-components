# Release Notes

> For detailed changelog, see [CHANGELOG.md](../CHANGELOG.md)

## [Unreleased] - Latest Development

### Major Features Added
- **Resizable Side Panels** - Both left and right panels can now be resized (208-600px range)
- **File Menu Dropdown** - Comprehensive menu with Preferences submenu accessible from top-left button
- **Table Controls for Shapes** - Icon buttons for matching layers, components, mask, union, edit operations
- **Dynamic Effects Controls** - Effect type selector with context-aware controls (Drop Shadow, Inner Shadow, Layer Blur, Background Blur)
- **Enhanced Export Options** - Multiple quick export buttons and custom export settings
- **File/Assets Tab System** - Converted to tabs that switch content below
- **All Accordions Expanded by Default** - Better discoverability for all inspector sections

### UI Improvements
- Improved visual hierarchy in left panel
- Better organization of inspector controls
- Enhanced hover states and visual feedback
- Smooth resize interactions

## [1.0.0] - Initial Release

### Core Features
- **Auto-Layout System** - Vertical and horizontal layout modes with gap and padding
- **Corner Radius** - Radius property for Rectangles and Frames
- **Image Support** - Upload images directly to canvas
- **Code Generation** - CSS and React/JSX code generation in Dev Mode
- **Design Tools** - Select, Frame, Rectangle, Text, Pen, Hand tools
- **Inspector Panel** - Comprehensive property editing
- **Layers Panel** - Layer hierarchy with search
- **History System** - Undo/Redo functionality
- **Save/Load** - JSON-based design state persistence

### Known Limitations
- **Auto-Layout:** Reordering children requires manual x/y adjustment
- **Text:** Single-line only
- **Export:** UI exists but actual rendering to canvas needs implementation