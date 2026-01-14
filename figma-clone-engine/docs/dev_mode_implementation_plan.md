# Dev Mode Implementation Plan

## Overview
Update the left and right panels to match Figma's Dev Mode interface based on the provided screenshots and research.

## Research Findings

### Figma Dev Mode Features (Based on Screenshots & Research)

**Left Panel:**
- "Ready for development" status indicator
- Asset/component list with thumbnails
- Each asset shows: thumbnail, title, description
- Layers section (maintained from Design mode)

**Right Panel:**
- **Tabs**: "Inspect" (default) and "Plugins"
- **Layer Properties Section**:
  - Box model visualization (Border, Padding, Content areas)
  - Layout section with List/Code tabs
  - CSS dropdown selector
  - CSS properties display (display, height, padding, justify-content, align-items, gap, flex)
- **Colors Section**: List of colors with swatches
- **Assets Section**: Related assets for selected element

## Left Panel (LayersPanel) - Dev Mode Updates

### Current State
- Shows File/Assets tabs, Pages, Layers sections
- Same structure as Design mode

### Required Changes

1. **Add "Ready for development" Status** ✅
   - Display below file name/status in File tab
   - Green text or badge: "Ready for development"
   - Shows when file is ready for handoff

2. **Update Assets Tab for Dev Mode** ✅
   - Show asset list with thumbnails
   - Each asset should have:
     - Thumbnail/icon placeholder (square with inner rectangle)
     - Title (longer gray bar placeholder)
     - Subtitle/description (shorter gray bar placeholder)
   - Empty state if no assets
   - 5+ items visible in list

3. **Maintain Layers Section** ✅
   - Keep layers visible but styled for Dev mode
   - Green selection highlight (already implemented)
   - Show layer hierarchy

## Right Panel (InspectorPanel) - Dev Mode Updates

### Current State
- Shows CSS and React/JSX code blocks
- Basic code generation
- Background color: `#111`

### Required Changes

1. **Add Tabs at Top** ✅
   - "Inspect" tab (default, selected)
   - "Plugins" tab
   - Tab switcher UI with proper styling
   - Tabs positioned at top of panel

2. **Layer Properties Section** (Inspect tab) ✅
   - **Box Model Visualization**
     - Visual representation of Border, Padding, Content
     - Nested rounded rectangles
     - Outer: "Border" label
     - Inner: "Padding" label
     - Innermost: Dashed outline for content
     - Small gray square handles on all sides (visual only)
   
   - **Layout Section**
     - Tabs: "List" and "Code"
     - Code tab shows CSS properties with placeholders:
       - `display: [placeholder]`
       - `height: [placeholder]`
       - `padding: [placeholder]`
       - `justify-content: [placeholder]`
       - `align-items: [placeholder]`
       - `gap: [placeholder]`
       - `flex: [placeholder]`
     - CSS dropdown selector (CSS, SCSS, etc.) - positioned next to tabs
     - List tab shows formatted property list (future)

3. **Colors Section** ✅
   - List of colors used in the selected element
   - Color swatches (small squares) with values
   - Each color: swatch + value/name placeholder (gray bar)
   - Extract colors from fill, stroke, shadows

4. **Assets Section** ✅
   - Collapsible section with chevron
   - Shows assets related to the selected element
   - Asset list with thumbnails and placeholders
   - Similar to left panel asset list

5. **Keep Existing Code Blocks** ✅
   - CSS code block (enhanced formatting)
   - React/JSX code block (enhanced formatting)
   - Better syntax highlighting

## Implementation Steps

### Phase 1: Right Panel Structure (Priority: High)
1. ✅ Add tab switcher (Inspect/Plugins) at top
2. ✅ Create Layer Properties section with box model visualization
3. ✅ Add Layout section with List/Code tabs
4. ✅ Add CSS dropdown selector
5. ✅ Add Colors section with color extraction
6. ✅ Add Assets section

