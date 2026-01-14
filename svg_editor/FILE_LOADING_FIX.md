# File Loading Fix

## Issue
SVG file loading was not working from:
1. "Load SVG File" button in the middle of the canvas (PreviewArea)
2. "Open SVG" button in the File menu (Header)

## Root Cause
The file input element in `Header.tsx` had a `ref` but no `id` attribute. The `PreviewArea.tsx` component was trying to access it via `document.getElementById('fileInput')`, which failed because the element didn't have that id.

## Fixes Applied

### 1. Added ID to File Input (`src/components/Header.tsx`)
- Added `id="fileInput"` to the file input element
- Now both the ref and id are present, allowing access from multiple components

### 2. Reset File Input After Loading (`src/hooks/useFileOperations.ts`)
- Added `event.target.value = ''` after file loading (both success and error cases)
- This allows the same file to be selected again if needed
- Prevents the onChange event from not firing when selecting the same file twice

## Changes Made

**File: `src/components/Header.tsx`**
```tsx
<input 
    id="fileInput"  // ← Added this
    ref={fileInputRef}
    type="file" 
    accept=".svg" 
    style={{ display: 'none' }}
    onChange={loadSVGFile}
/>
```

**File: `src/hooks/useFileOperations.ts`**
```tsx
const loadSVGFile = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
        const text = await file.text();
        if (!text || text.trim().length === 0) {
            showError('File is empty');
            event.target.value = '';  // ← Added this
            return;
        }
        parseSVG(text);
        event.target.value = '';  // ← Added this
    } catch (error) {
        showError(`Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        event.target.value = '';  // ← Added this
    }
}, [parseSVG, showError]);
```

## Testing
- ✅ File input now accessible from PreviewArea button
- ✅ File input now accessible from Header File menu
- ✅ File input resets after loading, allowing same file to be selected again
- ✅ No linter errors

## Status
**FIXED** - File loading should now work from both locations.

