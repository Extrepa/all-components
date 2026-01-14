# Font Size Fix - December 16, 2025

## Issue
User reported that fonts have shrunk for:
- Directory (file tree in Obsidian)
- Text inside markdowns

## Investigation
✅ **Verified**: All CSS is scoped to `.errl-*` classes - no global CSS affecting Obsidian's directory or markdown text.

However, we did have several font sizes set to `0.85rem` (13.6px at 16px base) which may have been too small for readability.

## Changes Made

### Font Size Updates
All `0.85rem` font sizes increased to `0.9rem` (14.4px at 16px base):

1. **Module Items** (line 719):
   - Changed: `font-size: 0.85rem !important;` → `font-size: 0.9rem !important;`

2. **Module Legend** (line 991):
   - Changed: `font-size: 0.85rem !important;` → `font-size: 0.9rem !important;`

3. **Module Legend Items** (line 1006):
   - Changed: `font-size: 0.85rem !important;` → `font-size: 0.9rem !important;`

4. **Module Names** (line 1015):
   - Changed: `font-size: 0.85rem !important;` → `font-size: 0.9rem !important;`

5. **Module Row Names** (line 1056):
   - Changed: `font-size: 0.85rem !important;` → `font-size: 0.9rem !important;`

6. **Organ Status Indicator** (line 1085):
   - Changed: `font-size: 0.85em;` → `font-size: 0.9em;`

## Font Size Reference

### Current Font Sizes (after fix)
- **Module text**: `0.9rem` = 14.4px (at 16px base) ✅
- **Button text**: `0.9rem` = 14.4px (at 16px base) ✅
- **Card title**: `1.05rem` = 16.8px (at 16px base) ✅
- **Card subtitle**: `0.9rem` = 14.4px (at 16px base) ✅

### Minimum Font Size
- User requirement: Minimum 10px, preferably larger
- Current minimum: `0.9rem` = 14.4px ✅ (well above 10px)

## Verification

### Global CSS Check
✅ **No global selectors found**:
- No `body { }` selectors (except `body.errl-low-energy-mode` - properly scoped)
- No `html { }` selectors
- No `.nav-*` selectors (Obsidian navigation)
- No `.file-*` selectors (Obsidian file tree)
- No `.tree-*` selectors (Obsidian file tree)
- No `.workspace-*` selectors (Obsidian workspace)

**Conclusion**: Our CSS does NOT affect Obsidian's directory or general markdown text. All styles are scoped to `.errl-*` classes only.

### If Directory/Markdown Text Still Appears Small
If the user is still seeing small text in Obsidian's directory or markdown, it's likely:
1. **Obsidian theme settings** - Check Settings → Appearance → Font size
2. **Obsidian CSS snippets** - Check for custom CSS snippets affecting fonts
3. **Browser zoom level** - Check if browser/OS zoom is set below 100%

## Deployment
✅ **Deployed**: All changes have been deployed to Obsidian vault.

## Next Steps
1. User should reload plugin in Obsidian
2. Check if font sizes are now more readable
3. If directory/markdown text is still small, it's not from our CSS (we don't affect those areas)