### Phase 2: Left Panel Updates (Priority: High)
1. ✅ Add "Ready for development" status
2. ✅ Update Assets tab for Dev mode with thumbnails
3. ✅ Style adjustments for Dev mode

### Phase 3: Enhanced Features (Priority: Medium)
1. Box model visualization component (interactive handles - future)
2. Color extraction from all node properties
3. Asset relationship detection
4. Improved code formatting with syntax highlighting

## File Structure

```
src/components/
├── InspectorPanel.tsx (update Dev mode section)
├── LayersPanel.tsx (update Dev mode styling)
└── DevMode/
    ├── BoxModelVisualization.tsx (new)
    ├── LayerProperties.tsx (new)
    ├── ColorList.tsx (new)
    └── AssetList.tsx (new)
```

## Design Specifications

### Colors
- Dev mode background: `#111` (already implemented)
- Green accents: `#10b981` (green-500) for "Ready for development"
- Text: `#e5e7eb` (gray-200)
- Borders: `#374151` (gray-700)
- Placeholders: `#4b5563` (gray-600)

### Typography
- Section headers: `text-xs font-bold uppercase`
- Code: `font-mono text-[10px]`
- Labels: `text-[10px] text-gray-500`
- Status text: `text-xs text-green-500`

### Spacing
- Section padding: `px-2 py-2`
- Item spacing: `space-y-1.5`
- Border radius: `rounded-lg`
- Tab padding: `px-3 py-2`

## Project Rename Feature Plan

### Requirements
- **Editable in both Design and Dev mode** ✅
- Click on "Untitled" text to edit (any time, any mode)
- Inline editing with input field
- Save on Enter or blur
- Cancel on Escape
- Update state with new project name
- Persist to saved files
- **Dropdown menu next to project name** ✅
  - Chevron/caret icon next to name
  - Dropdown with project-specific options:
    - Show version history
    - Export
    - Add to sidebar
    - Create branch
  - **Note**: This is separate from the top-left file button menu (which has the comprehensive File/Edit/View/etc. menu)

### Implementation Details

1. **Add `projectName` to DesignState**
   ```typescript
   interface DesignState {
     // ... existing properties
     projectName: string; // default: "Untitled"
   }
   ```

2. **Create Inline Editable Component with Dropdown**
   - State: `isEditing` boolean
   - State: `editValue` string
   - State: `dropdownOpen` boolean
   - Input field appears on click
   - Save on Enter or blur
   - Cancel on Escape
   - **Dropdown menu** with options:
     - File settings
     - Version history
     - Share
     - Export
     - Duplicate
     - Move to...
     - Delete

3. **Update LayersPanel**
   - Replace static "Untitled" text with editable component + dropdown
   - Works in both Design and Dev mode
   - Handle save/cancel logic
   - Update DesignState on save
   - Dropdown positioned below project name

4. **Persistence**
   - Include projectName in save/load JSON
   - Migration: default to "Untitled" for old files

### User Experience Flow

**Editing Project Name:**
1. User clicks "Untitled" text (in Design or Dev mode)
2. Input field appears with "Untitled" selected
3. User types new name
4. Press Enter or click outside → Save
5. Press Escape → Cancel (revert to original)
6. Visual feedback: border highlight during editing

**Using Dropdown:**
1. User clicks chevron/dropdown icon next to project name
2. Dropdown menu appears with file options
3. User selects an option
4. Appropriate action executes (settings, share, export, etc.)
5. Dropdown closes after selection

