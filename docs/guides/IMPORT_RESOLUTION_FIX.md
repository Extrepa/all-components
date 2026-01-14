# Import Resolution Fix for figma-clone-engine

**Date:** 2027-01-09  
**Issue:** `Failed to resolve import "@/shared/hooks" from "src/App.tsx"`

## Fix Applied

Updated `figma-clone-engine/vitest.config.ts` to use explicit aliases pointing directly to index.ts files:

**Changes:**
1. Added explicit alias for `@/shared/hooks` → `../shared/hooks/index.ts`
2. Added explicit alias for `@/shared/utils/export` → `../shared/utils/export/index.ts`
3. Kept regex pattern as fallback for other `@/shared/*` imports
4. Ensured alias order: most specific first, least specific last

**Rationale:**
Vitest needs explicit paths to index.ts files for proper module resolution. The regex pattern resolves to directories, but Vitest may not automatically find index.ts files in those directories during test execution.

## Test

Run the test again to verify the fix:

```bash
cd /Users/extrepa/Projects/figma-clone-engine
npm test
```

Expected: Tests should run without import resolution errors.
