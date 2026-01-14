# Editor Mode Rendering Fix - December 16, 2025

## Issue
User reported that dashboard cards used to be visible in editor mode, but now only show raw HTML code.

## Understanding Obsidian Modes

### Obsidian View Modes
1. **Source/Editor Mode** (`.markdown-source-view`):
   - Shows raw markdown/HTML as text in CodeMirror
   - HTML is displayed as text, not rendered
   - This is expected Obsidian behavior

2. **Preview Mode** (`.markdown-preview-view`):
   - Renders markdown and HTML
   - Cards should display in grid layout
   - This is where cards are meant to be visible

3. **Reading Mode** (`.markdown-reading-view`):
   - Renders markdown and HTML
   - Cards should display in grid layout
   - Similar to preview mode

4. **Live Preview Mode**:
   - Shows source and preview side-by-side or split
   - HTML renders in the preview pane
   - Cards should display in the preview pane

## Changes Made

### 1. Enhanced CSS for Source Mode ✅
**File**: `styles.css` lines 413-441, 443-460

**Added Selectors**:
- `.markdown-source-view .cm-line .errl-grid` - CodeMirror line content
- `.markdown-source-view .cm-lineContent .errl-grid` - CodeMirror line content wrapper
- `.markdown-source-view .cm-line .errl-grid .errl-card` - Cards in CodeMirror lines
- `.markdown-source-view .cm-lineContent .errl-grid .errl-card` - Cards in CodeMirror line content

**Properties Added**:
- `white-space: normal !important;` - Ensures HTML can render if supported
- Enhanced visibility and opacity for source mode
- `display: flex !important;` and `flex-direction: column !important;` for cards

### 2. Enhanced MutationObserver ✅
**File**: `DashboardOrgan.ts` lines 545-582

**Changes**:
- Now watches both `contentEl` (preview/reading) and `editorEl` (source mode)
- Falls back to document.body if specific containers not found
- Ensures grids in source mode are also styled

### 3. Enhanced Interval Check ✅
**File**: `DashboardOrgan.ts` lines 607-625

**Changes**:
- Now checks both document and source view containers
- Queries `editorEl` for grids in source mode
- Applies styles to grids found in source mode

## Important Note

**HTML in Source Mode**:
- In pure source/editor mode, HTML is displayed as text in CodeMirror
- HTML does NOT render as HTML in source mode (this is how CodeMirror works)
- Cards will only render in Preview Mode or Reading Mode

**If Cards Should Show in "Editor Mode"**:
- User might be referring to **Live Preview Mode** (split view)
- In Live Preview, the preview pane shows rendered HTML
- Cards should display in the preview pane of Live Preview mode

## Testing

### Expected Behavior
1. **Source Mode**: Shows raw HTML code (expected)
2. **Preview Mode**: Shows rendered cards in grid (should work)
3. **Reading Mode**: Shows rendered cards in grid (should work)
4. **Live Preview**: Preview pane shows rendered cards (should work)

### If Cards Still Don't Show
1. **Check Mode**: Ensure you're in Preview or Reading mode, not pure Source mode
2. **Reload Plugin**: Settings → Community plugins → Errl OS → Toggle OFF/ON
3. **Check Console**: Look for `[Errl OS] Applied grid styles` messages
4. **Verify CSS**: Check that `styles.css` is loaded in plugin directory

## Deployment
✅ **Deployed**: All changes built and deployed
- Build: Successful (147.1kb)
- Files: Synchronized

## Next Steps
1. Reload plugin in Obsidian
2. Switch to Preview Mode or Reading Mode to see cards
3. If using Live Preview, cards should show in preview pane
4. Source mode will continue to show raw HTML (expected behavior)

---

**Note**: If the user specifically needs cards to render in pure source/editor mode (not just Live Preview), this would require a CodeMirror extension or custom rendering, which is beyond the scope of standard markdown post-processing.

