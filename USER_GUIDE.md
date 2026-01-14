# User Guide - All Components Preview

**Date:** 2026-01-09  
**Version:** 2.0

---

## Overview

The All Components Preview is a comprehensive component browser that lets you explore, preview, and interact with all 205 components from your projects.

---

## Getting Started

### Opening the Preview

1. Open `preview.html` in your web browser
2. The page will load all components automatically
3. Components are organized by project

### Starting the React Preview System (Optional)

For React component previews to work:

```bash
cd preview
npm install  # First time only
npm run dev
```

The preview system will run on `http://localhost:5174`

---

## Basic Usage

### Browsing Components

- **View by Project:** Components are grouped by their source project
- **Search:** Use the search box to find components by name, path, or project
- **Filter:** Click filter chips to show only specific projects or file types
- **Sort:** Use the sort dropdown to organize components

### Viewing Component Previews

#### Inline Preview (In Card)
1. **Click any component card** to expand the preview
2. Preview appears below the card
3. **Click again** to collapse
4. Or use the **"▶ Preview"** button at bottom-right of card

#### Full Preview (New Tab)
1. **Hover over a component card** to see action buttons
2. Click **"👁️ Preview"** button
3. Opens full preview in new tab

#### Code Preview
- TS/JS files automatically show code preview
- GLSL, CSS, JSON files show with syntax highlighting
- Click **"📄 Show Full File"** to view complete file

---

## Features

### Dark Mode

- Click the **theme toggle** in the header (🌙/☀️)
- Theme preference is saved
- Automatically detects system preference

### Filtering

#### By Project
- Click project name chips to filter
- Multiple projects can be selected
- Active filters are highlighted

#### By Type
- Click type chips (TSX, TS, JSX, JS) to filter
- Multiple types can be selected

#### Clear Filters
- Click **"Clear All"** button to reset all filters

### Sorting

Options:
- **Name (A-Z)** - Alphabetical ascending
- **Name (Z-A)** - Alphabetical descending
- **Project** - Group by project
- **Type** - Group by file type

Sort preference is saved.

### Search

- Type in the search box to filter components
- Searches component name, path, and project name
- Results update as you type (debounced)
- Fast indexed search for performance

### Component Details

**Double-click** any component card to see:
- Full component information
- Project, path, type, category
- Action buttons (Preview, Copy, Open File)

### Favorites

- Click the **star button** (☆) on any component card
- Favorites are saved in browser
- Star changes to ★ when favorited

### Export

Click **"📥 Export"** button in header to export:
- **JSON** - Component data as JSON
- **CSV** - Spreadsheet format
- **Markdown** - Documentation format

Exports respect current filters.

---

## Keyboard Shortcuts

- **/** - Focus search input
- **Ctrl/Cmd + K** - Quick search
- **Esc** - Close modals, clear search

---

## Component Types

### React Components (TSX/JSX)
- Show live preview in iframe
- Requires React preview system running
- Full interactive preview

### Code Files (TS/JS)
- Show code preview with syntax highlighting
- First 5000 characters displayed
- "Show Full File" button for longer files

### Special Files
- **GLSL** - Shader code with syntax highlighting
- **CSS** - Stylesheet with syntax highlighting
- **JSON** - Formatted JSON display
- **Markdown** - Rendered markdown

---

## Preview Features

### Inline Previews
- Expand/collapse with smooth animation
- Up to 5 previews open at once
- Oldest preview auto-collapses when limit reached
- Preview state persists on page reload

### Preview Caching
- Successful previews are cached
- Instant loading when re-expanding
- Cache cleared on page reload

### Error Handling
- Helpful error messages
- Instructions for common issues
- Retry mechanism for network errors

---

## Tips & Tricks

### Performance
- Close previews you're not using
- Use filters to reduce visible components
- Search is faster than scrolling

### Finding Components
- Use search for quick lookup
- Filter by project to narrow down
- Sort by type to group similar files

### Preview System
- Keep React preview system running for best experience
- Some components may not preview (complex dependencies)
- Code previews work without preview system

---

## Troubleshooting

### Preview Not Loading

**Issue:** Component preview shows error

**Solutions:**
1. Make sure React preview system is running: `cd preview && npm run dev`
2. Check browser console for errors
3. Try refreshing the page
4. Some components may require additional setup

### Code Preview Not Showing

**Issue:** Code preview shows error

**Solutions:**
1. File may not be accessible via HTTP
2. Check file path is correct
3. Try opening file directly in browser

### Slow Performance

**Issue:** Page is slow with many previews

**Solutions:**
1. Close unused previews (max 5 recommended)
2. Use filters to reduce visible components
3. Clear browser cache if needed

### Theme Not Working

**Issue:** Dark/light mode not switching

**Solutions:**
1. Check browser supports localStorage
2. Try clearing browser cache
3. Check browser console for errors

---

## Browser Requirements

### Recommended
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

### Features Required
- localStorage support
- Fetch API
- CSS custom properties
- Iframe support

---

## Support

For issues or questions:
1. Check browser console for errors
2. Review error messages in previews
3. Check documentation files
4. Verify React preview system is running

---

## Updates

**Version 2.0 (2026-01-09)**
- Added syntax highlighting
- Performance optimizations
- Enhanced error handling
- Preview state persistence
- Special file type support
- Component name matching improvements

---

**End of User Guide**
