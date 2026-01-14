# Clear Browser Cache Instructions

If you're still seeing errors about `main.tsx` or `file:///src/main.tsx`, the browser may have cached the old version. Clear the cache:

## Chrome/Edge
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or: Settings → Privacy → Clear browsing data → Cached images and files

## Firefox
1. Press `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete` on Mac)
2. Select "Cache"
3. Click "Clear Now"
4. Refresh the page

## Safari
1. Safari → Preferences → Advanced
2. Check "Show Develop menu"
3. Develop → Empty Caches
4. Refresh the page

## Quick Test
After clearing cache, check the Network tab in DevTools:
- Should see requests to `preview/dist/index.html` (not `preview/index.html`)
- Should see requests to `preview/dist/assets/...` (not `/src/main.tsx`)

---

**The code now always uses `preview/dist/index.html` (built version) or the dev server. Never the source file.**
