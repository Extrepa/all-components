# Figma Inspector Panel Reference

## Panel Structure

### Top Header Bar
- Left: User avatar (circular "C" icon)
- Center: Tabs - "Design" (selected) and "Prototype"
- Right: Play icon, dropdown, "Share" button (blue), Zoom level with dropdown

### Object Header Section
Shows the selected object type (e.g., "Rectangle", "Frame") with action buttons on the right.

## Buttons by Object Type

### Frame Object
- Code icon (`</>`)
- Grid icon (components/assets)
- Ellipsis menu (three dots) - opens dropdown with:
  - Use as mask (^⌘M) - highlighted in blue
  - Union (⌥⇧U)
  - Subtract (⌥⇧S)
  - Intersect (⌥⇧I)
  - Exclude (⌥⇧E)
  - Flatten (⌥⇧F)

### Rectangle Object
- Grid icon (styles/components) - 2x2 grid
- Grid icon with diagonal line (instances/variants) - 2x2 grid with diagonal
- Moon/half-circle icon (mask/blend mode)
- Stack of papers icon with dropdown (styles/presets)
- Square with four dots (constraints/auto-layout)

## Sections (in order)

### 1. Position Section
- Title: "Position"
- Alignment row: 6 icons (left, horizontal center, right, top, vertical center, bottom)
- X and Y inputs with plus buttons
- Constraints: H and I dropdowns with visual representation
- Rotation: Input with reset, flip horizontal, flip vertical icons

### 2. Layout Section
- Title: "Layout"
- Dimensions: W and H inputs
- Aspect ratio lock icon next to H input

### 3. Appearance Section
- Title: "Appearance"
- Icons on right: Eye (visibility), Teardrop (blend mode)
- Opacity: Input with checkerboard icon
- Corner radius: Input with rounded square icon and unlink corners icon
- Blend mode dropdown: Opens menu with options (Normal, Darken, Multiply, etc.)

### 4. Fill Section
- Title: "Fill"
- Icons on right: Grid (styles), Plus (add fill)
- Color swatch with hex code
- Opacity percentage
- Icons: Eye (visibility), Minus (remove fill)

### 5. Stroke Section
- Title: "Stroke"
- Icons on right: Grid (styles), Plus (add stroke)
- Pattern/color swatch
- Position dropdown (Outside, Inside, Center)
- Weight input with icon
- Icons: Eye (visibility), Minus (remove), Settings, Alignment

### 6. Effects Section
- Title: "Effects"
- Icons on right: Grid (styles), Plus (add effect)
- Checkbox for effects (e.g., "Drop shadow")
- Icons: Eye (visibility), Minus (remove)

### 7. Export Section
- Title: "Export"
- Icon on right: Plus (add export)
- Scale dropdown (1x, 2x, etc.)
- Format dropdown (PNG, SVG, etc.)
- Export button

## Visual Style
- Background: Dark gray (#2c2c2c) in Design mode
- Sections: Collapsible with chevron
- Inputs: Light gray rounded rectangles
- Icons: White/gray outlines
- Selected/highlighted: Blue background
- Dropdowns: Dark gray with white text

