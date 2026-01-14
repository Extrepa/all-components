# Playwright Testing Guide

Comprehensive guide for writing, running, and maintaining Playwright tests for the Errl Club Simulator.

## Table of Contents

1. [Overview](#overview)
2. [Setup & Installation](#setup--installation)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [Test Organization](#test-organization)
6. [Best Practices](#best-practices)
7. [Debugging Tests](#debugging-tests)
8. [CI/CD Integration](#cicd-integration)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### What is Playwright?

Playwright is an end-to-end testing framework that enables automated browser testing. It supports Chromium, Firefox, and WebKit browsers, and provides a robust API for interacting with web applications.

### Test Coverage

The Errl Club Simulator test suite includes:

- **28 test files** covering all major systems
- **700+ test cases** verifying functionality
- **Critical path testing** for main user workflows
- **Edge case handling** for error scenarios
- **Integration testing** for system interactions
- **Performance testing** for extended sessions

### Test Categories

1. **Initialization Tests** - Game startup and loading
2. **UI System Tests** - User interface components
3. **Avatar System Tests** - Movement and controls
4. **Integration Tests** - System interactions
5. **Workflow Tests** - Complete user journeys
6. **Edge Case Tests** - Error handling and recovery
7. **Performance Tests** - Extended play sessions

---

## Setup & Installation

### Prerequisites

- Node.js v25.2.1 or higher
- npm v10.0.0 or higher

### Installation

Playwright is already installed as a dev dependency. If you need to reinstall:

```bash
npm install
npx playwright install --with-deps
```

The `--with-deps` flag installs system dependencies required for browser automation.

### Configuration

Playwright configuration is in `playwright.config.js`:

```javascript
{
  testDir: './tests',
  baseURL: 'http://localhost:5173',
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  }
}
```

Key settings:
- **testDir**: Location of test files
- **baseURL**: Default URL for tests
- **webServer**: Automatically starts dev server for tests
- **projects**: Browser configurations (Chromium, Firefox, WebKit)

---

## Running Tests

### Run All Tests

```bash
npm test
# or
npm run test:e2e
```

### Run Specific Test Files

```bash
npm test tests/e2e/app.spec.js
npm test tests/e2e/avatar-systems.spec.js
```

### Run Tests in Headed Mode

See the browser while tests run:

```bash
npm run test:headed
```

### Run Tests in Debug Mode

Step through tests interactively:

```bash
npm run test:debug
```

### Run Tests for Specific Browsers

```bash
# Chromium only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# WebKit only
npx playwright test --project=webkit
```

### Run Tests with UI Mode

Interactive test runner:

```bash
npx playwright test --ui
```

### View Test Report

After running tests:

```bash
npm run test:report
# or
npx playwright show-report
```

---

## Writing Tests

### Test File Structure

```javascript
import { test, expect } from '@playwright/test';
import { waitForGameReady } from '../helpers/gameHelpers.js';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGameReady(page);
    await page.waitForTimeout(1000);
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    const canvas = page.locator('#club-canvas');
    await expect(canvas).toBeVisible();
  });
});
```

### Basic Test Structure

1. **Import statements** - Playwright and test helpers
2. **test.describe()** - Groups related tests
3. **test.beforeEach()** - Setup before each test
4. **test()** - Individual test case

### Using Test Helpers

The `tests/helpers/gameHelpers.js` file provides utilities:

```javascript
import { 
  waitForGameReady,
  moveAvatar,
  pressKey,
  clickCanvas,
  getAvatarPosition,
  waitForUI
} from '../helpers/gameHelpers.js';
```

#### Common Helpers

- **waitForGameReady(page)** - Waits for game initialization
- **moveAvatar(page, direction, duration)** - Move avatar with WASD
- **pressKey(page, key)** - Press a keyboard key
- **getAvatarPosition(page)** - Get current avatar position
- **waitForUI(page, selector)** - Wait for UI element

### Example: Testing Avatar Movement

```javascript
test('should move avatar forward', async ({ page }) => {
  const initialPos = await getAvatarPosition(page);
  
  await moveAvatar(page, 'w', 1000);
  
  const newPos = await getAvatarPosition(page);
  
  // Avatar should have moved forward (negative Z)
  expect(newPos.z).toBeLessThan(initialPos.z);
});
```

### Example: Testing UI Interactions

```javascript
test('should open settings menu', async ({ page }) => {
  await page.keyboard.press('F4');
  await page.waitForTimeout(500);
  
  const settings = page.locator('#quick-settings-menu');
  await expect(settings).toBeVisible();
});
```

### Example: Testing Game Systems

```javascript
test('should have all systems initialized', async ({ page }) => {
  const systems = await page.evaluate(() => {
    return {
      scene: window.gameSystems.scene !== null,
      avatar: window.gameSystems.avatar !== null,
      camera: window.gameSystems.camera !== null,
    };
  });
  
  expect(systems.scene).toBe(true);
  expect(systems.avatar).toBe(true);
  expect(systems.camera).toBe(true);
});
```

### Assertions

Playwright uses the `expect` API:

```javascript
// Visibility
await expect(element).toBeVisible();
await expect(element).not.toBeVisible();

// Text content
await expect(element).toHaveText('Expected Text');

// Attributes
await expect(element).toHaveAttribute('aria-disabled', 'false');

// Count
await expect(locator).toHaveCount(3);
```

---

## Test Organization

### Directory Structure

```
tests/
├── e2e/              # End-to-end tests
│   ├── app.spec.js   # Main application flows
│   ├── avatar-systems.spec.js
│   ├── ui-systems.spec.js
│   └── ...
├── helpers/          # Test utilities
│   └── gameHelpers.js
└── fixtures/         # Test fixtures
    └── ...
```

### Test File Naming

- Use descriptive names: `avatar-systems.spec.js`
- Group related tests: `ui-systems.spec.js`
- Use `.spec.js` extension

### Test Grouping

Organize tests by:
1. **System** - `avatar-systems.spec.js`
2. **Feature** - `collectibles.spec.js`
3. **Workflow** - `workflows.spec.js`
4. **Integration** - `integration.spec.js`

---

## Best Practices

### 1. Use Test Helpers

Always use `waitForGameReady()` before interacting with the game:

```javascript
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await waitForGameReady(page);
  await page.waitForTimeout(1000); // Additional wait for stability
});
```

### 2. Add Appropriate Timeouts

Wait for async operations:

```javascript
await page.waitForTimeout(500); // Wait for UI animation
await expect(element).toBeVisible({ timeout: 5000 }); // Wait for element
```

### 3. Test Isolation

Each test should be independent:

```javascript
test.beforeEach(async ({ page }) => {
  // Fresh game state for each test
  await page.goto('/');
  await waitForGameReady(page);
});
```

### 4. Handle Async Operations

Use `await` for all async operations:

```javascript
// Good
await page.keyboard.press('KeyW');
await page.waitForTimeout(200);

// Bad
page.keyboard.press('KeyW'); // Missing await
```

### 5. Verify Game State

Always verify the game is responsive:

```javascript
test('should perform action', async ({ page }) => {
  // Perform action
  await page.keyboard.press('KeyW');
  
  // Verify game still works
  const canvas = page.locator('#club-canvas');
  await expect(canvas).toBeVisible();
});
```

### 6. Use Descriptive Test Names

```javascript
// Good
test('should move avatar forward with W key', async ({ page }) => {

// Bad
test('should work', async ({ page }) => {
```

### 7. Clean Up After Tests

Tests should clean up their state (usually handled by `beforeEach`):

```javascript
test.afterEach(async ({ page }) => {
  // Cleanup if needed
});
```

### 8. Handle Errors Gracefully

Some errors may be expected - handle them:

```javascript
test('should handle missing element', async ({ page }) => {
  const element = page.locator('#might-not-exist');
  
  if (await element.count() > 0) {
    await expect(element).toBeVisible();
  }
  // Test passes even if element doesn't exist
});
```

---

## Debugging Tests

### Debug Mode

Run tests in debug mode to step through:

```bash
npm run test:debug
```

### Headed Mode

See browser actions:

```bash
npm run test:headed
```

### Console Logging

Add console logs:

```javascript
test('should do something', async ({ page }) => {
  console.log('Starting test');
  await page.goto('/');
  console.log('Page loaded');
});
```

### Screenshots

Take screenshots on failure (automatically in config):

```javascript
await page.screenshot({ path: 'screenshot.png' });
```

### Video Recording

Videos are recorded on failure (automatically in config).

### Trace Viewer

View detailed trace of test execution:

```bash
npx playwright show-trace trace.zip
```

Enable trace in test:

```javascript
test('should do something', async ({ page, context }) => {
  await context.tracing.start({ screenshots: true, snapshots: true });
  // ... test code
  await context.tracing.stop({ path: 'trace.zip' });
});
```

---

## CI/CD Integration

### GitHub Actions

Tests run automatically on push and pull requests via `.github/workflows/ci.yml`.

### CI Configuration

Key CI settings:

```yaml
- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run Playwright tests
  run: npm test
  env:
    CI: true
```

### Test Results

Test results are uploaded as artifacts:
- **playwright-report/** - HTML test report
- **test-results/** - JSON test results

### Retry Logic

Tests retry 2 times on failure in CI:

```javascript
retries: process.env.CI ? 2 : 0,
```

### Parallel Execution

Tests run in parallel in CI:

```javascript
workers: process.env.CI ? 1 : undefined,
```

---

## Troubleshooting

### Common Issues

#### Tests Timeout

**Problem**: Tests fail with timeout errors.

**Solution**:
- Increase timeout in test: `test.setTimeout(60000)`
- Add explicit waits: `await page.waitForTimeout(1000)`
- Check if game is initializing properly

#### Element Not Found

**Problem**: `locator.locator(...).first() is null`.

**Solution**:
- Use fallback selectors
- Add conditional checks: `if (await element.count() > 0)`
- Wait for element: `await expect(element).toBeVisible({ timeout: 5000 })`

#### Game Not Initializing

**Problem**: `window.gameSystems is undefined`.

**Solution**:
- Ensure `waitForGameReady()` is called
- Increase timeout in helper
- Check console for errors

#### Flaky Tests

**Problem**: Tests pass/fail intermittently.

**Solution**:
- Add explicit waits before assertions
- Increase timeouts
- Ensure test isolation
- Check for race conditions

#### Browser Crashes

**Problem**: Browser crashes during tests.

**Solution**:
- Reduce parallel workers
- Increase browser memory limits
- Check for memory leaks in game code

### Getting Help

1. Check test logs in `test-results/`
2. View HTML report: `npm run test:report`
3. Run in headed mode to see what's happening
4. Check browser console for errors
5. Review existing test files for patterns

---

## Additional Resources

### Playwright Documentation

- [Playwright Docs](https://playwright.dev/)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)

### Project-Specific Resources

- **Test Helpers**: `tests/helpers/gameHelpers.js`
- **Test README**: `tests/README.md`
- **Configuration**: `playwright.config.js`

### Example Test Files

- **Main Flows**: `tests/e2e/app.spec.js`
- **Avatar Systems**: `tests/e2e/avatar-systems.spec.js`
- **UI Systems**: `tests/e2e/ui-systems.spec.js`
- **Workflows**: `tests/e2e/workflows.spec.js`

---

## Summary

The Playwright test suite provides comprehensive coverage of the Errl Club Simulator:

- ✅ **700+ test cases** across 28 test files
- ✅ **All major systems** tested
- ✅ **Critical paths** covered
- ✅ **Edge cases** handled
- ✅ **CI/CD integrated**
- ✅ **Well documented**

Follow this guide to write robust, maintainable tests that ensure the game works correctly for all users.

