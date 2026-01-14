# ErrlOS-Plugin Test Issues - Known Issues

**Date:** 2027-01-09  
**Status:** Pre-existing Issues (Not from our changes)

## Summary

ErrlOS-Plugin has several test failures that are pre-existing and not related to the changes we made. Our fix for `toHaveProperty` matcher is working correctly.

## Test Results

**Passing:** 188 tests  
**Failing:** 36 tests  
**Test Suites:** 7 passed, 10 failed

## Known Issues

### 1. Error Categorization Tests
**Files:** `tests/unit/utils/ErrorHandler.test.ts`

**Issues:**
- PermissionDenied errors not being categorized correctly (returning "unknown")
- ConfigurationError errors not being categorized correctly
- showErrorNotice tests failing (mock not being called)

**Status:** Pre-existing logic issues in ErrorHandler

### 2. BaseManager Tests
**Files:** `tests/unit/utils/BaseManager.test.ts`

**Issues:**
- File parsing errors: "Cannot read properties of undefined (reading 'read')"
- Base file creation/opening failures
- Missing mocks for Obsidian API methods

**Status:** Pre-existing mock setup issues

### 3. DependencyChecker Tests
**Files:** `tests/unit/utils/DependencyChecker.test.ts`

**Issues:**
- Dependency checking logic not working as expected
- canEnable returning false when should be true
- Conflicts not being detected properly

**Status:** Pre-existing logic issues

### 4. FileUtils Tests
**Files:** `tests/unit/utils/fileUtils.test.ts`

**Issues:**
- Parent directory creation not working in tests
- Mock vault not properly simulating directory creation

**Status:** Pre-existing mock issues

### 5. ErrlKernel Settings Tests
**Files:** `tests/unit/kernel/ErrlKernel.settings.test.ts`

**Issues:**
- Settings not falling back to defaults correctly
- dashboardPath returning null instead of default

**Status:** Pre-existing logic issues

### 6. LayeredControlHelper Tests
**Files:** `tests/unit/utils/LayeredControlHelper.test.ts`

**Issues:**
- Feature controls not matching expected IDs
- Fine-grained controls returning null
- Control length undefined

**Status:** Pre-existing logic issues

### 7. Integration Test Timeouts
**Files:** 
- `tests/integration/workflows/errorHandling.test.ts`
- `tests/integration/workflows/dependencyChecking.test.ts`
- `tests/integration/organs/dashboard.test.ts`
- `tests/integration/organs/capture.test.ts`

**Issues:**
- Tests exceeding 5000ms timeout
- Missing plugin.addCommand mock
- Settings not loading correctly

**Status:** Pre-existing test setup and timeout issues

### 8. TypeScript Warnings
**Issue:** Multiple warnings about `esModuleInterop` in tsconfig.json

**Recommendation:** Add `esModuleInterop: true` to tsconfig.json

**Status:** Pre-existing configuration issue

## What We Fixed

✅ **Jest Matcher Types** - Added `toHaveProperty` to ExpectMatchers interface  
✅ **Module Export** - Exported ORGAN_CREATORS from src/organs/index.ts

## Recommendations

1. **Fix ErrorHandler** - Update error categorization logic
2. **Fix Mocks** - Improve Obsidian API mocks in test setup
3. **Fix Timeouts** - Increase timeout or optimize slow tests
4. **Fix TypeScript Config** - Add esModuleInterop to tsconfig.json
5. **Fix Logic Issues** - Address dependency checking, settings, and control helper issues

## Notes

- These issues existed before our changes
- Our fixes (toHaveProperty, ORGAN_CREATORS export) are working correctly
- Test infrastructure is functional (188 tests passing)
- Failures are in specific functionality areas, not infrastructure
