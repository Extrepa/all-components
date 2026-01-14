# Developer Guide - All Components Preview

**Date:** 2026-01-09  
**Version:** 2.0

---

## Architecture Overview

The preview system consists of two main parts:

1. **Static HTML Preview** (`preview.html`) - Main component browser
2. **React Preview System** (`preview/`) - Component rendering engine

### Data Flow

```
components-data.json
    ↓
preview.html (loads data)
    ↓
Component Cards (render)
    ↓
Preview Toggle (user action)
    ↓
loadComponentPreview() (type detection)
    ↓
┌─────────────────┬─────────────────┐
│                 │                 │
TSX/JSX          TS/JS             Special
│                 │                 │
iframe →         fetch →           fetch →
React Preview    Code Preview      Code Preview
```

---

## File Structure

```
all-components/
├── preview.html              # Main preview page
├── components-data.json       # Component catalog
├── generate-catalog.js       # Auto-generation script
├── preview/
│   ├── src/
│   │   ├── App.tsx          # React app
│   │   ├── components/
│   │   │   ├── ComponentPreview.tsx
│   │   │   └── ComponentRenderer.tsx
│   │   └── data/
│   │       └── componentCatalog.ts
│   └── sync-catalog.js      # Catalog sync script
```

---

## Component Type Handling

### Type Detection

Components are handled based on:
1. **File extension** (from `component.path`)
2. **Component type** (from `component.type`)

### Handler Functions

#### `loadComponentPreview(container, component, projectName)`
Main dispatcher that routes to appropriate handler based on type.

**Location:** `preview.html` line ~1670

#### `loadReactComponentPreview(container, componentId, component, projectName)`
Handles TSX/JSX components via iframe.

**Features:**
- Checks preview system availability
- Creates iframe with embed mode
- Retry mechanism (2 attempts)
- Caching support
- Enhanced error handling

**Location:** `preview.html` line ~1688

#### `loadCodeComponentPreview(container, component, projectName, language)`
Handles TS/JS and special file types.

**Features:**
- Fetches file via HTTP
- Applies syntax highlighting
- Truncates to 5000 chars
- Shows "Show more" button
- Formats JSON
- Caching support

**Location:** `preview.html` line ~1723

#### `loadMarkdownPreview(container, component, projectName)`
Handles markdown files with basic rendering.

**Location:** `preview.html` line ~1800

---

## Component Name Matching

### Issue
Component names in catalog may not match actual exports:
- Catalog: `button` → Export: `Button`
- Catalog: `Button` → Export: `default`
- Case sensitivity issues

### Solution
Multiple matching strategies in `ComponentRenderer.tsx`:

1. **Exact match** - Try exact name
2. **Case-insensitive** - Try lowercase comparison
3. **Name variations** - Try PascalCase, camelCase, kebab-case
4. **Export search** - Search all exports for React component
5. **Default export** - Try `mod.default`

**Location:** `preview/src/components/ComponentRenderer.tsx` line ~167

---

## Performance Optimizations

### Preview Caching

**Implementation:**
```javascript
const previewCache = new Map(); // componentId -> HTML string
```

**Usage:**
- Cache successful preview loads
- Store as HTML string
- Reuse on re-expand
- Cleared on page reload

**Location:** `preview.html` line ~1000

### Lazy Loading

**Implementation:**
- Preview only loads when container expanded
- Iframe unloaded when collapsed
- Content cleared on collapse (optional)

**Location:** `preview.html` line ~1640 (`toggleComponentPreview`)

### Concurrent Preview Limit

**Implementation:**
```javascript
const MAX_CONCURRENT_PREVIEWS = 5;
```

**Behavior:**
- Track expanded previews in Set
- Auto-collapse oldest when limit reached
- Prevents memory issues

**Location:** `preview.html` line ~1005

---

## Error Handling

### Error Types

1. **Preview System Not Available**
   - Check: `fetch('../preview/index.html', { method: 'HEAD' })`
   - Error: Shows instructions to start preview system

2. **Network Errors**
   - Retry: 2 attempts with 1 second delay
   - Error: Shows network error message

3. **File Not Found**
   - Check: Response status 404
   - Retry: 2 attempts
   - Error: Shows file path and error

4. **Component Import Errors**
   - Check: Import error message
   - Error: Enhanced error with suggestions

5. **Timeout**
   - Timeout: 5 seconds
   - Retry: 2 attempts
   - Error: Shows timeout message

### Error Display

**Function:** `showEnhancedError(container, component, projectName, message, error)`

**Features:**
- Component-specific help
- Error details for debugging
- Console logging
- User-friendly messages

**Location:** `preview.html` line ~1870

---

## Adding New Component Types

### Step 1: Update Type Detection

In `loadComponentPreview()`:

```javascript
const fileExt = getFileExtension(component.path);

if (fileExt === 'newtype') {
  await loadNewTypePreview(container, component, projectName);
}
```

