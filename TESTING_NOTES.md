# Testing Notes - Browser Testing

**Date:** 2026-01-09  
**Status:** Ready for Browser Testing

---

## Quick Test Checklist

### Basic Functionality
1. Open `preview.html` in browser
2. Verify all 205 components display
3. Check statistics show correct counts
4. Test dark mode toggle
5. Test search functionality
6. Test filtering (project, type)
7. Test sorting

### Preview Functionality
1. Click a TSX component card → Should expand preview
2. Click a TS file card → Should show code preview
3. Click preview toggle button → Should toggle preview
4. Double-click card → Should open modal
5. Test "👁️ Preview" button → Should open in new tab
6. Test favorites (star button)
7. Test export functionality

### Code Previews
1. Click a TS file → Should show code with syntax highlighting
2. Click a JS file → Should show code with syntax highlighting
3. Click a GLSL file → Should show with GLSL syntax
4. Click a CSS file → Should show with CSS syntax
5. Click a JSON file → Should show formatted
6. Long files → Should show "Show Full File" button

### React Previews
1. Start React preview system: `cd preview && npm run dev`
2. Click a TSX component → Should load in iframe
3. Verify component renders
4. Test multiple previews (should limit to 5)
5. Test cache (close and reopen same preview)

### Error Handling
1. Stop React preview system
2. Click TSX component → Should show helpful error
3. Test network error scenarios
4. Test file not found scenarios

### Performance
1. Open 5 previews → Should work smoothly
2. Try to open 6th → Should auto-collapse oldest
3. Close and reopen preview → Should load from cache
4. Test search with many components

### State Persistence
1. Expand some previews
2. Reload page → Should restore expanded previews
3. Change theme → Should persist
4. Change sort → Should persist

---

## Known Issues to Watch For

1. **Prism.js Loading:** May take a moment to load from CDN
2. **Iframe Caching:** Iframe src may need to be reset on re-expand
3. **Component Name Matching:** Some components may have name mismatches
4. **File Access:** Code previews require HTTP server (not file://)

---

## Test Results

### Browser: ___________
### Date: ___________

#### Basic Tests
- [ ] Page loads
- [ ] All components display
- [ ] Statistics correct
- [ ] Dark mode works
- [ ] Search works
- [ ] Filters work
- [ ] Sort works

#### Preview Tests
- [ ] TSX preview works
- [ ] TS code preview works
- [ ] Syntax highlighting works
- [ ] Cache works
- [ ] Concurrent limit works
- [ ] State persistence works

#### Error Tests
- [ ] Error messages helpful
- [ ] Retry works
- [ ] Fallbacks work

#### Performance
- [ ] Load time acceptable
- [ ] Multiple previews smooth
- [ ] No memory leaks

---

**End of Testing Notes**
