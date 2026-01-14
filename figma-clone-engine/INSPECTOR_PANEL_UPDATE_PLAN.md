# Inspector Panel Update Plan

## Overview
Update the Inspector Panel to:
1. Show different content for Design vs Prototype tabs
2. Expand Variables, Styles, and Export sections by default with all options visible
3. Make each option its own section (no plus icons needed)

---

## Task 1: Implement Prototype Tab Content
**Status:** ⬜ Not Started

### 1.1 Create Prototype Tab Structure
- [ ] Add prototype-specific sections when `inspectorTab === 'prototype'`
- [ ] Show different content than Design tab
- [ ] Include sections for:
  - **Interactions Section**: Add interactions between frames/components
  - **Flow Starting Point**: Mark frames as starting points
  - **Prototype Settings**: Animation settings, transitions
  - **Hotspots**: Define clickable areas
  - **Overlays**: Modal overlays and navigation

### 1.2 Prototype Interactions Section
- [ ] "Add interaction" button/control
- [ ] List of existing interactions (if any)
- [ ] Interaction settings:
  - Trigger (On click, On drag, On hover, etc.)
  - Action (Navigate to, Open overlay, Back, Close overlay, etc.)
  - Destination frame/component
  - Animation (Instant, Dissolve, Smart animate, etc.)
  - Duration

### 1.3 Flow Starting Point
- [ ] Checkbox to mark frame as starting point
- [ ] List of all starting points in the file

### 1.4 Prototype Settings
- [ ] Device frame selection
- [ ] Background color
- [ ] Starting frame selection

---

## Task 2: Expand Variables Section by Default
**Status:** ⬜ Not Started

### 2.1 Current State Analysis
- [ ] Check current Variables section implementation
- [ ] Identify what's currently shown vs what should be shown
- [ ] List all variable types that should be displayed

### 2.2 Variables Section Structure
- [ ] Remove plus icon requirement
- [ ] Show all variables expanded by default
- [ ] Each variable should be its own subsection with:
  - Variable name
  - Variable type (Color, Number, String, Boolean)
  - Current value
  - Edit controls
  - Delete option

### 2.3 Variable Types to Display
- [ ] **Color Variables**: Show color swatch, hex value, usage count
- [ ] **Number Variables**: Show current value, min/max if applicable
- [ ] **String Variables**: Show text value
- [ ] **Boolean Variables**: Show true/false toggle

### 2.4 Default Expanded State
- [ ] Ensure Variables section is in `getInitialExpandedSections()`
- [ ] All variable subsections expanded by default
- [ ] No need to click to see variables

---

## Task 3: Expand Styles Section by Default
**Status:** ⬜ Not Started

### 3.1 Current State Analysis
- [ ] Check current Styles section implementation
- [ ] Identify what's currently shown vs what should be shown
- [ ] List all style types that should be displayed

### 3.2 Styles Section Structure
- [ ] Remove plus icon requirement
- [ ] Show all styles expanded by default
- [ ] Each style should be its own subsection with:
  - Style name
  - Style type (Text, Fill, Effect, Grid)
  - Preview/preview swatch
  - Edit controls
  - Delete option

### 3.3 Style Types to Display
- [ ] **Text Styles**: Font family, size, weight, line height, etc.
- [ ] **Fill Styles**: Color/gradient swatches
- [ ] **Effect Styles**: Shadow/blur previews
- [ ] **Grid Styles**: Grid pattern previews

### 3.4 Default Expanded State
- [ ] Ensure Styles section is in `getInitialExpandedSections()`
- [ ] All style subsections expanded by default
- [ ] No need to click to see styles

---

## Task 4: Expand Export Section by Default
**Status:** ⬜ Not Started

### 4.1 Current State Analysis
- [ ] Check current Export section implementation
- [ ] Review existing export options
- [ ] Identify missing export formats/options

### 4.2 Export Section Structure
- [ ] Remove plus icon requirement
- [ ] Show all export settings expanded by default
- [ ] Each export option should be its own subsection:
  - Export preset name
  - Format (PNG, JPG, SVG, PDF)
  - Scale (1x, 2x, 3x, etc.)
  - Suffix (optional)
  - Export button for that preset