### Step 2: Create Handler Function

```javascript
async function loadNewTypePreview(container, component, projectName) {
  // Your implementation
  // - Fetch file
  // - Process content
  // - Display in container
  // - Apply syntax highlighting if needed
  // - Cache result
}
```

### Step 3: Add Syntax Highlighting (if needed)

Update Prism.js autoloader or add language manually.

---

## Extending Preview System

### Adding Component Renderers

In `ComponentRenderer.tsx`:

1. **Add to PROJECT_ALIASES** (if new project)
2. **Add component-specific renderer** (if needed)
3. **Update component catalog** in `componentCatalog.ts`

### Custom Renderers

```typescript
// In ComponentRenderer.tsx
if (projectName === 'my-project' && componentName === 'MyComponent') {
  return <MyCustomRenderer />;
}
```

---

## Catalog Management

### Main Catalog
- **File:** `components-data.json`
- **Format:** JSON
- **Generated by:** `generate-catalog.js`

### React Catalog
- **File:** `preview/src/data/componentCatalog.ts`
- **Format:** TypeScript
- **Synced by:** `preview/sync-catalog.js`

### Syncing Catalogs

```bash
cd preview
node sync-catalog.js
```

This generates TypeScript catalog from JSON catalog.

---

## Debugging

### Common Issues

#### Component Not Previewing

1. **Check component name:**
   - Verify name in catalog matches export
   - Check case sensitivity
   - Try name variations

2. **Check preview system:**
   - Is it running? `cd preview && npm run dev`
   - Check browser console for errors
   - Verify component in React catalog

3. **Check imports:**
   - Verify import path in ComponentRenderer
   - Check PROJECT_ALIASES mapping
   - Verify file exists

#### Preview Not Loading

1. **Check network:**
   - Open browser DevTools → Network tab
   - Look for failed requests
   - Check CORS issues

2. **Check iframe:**
   - Verify iframe src URL
   - Check iframe security policies
   - Verify embed mode works

3. **Check cache:**
   - Clear preview cache
   - Reload page
   - Check localStorage

### Debug Tools

#### Console Logging
- Errors logged to console
- Component loading logged
- Cache hits/misses logged

#### Browser DevTools
- Network tab for requests
- Console for errors
- Application tab for localStorage

---

## Code Locations Reference

### Preview.html

- **Preview state:** Line ~1000
- **Toggle preview:** Line ~1640
- **Load preview:** Line ~1670
- **React preview:** Line ~1688
- **Code preview:** Line ~1723
- **Error handling:** Line ~1870
- **State persistence:** Line ~1900

### ComponentRenderer.tsx

- **Component loading:** Line ~156
- **Name matching:** Line ~167
- **Export resolution:** Line ~189
- **Error handling:** Line ~229

### App.tsx

- **Embedded mode:** Line ~21
- **URL params:** Line ~13

### ComponentPreview.tsx

- **Embedded rendering:** Line ~24
- **Error display:** Line ~33

---

## Best Practices

### Performance
1. **Limit concurrent previews** - Max 5 recommended
2. **Use caching** - Cache successful previews
3. **Lazy load** - Only load when needed
4. **Clean up** - Unload iframes on collapse

### Error Handling
1. **Retry mechanism** - 2 attempts for network errors
2. **Helpful messages** - User-friendly error text
3. **Debug info** - Console logging for developers
4. **Graceful degradation** - Fallback options

### Code Quality
1. **Type checking** - Verify component types
2. **Path validation** - Check file paths
3. **Error boundaries** - Catch render errors
4. **Consistent naming** - Follow conventions

---

## Testing

### Unit Tests
- Component name matching
- Type detection
- Error handling
- Cache management

### Integration Tests
- Preview loading
- Iframe communication
- State persistence
- Catalog sync

### Manual Tests
- All 205 components
- Different browsers
- Error scenarios
- Performance

See `TESTING_CHECKLIST.md` for detailed test plan.

---

## Future Enhancements

### Planned
1. Preview thumbnails
2. User settings UI
3. Advanced filtering
4. Component dependencies graph

### Ideas
1. Component usage statistics
2. Component comparison view
3. Component search history
4. Component tags/categories

---

## Contributing

### Adding Features
1. Update relevant files
2. Add tests
3. Update documentation
4. Test in multiple browsers

### Reporting Issues
1. Check existing issues
2. Provide error details
3. Include browser/version
4. Steps to reproduce

---

## Resources

### Documentation
- `LIVE_PREVIEW_IMPLEMENTATION.md` - Implementation details
- `USER_GUIDE.md` - User documentation
- `TESTING_CHECKLIST.md` - Testing guide

### Tools
- `generate-catalog.js` - Generate component catalog
- `sync-catalog.js` - Sync React catalog
- Browser DevTools - Debugging

---

**End of Developer Guide**
