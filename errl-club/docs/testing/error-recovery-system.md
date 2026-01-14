# Error Recovery System for Playwright Tests

## Overview
Automated error detection and recovery system for Playwright test execution. When console errors occur, the system attempts to fix them and retry the test.

## Components

### 1. Error Collection (`tests/helpers/errorRecovery.js`)
- `setupErrorCollection(page)` - Sets up console error collection for a page
- `isLoadingScreenError(error)` - Detects LoadingScreen-related errors
- `attemptFixLoadingScreenError(errorText)` - Attempts to fix LoadingScreen errors
- `runWithErrorRecovery(testFn, options)` - Wraps test execution with retry logic

### 2. Test Runner Script (`tests/helpers/runTestsWithRecovery.js`)
- Automatically searches codebase for error patterns
- Fixes common issues (e.g., LoadingScreen → MainMenu)
- Retries tests after fixes
- Usage: `node tests/helpers/runTestsWithRecovery.js [test-file] [--headed]`

### 3. Test Execution Process

```
1. Run Test
   ↓
2. Collect Console Errors
   ↓
3. Error Detected?
   ├─ Yes → Attempt Fix
   │         ↓
   │      Fix Applied?
   │      ├─ Yes → Retry Test
   │      └─ No → Report Error
   └─ No → Test Passes
```

## Supported Auto-Fixes

### LoadingScreen → MainMenu Migration
- **Pattern**: `/LoadingScreen|loadingScreen|loading-screen/g`
- **Fix**: Replaces all references with MainMenu equivalents
- **Files Scanned**: All `.js`, `.jsx`, `.ts`, `.tsx` files in `src/` and `tests/`

## Manual Fix Process

If auto-fix fails, follow these steps:

1. **Identify Error**: Check console error message
2. **Locate Source**: Find file causing error (check stack trace)
3. **Apply Fix**: 
   - Replace `LoadingScreen` → `MainMenu`
   - Replace `loadingScreen` → `mainMenu`
   - Replace `loading-screen` → `main-menu`
4. **Retry Test**: Re-run the test

## Test Execution with Recovery

### Basic Usage
```bash
# Run single test with recovery
node tests/helpers/runTestsWithRecovery.js tests/e2e/game-loads.spec.js

# Run with headed browser
node tests/helpers/runTestsWithRecovery.js tests/e2e/game-loads.spec.js --headed
```

### In Test Files
```javascript
import { setupErrorCollection, runWithErrorRecovery } from '../helpers/errorRecovery.js';

test('my test', async ({ page }) => {
  const errorCollection = setupErrorCollection(page);
  
  await runWithErrorRecovery(async () => {
    await page.goto('/');
    // ... test code ...
  }, {
    maxRetries: 3,
    onError: async (error, attempt) => {
      // Custom error handling
      return { shouldRetry: true };
    }
  });
  
  errorCollection.cleanup();
});
```

## Current Status

✅ **Error Recovery System**: Implemented
✅ **Auto-Fix for LoadingScreen**: Working
✅ **Test Retry Logic**: Working
⏳ **Additional Error Patterns**: Can be added as needed

## Future Enhancements

1. Add more error patterns and fixes
2. Integrate with CI/CD pipeline
3. Generate error reports
4. Track fix success rates