### 4.3 Export Options to Display
- [ ] **Default Export**: 1x PNG (always visible)
- [ ] **Additional Exports**: All configured export presets
- [ ] **Export Settings**: Format dropdown, scale dropdown, suffix input
- [ ] **Export Button**: "Export [Element Name]" button

### 4.4 Default Expanded State
- [ ] Ensure Export section is in `getInitialExpandedSections()`
- [ ] All export presets visible by default
- [ ] No need to click to see export options

---

## Task 5: Update Section Expansion Logic
**Status:** ⬜ Not Started

### 5.1 Update Initial Expanded Sections
- [ ] Add 'variables' to `getInitialExpandedSections()`
- [ ] Add 'styles' to `getInitialExpandedSections()`
- [ ] Ensure 'export' is already included
- [ ] Update all section expansion logic to include these

### 5.2 Update useEffect for Selection Changes
- [ ] Ensure Variables, Styles, Export remain expanded on selection change
- [ ] Add these sections to the sectionsToExpand set in the useEffect

### 5.3 Remove Plus Icon Dependencies
- [ ] Remove any logic that requires clicking plus icons to see content
- [ ] Make all subsections visible by default
- [ ] Keep accordion functionality for collapsing if user wants

---

## Task 6: Conditional Rendering Based on Tab
**Status:** ⬜ Not Started

### 6.1 Design Tab Content
- [ ] Ensure all Design tab sections only show when `inspectorTab === 'design'`
- [ ] Sections to show:
  - Position
  - Layout
  - Constraints
  - Appearance
  - Fill
  - Stroke
  - Effects
  - Typography
  - Variables (expanded)
  - Styles (expanded)
  - Export (expanded)
  - Component (if applicable)

### 6.2 Prototype Tab Content
- [ ] Show Prototype-specific sections only when `inspectorTab === 'prototype'`
- [ ] Hide Design sections when on Prototype tab
- [ ] Sections to show:
  - Interactions
  - Flow Starting Point
  - Prototype Settings
  - Hotspots (if applicable)
  - Overlays (if applicable)

### 6.3 Tab Switching Logic
- [ ] Ensure tab switching properly shows/hides content
- [ ] Maintain section expansion state per tab if needed
- [ ] Reset to appropriate defaults when switching tabs

---

## Task 7: Testing & Verification
**Status:** ⬜ Not Started

### 7.1 Design Tab Testing
- [ ] Verify all sections are expanded by default
- [ ] Verify Variables section shows all variables
- [ ] Verify Styles section shows all styles
- [ ] Verify Export section shows all export options
- [ ] Test collapsing/expanding sections
- [ ] Test with different node types

### 7.2 Prototype Tab Testing
- [ ] Verify Prototype tab shows different content
- [ ] Test adding interactions
- [ ] Test prototype settings
- [ ] Verify interactions persist
- [ ] Test flow starting points

### 7.3 Tab Switching Testing
- [ ] Test switching between Design and Prototype tabs
- [ ] Verify content changes appropriately
- [ ] Verify no content overlap
- [ ] Test with different selections

### 7.4 Edge Cases
- [ ] Test with no selection (page inspector)
- [ ] Test with multiple selections
- [ ] Test with empty Variables/Styles lists
- [ ] Test with many Variables/Styles

---

## Implementation Order

1. **Task 5** - Update section expansion logic (foundation)
2. **Task 2** - Expand Variables section
3. **Task 3** - Expand Styles section
4. **Task 4** - Expand Export section
5. **Task 6** - Conditional rendering for tabs
6. **Task 1** - Implement Prototype tab content
7. **Task 7** - Testing & verification

---

## Notes

- All sections should be expanded by default
- Users can still collapse sections if they want
- Prototype tab should have completely different content than Design tab
- Variables, Styles, and Export should show all their options without clicking plus icons
- Each option/item should be its own visible section

