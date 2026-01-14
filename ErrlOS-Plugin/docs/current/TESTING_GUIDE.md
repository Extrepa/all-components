# Errl OS Plugin - Testing Guide

## Overview

This guide explains how to run tests for the Errl OS plugin, including both automated tests and manual testing procedures.

## Automated Testing

### Prerequisites

1. **Install Dependencies:**
   ```bash
   cd /Users/extrepa/Projects/ErrlOS-Plugin
   npm install
   ```
   
   **Note:** If npm install fails due to log file issues, you may need to:
   - Fix npm permissions: `sudo chown -R $(whoami) ~/.npm`
   - Or install Jest manually: `npm install --save-dev jest @types/jest ts-jest`

2. **Verify Installation:**
   - Check that `node_modules/jest` exists
   - Verify `jest.config.js` is present

### Running Tests

#### Run All Tests
```bash
npm test
```

#### Run Tests in Watch Mode
```bash
npm run test:watch
```

#### Run Tests with Coverage
```bash
npm run test:coverage
```

This will:
- Run all tests
- Generate coverage report in `coverage/` directory
- Show coverage summary in terminal
- Create HTML coverage report at `coverage/index.html`

### Test Structure

```
tests/
├── unit/                    # Unit tests for individual components
│   └── utils/              # Utility function tests
│       ├── DependencyChecker.test.ts
│       ├── ErrorHandler.test.ts
│       ├── fileUtils.test.ts
│       ├── LayeredControlHelper.test.ts
│       ├── pathDetector.test.ts
│       ├── pathValidator.test.ts
│       └── WalkthroughHelper.test.ts
├── integration/            # Integration tests
│   ├── organs/             # Organ integration tests
│   │   ├── capture.test.ts
│   │   └── dashboard.test.ts
│   └── workflows/         # Workflow integration tests
│       ├── dependencyChecking.test.ts
│       ├── errorHandling.test.ts
│       └── organLifecycle.test.ts
├── setup.ts                # Test setup and utilities
└── jest.d.ts               # Jest type definitions
```

### Test Files (12 total)

**Unit Tests (7 files):**
- `DependencyChecker.test.ts` - Dependency validation tests
- `ErrorHandler.test.ts` - Error handling and categorization tests
- `fileUtils.test.ts` - File operation tests
- `LayeredControlHelper.test.ts` - Control organization tests
- `pathDetector.test.ts` - Path detection tests
- `pathValidator.test.ts` - Path validation and security tests
- `WalkthroughHelper.test.ts` - Walkthrough utility tests

**Integration Tests (5 files):**
- `capture.test.ts` - Capture organ integration tests
- `dashboard.test.ts` - Dashboard organ integration tests
- `dependencyChecking.test.ts` - Dependency checking workflow tests
- `errorHandling.test.ts` - Error handling workflow tests
- `organLifecycle.test.ts` - Organ lifecycle management tests

### Coverage Goals

- **Target:** 80%+ coverage on critical paths
- **Focus Areas:**
  - Utility functions (PathValidator, FileUtils, ErrorHandler)
  - Security functions (path traversal, sanitization)
  - Core kernel functionality
  - Organ registration and lifecycle

### Writing New Tests

#### Unit Test Template
```typescript
import { YourClass } from '../../src/path/to/YourClass';

describe('YourClass', () => {
    describe('methodName', () => {
        it('should do something', () => {
            // Arrange
            const instance = new YourClass();
            
            // Act
            const result = instance.methodName();
            
            // Assert
            expect(result).toBe(expected);
        });
    });
});
```

#### Integration Test Template
```typescript
import { ErrlKernel } from '../../src/kernel/ErrlKernel';
import { YourOrgan } from '../../src/organs/yourOrgan/YourOrgan';

describe('YourOrgan Integration', () => {
    it('should register with kernel', () => {
        // Test implementation
    });
});
```

## Manual Testing

### Quick Test Checklist

See [MANUAL_TESTING_CHECKLIST.md](MANUAL_TESTING_CHECKLIST.md) for comprehensive manual testing procedures.

### Essential Manual Tests

1. **First-Run Wizard:**
   - [ ] Wizard appears on first install
   - [ ] All 5 steps work correctly
   - [ ] Buttons are visible and functional
   - [ ] Settings are saved correctly

2. **Core Features:**
   - [ ] Dashboard opens and displays correctly
   - [ ] Capture hotkey works (`Ctrl/Cmd + Shift + C`)
   - [ ] Settings tab accessible
   - [ ] All organs can be enabled/disabled

3. **Path Configuration:**
   - [ ] Paths can be configured in settings
   - [ ] Invalid paths show warnings
   - [ ] Path validation works correctly

### Manual Testing Workflows

See [TEST_WORKFLOWS_2025-12-15.md](TEST_WORKFLOWS_2025-12-15.md) for detailed test workflows covering:
- New user onboarding
- Existing user migration
- Path configuration
- Feature testing
- Edge cases
- Integration testing

## Continuous Testing

### Before Committing

1. Run linter: Check for TypeScript errors
2. Run tests: `npm test`
3. Check coverage: `npm run test:coverage`
4. Manual smoke test: Quick verification in Obsidian

### Before Release

1. Run full test suite
2. Execute manual testing checklist
3. Test first-run wizard flow
4. Verify all organs work
5. Check error handling
6. Test settings persistence

## Troubleshooting Tests

### Tests Not Running

**Issue:** `jest: command not found`
**Solution:** Run `npm install` to install Jest

**Issue:** TypeScript errors in tests
**Solution:** Check `tsconfig.json` includes test files

### Tests Failing

**Issue:** Obsidian API mocks not working
**Solution:** Check `tests/setup.ts` and `tests/jest.d.ts`

**Issue:** Import errors
**Solution:** Verify module paths in `jest.config.js`

### Coverage Not Generating

**Issue:** Coverage report empty
**Solution:** Check `collectCoverageFrom` in `jest.config.js`

## Test Environment

### Mock Setup

Tests use mocks for Obsidian API:
- `MockVault` - Mock vault implementation
- `MockApp` - Mock Obsidian app
- `TestUtils` - Test utility functions

See [tests/setup.ts](tests/setup.ts) for mock implementations.

### Configuration

Test configuration in `jest.config.js`:
- TypeScript support via `ts-jest`
- Test file pattern: `**/*.test.ts`
- Coverage collection from `src/**/*.ts`
- Setup file: `tests/setup.ts`

## Best Practices

1. **Isolation:** Tests should be independent and not rely on execution order
2. **Mocks:** Use mocks for Obsidian API and external dependencies
3. **Coverage:** Aim for 80%+ coverage on critical paths
4. **Naming:** Use descriptive test names that explain what is being tested
5. **Documentation:** Document test assumptions and setup requirements

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [TypeScript Testing](https://jestjs.io/docs/getting-started#using-typescript)
- [MANUAL_TESTING_CHECKLIST.md](MANUAL_TESTING_CHECKLIST.md) - Manual testing procedures
- [TEST_WORKFLOWS_2025-12-15.md](TEST_WORKFLOWS_2025-12-15.md) - Detailed test workflows

---

**Last Updated:** December 22, 2025  
**Status:** Test framework configured, ready for test execution
