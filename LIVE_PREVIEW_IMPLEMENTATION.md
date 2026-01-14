# Live Preview Implementation

**Date:** 2026-01-09  
**Status:** ✅ **COMPLETE**

---

## Overview

Each component card now has live preview functionality that works differently based on component type:

- **TSX/JSX (React Components):** Embedded iframe to React preview system
- **TS/JS (Code Files):** Code preview showing file contents
- **Other Types:** Error message or fallback

---

## Implementation Details

### Component Card Preview

Each component card now includes:
1. **Preview Container** - Expandable area that shows/hides preview
2. **Preview Toggle Button** - Button to show/hide preview
3. **Type-Specific Rendering** - Different handling based on file type

### How It Works

#### For React Components (TSX/JSX)
1. User clicks card or preview toggle
2. Preview container expands
3. Iframe loads React preview system with component
4. URL format: `../preview/index.html?component=projectName:componentName&embed=true`
5. React preview system renders component in embedded mode

#### For Code Files (TS/JS)
1. User clicks card or preview toggle
2. Preview container expands
3. Fetches component file via HTTP
4. Displays code preview (first 2000 characters)
5. Shows error if file not accessible

### User Interaction

- **Single Click on Card:** Toggles preview
- **Double Click on Card:** Opens detail modal
- **Preview Toggle Button:** Toggles preview
- **Preview Button in Actions:** Opens full preview in new tab

---

## React Preview System Updates

### Embedded Mode

The React preview system now supports embedded mode:
- URL parameter: `?embed=true`
- Hides main UI (header, stats, search, project list)
- Shows only component preview
- Full-screen preview in iframe

### Implementation

```typescript
// Check for embed mode
const isEmbedded = urlParams.get('embed') === 'true';

// Hide UI elements when embedded
if (isEmbedded) {
  // Hide header, stats, search, projects
  // Show only component preview
}
```

---

## Component Type Handling

### TSX/JSX Components
- **Method:** Iframe to React preview system
- **URL:** `../preview/index.html?component=project:name&embed=true`
- **Fallback:** Error message if preview system not running
- **Name Matching:** Case-insensitive with variations (PascalCase, camelCase, kebab-case)
- **Caching:** Preview results cached for instant re-loading

### TS/JS Files
- **Method:** HTTP fetch and code display
- **Display:** First 5000 characters of code (increased from 2000)
- **Syntax Highlighting:** Prism.js for TypeScript, JavaScript, GLSL, CSS
- **Fallback:** Error message if file not accessible
- **Retry:** Automatic retry on network errors (2 attempts)

### Special File Types
- **GLSL:** Code preview with GLSL syntax highlighting
- **CSS:** Code preview with CSS syntax highlighting
- **JSON:** Formatted JSON display
- **Markdown:** Basic markdown rendering
- **Other:** Generic code preview or error message

---

## CSS Styling

### Preview Container
- Expandable with smooth transition
- Max height: 400px
- Border-top separator
- Smooth show/hide animation

### Preview Frame
- Full width
- Height: 300px
- Border radius: 8px
- Background matches theme

### Preview Toggle
- Positioned at bottom-right of card
- Small button with icon
- Changes text: "▶ Preview" / "▼ Hide"

---

## Error Handling

### Preview System Not Available
- Shows error message
- Instructions to start preview system
- Code: `cd preview && npm run dev`

### File Not Accessible
- Shows error message
- Explains file may not be accessible via HTTP

### Loading Timeout
- 5 second timeout
- Shows error message if preview doesn't load

---

## Usage

### For Users

1. **View Preview in Card:**
   - Click any component card
   - Preview expands below card
   - Click again to hide

2. **View Full Preview:**
   - Click "👁️ Preview" button
   - Opens in new tab
   - Full React preview system

3. **View Code:**
   - TS/JS files show code preview
   - First 2000 characters
   - Scrollable code view

### For Developers

1. **Start Preview System:**
   ```bash
   cd preview
   npm run dev
   ```

2. **Component Previews:**
   - React components (TSX/JSX) use iframe
   - Code files (TS/JS) show code
   - Other types show error

3. **Customization:**
   - Preview height: Adjust `max-height` in CSS
   - Code preview length: Change `2000` in `loadCodeComponentPreview`
   - Timeout: Change `5000` in `loadReactComponentPreview`

---

## Known Limitations

1. **Preview System Dependency:**
   - React components require preview system running
   - Shows helpful error if not available

2. **File Access:**
   - Code previews require HTTP access to files
   - May not work with `file://` protocol

3. **Component Rendering:**
   - Not all components can be previewed
   - Complex dependencies may fail
   - Shows error message gracefully

4. **Performance:**
   - Multiple iframes may impact performance
   - Consider limiting visible previews

---

## Performance Optimizations

### Implemented
1. **Lazy Loading:**
   - ✅ Only load preview when expanded
   - ✅ Unload iframe when collapsed
   - ✅ Clear preview content on collapse

2. **Preview Caching:**
   - ✅ Cache successful preview loads in memory
   - ✅ Store componentId -> preview state mapping
   - ✅ Reuse cached previews when re-expanding

3. **Concurrent Preview Limit:**
   - ✅ Max 5 previews open at once
   - ✅ Auto-collapse oldest when limit reached
   - ✅ Prevents memory issues

4. **Code Syntax Highlighting:**
   - ✅ Prism.js integrated
   - ✅ Supports TypeScript, JavaScript, GLSL, CSS
   - ✅ Works in dark/light mode

5. **Preview State Persistence:**
   - ✅ Remember expanded previews
   - ✅ Restore on page reload
   - ✅ localStorage based

### Future Enhancements

1. **Preview Thumbnails:**
   - Generate thumbnails for components
   - Show thumbnail before loading full preview

2. **Preview Settings:**
   - User preference for auto-expand
   - Preview size options
   - Concurrent preview limit setting

---

## Testing

### Test Cases

1. **React Component Preview:**
   - [x] TSX component shows in iframe
   - [x] JSX component shows in iframe
   - [x] Error if preview system not running
   - [x] Timeout handling works

2. **Code Preview:**
   - [x] TS file shows code
   - [x] JS file shows code
   - [x] GLSL file shows with syntax highlighting
   - [x] CSS file shows with syntax highlighting
   - [x] JSON file shows formatted
   - [x] Markdown file renders
   - [x] Truncation works (5000 chars)
   - [x] "Show more" button works
   - [x] Error if file not accessible
   - [x] Retry mechanism works

3. **UI Interaction:**
   - [x] Click card toggles preview
   - [x] Double click opens modal
   - [x] Toggle button works
   - [x] Preview expands/collapses smoothly

4. **Embedded Mode:**
   - [x] React preview hides UI when embedded
   - [x] Component renders correctly
   - [x] Error handling works

---

## Sign-Off

**Status:** ✅ **LIVE PREVIEWS IMPLEMENTED**

**Features:**
- ✅ Live previews in component cards
- ✅ Type-specific handling (TSX/JSX vs TS/JS/GLSL/CSS/JSON/MD)
- ✅ Embedded mode in React preview system
- ✅ Enhanced error handling with retry
- ✅ Smooth UI interactions
- ✅ Performance optimizations (caching, lazy loading, concurrent limits)
- ✅ Syntax highlighting for code previews
- ✅ Preview state persistence
- ✅ Component name matching with variations
- ✅ Special file type support

**Date:** 2026-01-09  
**Updated:** 2026-01-09 (Complete Coverage Implementation)

---

**End of Implementation Notes**
