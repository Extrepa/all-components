import { test, expect } from '@playwright/test';
import { setupErrorCollection, checkForBlockingErrors } from '../helpers/errorRecovery.js';
import { waitForGameReady } from '../helpers/gameHelpers.js';

/**
 * Simple test to verify the game loads and initializes
 */
test.describe('Game Loading', () => {
  let errorCollection;

  test.beforeEach(async ({ page }) => {
    errorCollection = setupErrorCollection(page);
    page._errorCollection = errorCollection;
  });

  test.afterEach(async ({ page }) => {
    if (errorCollection) {
      const blockingCheck = checkForBlockingErrors(errorCollection, {
        ignoreExpected: true,
        ignoreKnownBugs: true,
        logErrors: true
      });
      errorCollection.cleanup();
    }
  });

  test('should load game and show canvas', async ({ page }) => {
    // Navigate to the game
    await page.goto('/');
    
    // Wait for game to be ready
    await waitForGameReady(page);
    
    // Check that canvas exists
    const canvas = page.locator('#club-canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    
    // Check for blocking errors
    if (errorCollection) {
      const blockingCheck = checkForBlockingErrors(errorCollection, {
        ignoreExpected: true,
        ignoreKnownBugs: true,
        logErrors: false
      });
      
      if (!blockingCheck.shouldProceed) {
        console.error('Blocking errors detected:', blockingCheck.errors);
      }
    }
    
    // Basic check - canvas should exist and be visible
    await expect(canvas).toBeVisible();
  });
});