### Code Structure
```typescript
// In LayersPanel.tsx
const [isEditingName, setIsEditingName] = useState(false);
const [editNameValue, setEditNameValue] = useState(state.projectName || 'Untitled');
const [dropdownOpen, setDropdownOpen] = useState(false);

const handleNameSave = () => {
  onStateChange((p: DesignState) => ({ ...p, projectName: editNameValue }));
  setIsEditingName(false);
};

const handleNameCancel = () => {
  setEditNameValue(state.projectName || 'Untitled');
  setIsEditingName(false);
};

// Dropdown options next to project name (based on Figma's project name dropdown)
const projectNameDropdownOptions = [
  { id: 'version', label: 'Show version history' },
  { id: 'export', label: 'Export' },
  { id: 'sidebar', label: 'Add to sidebar' },
  { id: 'branch', label: 'Create branch' },
];

// Note: The top-left file button has the comprehensive menu (File, Edit, View, Object, Text, Arrange, Vector, Plugins, Widgets, Preferences, Libraries, etc.)
// This is already implemented in FileMenu.tsx
```

### UI Structure
```tsx
<div className="flex items-center gap-1">
  {/* Editable Project Name */}
  {isEditingName ? (
    <input
      value={editNameValue}
      onChange={(e) => setEditNameValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleNameSave();
        if (e.key === 'Escape') handleNameCancel();
      }}
      onBlur={handleNameSave}
      autoFocus
      className="px-2 py-1 text-xs font-medium bg-gray-800 border border-blue-500 rounded"
    />
  ) : (
    <button
      onClick={() => setIsEditingName(true)}
      className="px-2 py-1 text-xs text-gray-300 font-medium hover:bg-gray-700 rounded"
    >
      {state.projectName || 'Untitled'}
    </button>
  )}
  
  {/* Project Name Dropdown Menu */}
  <div className="relative">
    <button
      onClick={() => setDropdownOpen(!dropdownOpen)}
      className="p-1 text-gray-500 hover:text-white"
      title="File options"
    >
      <ChevronDown size={12} />
    </button>
    {dropdownOpen && (
      <div className="absolute top-full left-0 mt-1 bg-[#2c2c2c] border border-gray-700 rounded-lg shadow-lg min-w-[180px] py-1 z-50">
        {projectNameDropdownOptions.map(option => (
          <button
            key={option.id}
            onClick={() => {
              handleProjectNameMenuAction(option.id);
              setDropdownOpen(false);
            }}
            className="w-full px-3 py-1.5 text-xs text-left text-gray-300 hover:bg-gray-700"
          >
            {option.label}
          </button>
        ))}
      </div>
    )}
  </div>
</div>
```

## Testing Checklist

### Dev Mode Left Panel
- [ ] "Ready for development" appears in File tab
- [ ] Assets tab shows thumbnail list in Dev mode
- [ ] Layers section maintains green selection
- [ ] All sections properly styled

### Dev Mode Right Panel
- [ ] Inspect/Plugins tabs appear and switch
- [ ] Box model visualization renders correctly
- [ ] Layout section shows CSS properties
- [ ] Colors section extracts and displays colors
- [ ] Assets section shows related assets
- [ ] Code blocks still functional

### Project Rename
- [ ] Click "Untitled" opens input (works in Design mode)
- [ ] Click "Untitled" opens input (works in Dev mode)
- [ ] Enter saves new name
- [ ] Escape cancels edit
- [ ] Blur saves new name
- [ ] Name persists in saved files
- [ ] Name loads from saved files
- [ ] Dropdown appears next to project name
- [ ] Dropdown shows: Show version history, Export, Add to sidebar, Create branch
- [ ] Dropdown closes on selection
- [ ] Dropdown closes on outside click
- [ ] Top-left file button menu still works (comprehensive File/Edit/View/etc. menu)

## Notes

- All changes should be backward compatible
- Dev mode should not break existing functionality
- Project name should default to "Untitled" if not set
- Color extraction should handle all color properties (fill, stroke, shadows, gradients)
- **Project name is editable in BOTH Design and Dev mode** ✅
- **Dropdown menu appears next to project name in both modes** ✅
- **Project name dropdown has 4 options**: Show version history, Export, Add to sidebar, Create branch
- **Top-left file button has comprehensive menu**: File, Edit, View, Object, Text, Arrange, Vector, Plugins, Widgets, Preferences, Libraries (already implemented in FileMenu.tsx)
- Dropdown should close on outside click or selection
