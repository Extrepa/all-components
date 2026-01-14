# Module Display Deep Diagnosis - December 16, 2025

## Current Status
- **DOM Count**: 18 modules present ✅
- **Visible Count**: 6 modules ❌
- **Issue**: CSS constraints limiting visibility

## Root Cause Analysis

### Grid Layout Structure
The module grid uses:
```css
grid-template-columns: repeat(auto-fit, minmax(140px, 1fr))
```

This creates **COLUMNS**, not rows. With 18 items:
- If card width allows 3 columns: 3 cols × 6 rows = 18 items
- If card width allows 2 columns: 2 cols × 9 rows = 18 items  
- If card width allows 4 columns: 4 cols × 5 rows = 18 items (rounded)

**If only 6 items are visible**, this suggests:
- 3 columns × 2 rows = 6 items visible
- OR 2 columns × 3 rows = 6 items visible

This means the **card height is constrained to show only 2-3 rows**.

### Constraint Chain
1. **Parent Grid Cell** (`.errl-grid` cell) - may have height constraint
2. **Card** (`.errl-card`) - may have `max-height: 200px` from Obsidian/theme
3. **Module Grid** (`.errl-module-grid`) - may be collapsing
4. **Grid Items** (`.errl-module-item`) - may be hidden

## Fixes Applied

### 1. Card Height Constraints (Lines 271-296, 676-685)
- ✅ Removed `max-height: 200px` → `max-height: none`
- ✅ Set `height: auto`
- ✅ Changed `contain: layout style` → `contain: layout`
- ✅ Set `overflow: visible`

### 2. Grid Cell Constraints (Lines 220-228, 235-237)
- ✅ Cards with module grids: `align-self: start` (not `stretch`)
- ✅ Grid rows: `grid-auto-rows: max-content`
- ✅ Allow cards to expand beyond grid cell

### 3. Module Grid Expansion (Lines 648-646, 700-741)
- ✅ `min-height: fit-content`
- ✅ `grid-auto-rows: min-content`
- ✅ `flex-shrink: 0` to prevent collapse
- ✅ `contain: none` to prevent clipping

### 4. Most Aggressive Override (Lines 687-702)
- ✅ Cards with module grids: `flex: 0 1 auto` (not `1 1 auto`)
- ✅ `align-self: start` to break out of grid cell
- ✅ `contain: none` to remove all containment

## Diagnostic Script

Run this in browser console to identify the exact constraint:

```javascript
// Deep diagnostic for module display issue
const moduleGrid = document.querySelector('.errl-module-grid');
if (!moduleGrid) {
  console.log('❌ Module grid not found');
} else {
  const card = moduleGrid.closest('.errl-card');
  const gridCell = card?.parentElement; // The .errl-grid cell
  const parentGrid = gridCell?.closest('.errl-grid');
  
  console.log('=== DEEP DIAGNOSIS ===');
  
  // Grid info
  const gridStyle = window.getComputedStyle(moduleGrid);
  console.log('\n📊 MODULE GRID:');
  console.log('  Height:', moduleGrid.offsetHeight, 'px');
  console.log('  Max-height:', gridStyle.maxHeight);
  console.log('  Min-height:', gridStyle.minHeight);
  console.log('  Overflow:', gridStyle.overflow);
  console.log('  Display:', gridStyle.display);
  console.log('  Grid-template-columns:', gridStyle.gridTemplateColumns);
  console.log('  Grid-auto-rows:', gridStyle.gridAutoRows);
  console.log('  Contain:', gridStyle.contain);
  console.log('  Items count:', moduleGrid.children.length);
  console.log('  Visible items:', Array.from(moduleGrid.children).filter(el => {
    const rect = el.getBoundingClientRect();
    return rect.height > 0 && rect.width > 0;
  }).length);
  
  // Card info
  if (card) {
    const cardStyle = window.getComputedStyle(card);
    console.log('\n🃏 CARD:');
    console.log('  Height:', card.offsetHeight, 'px');
    console.log('  Max-height:', cardStyle.maxHeight);
    console.log('  Min-height:', cardStyle.minHeight);
    console.log('  Overflow:', cardStyle.overflow);
    console.log('  Contain:', cardStyle.contain);
    console.log('  Align-self:', cardStyle.alignSelf);
    console.log('  Flex:', cardStyle.flex);
    console.log('  Display:', cardStyle.display);
    console.log('  Flex-direction:', cardStyle.flexDirection);
  }
  
  // Grid cell info
  if (gridCell && gridCell.classList.contains('errl-grid')) {
    const cellStyle = window.getComputedStyle(gridCell);
    console.log('\n📦 GRID CELL:');
    console.log('  Height:', gridCell.offsetHeight, 'px');
    console.log('  Max-height:', cellStyle.maxHeight);
    console.log('  Grid-auto-rows:', cellStyle.gridAutoRows);
    console.log('  Align-items:', cellStyle.alignItems);
  }
  
  // Parent grid info
  if (parentGrid) {
    const parentStyle = window.getComputedStyle(parentGrid);
    console.log('\n🔲 PARENT GRID:');
    console.log('  Grid-auto-rows:', parentStyle.gridAutoRows);
    console.log('  Align-items:', parentStyle.alignItems);
    console.log('  Grid-template-columns:', parentStyle.gridTemplateColumns);
  }
  
  // Check for hidden items
  console.log('\n👁️ VISIBILITY CHECK:');
  Array.from(moduleGrid.children).forEach((item, index) => {
    const rect = item.getBoundingClientRect();
    const style = window.getComputedStyle(item);
    const isVisible = rect.height > 0 && rect.width > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    if (!isVisible) {
      console.log(`  Item ${index + 1} (${item.textContent.trim()}): HIDDEN`);
      console.log(`    Height: ${rect.height}px, Display: ${style.display}, Visibility: ${style.visibility}`);
    }
  });
}
```

## Next Steps

1. **Run the diagnostic script** in browser console
2. **Check which constraint is active**:
   - If card max-height is still `200px` → Obsidian/theme override
   - If grid height is `0px` → Grid collapse issue
   - If grid cell height is constrained → Parent grid issue
   - If items are hidden → Visibility/display issue

3. **Based on results**:
   - If card still has `max-height: 200px`: Add more specific override
   - If grid height is `0px`: Fix flexbox collapse
   - If grid cell is constrained: Make card break out of grid
   - If items are hidden: Fix visibility rules

## Files Modified

- `ErrlOS-Plugin/styles.css` - All fixes applied
- `ErrlVault/.obsidian/plugins/errl-os/styles.css` - Deployed ✅

## Critical CSS Rules Applied

1. **Card expansion** (most specific):
   ```css
   .markdown-reading-view .errl-card:has(.errl-module-grid) {
     max-height: none !important;
     height: auto !important;
     align-self: start !important;
     flex: 0 1 auto !important;
     contain: none !important;
   }
   ```

2. **Grid expansion**:
   ```css
   .markdown-reading-view .errl-card .errl-module-grid {
     min-height: fit-content !important;
     grid-auto-rows: min-content !important;
     flex-shrink: 0 !important;
   }
   ```

3. **Parent grid**:
   ```css
   .markdown-reading-view .errl-grid {
     grid-auto-rows: max-content !important;
   }
   ```

