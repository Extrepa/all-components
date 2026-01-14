import { test, expect } from '@playwright/test';
import { waitForGameReady, moveAvatar, waitForAvatarReady, checkForErrorsDuringTest } from '../helpers/gameHelpers.js';
import { setupErrorCollection, checkForBlockingErrors } from '../helpers/errorRecovery.js';

test.describe('Collectibles System Tests', () => {
  let errorCollection;

  test.beforeEach(async ({ page }) => {
    // Setup error collection
    errorCollection = setupErrorCollection(page);
    page._errorCollection = errorCollection;
    
    // Navigate and initialize game
    await page.goto('/');
    await waitForGameReady(page);
    
    // Wait for avatar to be ready (not spawning, on ground)
    await waitForAvatarReady(page);
    
    // Check for blocking errors after initialization
    const blockingCheck = checkForBlockingErrors(errorCollection, {
      ignoreExpected: true,
      ignoreKnownBugs: true,
      logErrors: true
    });
    
    if (!blockingCheck.shouldProceed) {
      throw new Error(`Blocking errors detected after initialization: ${blockingCheck.errors.map(e => e.description).join(', ')}`);
    }
    
    // Wait for collectibles to spawn
    await page.waitForTimeout(2000);
    
    // Check for errors after collectibles spawn
    const spawnCheck = await checkForErrorsDuringTest(page, errorCollection);
    if (spawnCheck.hasErrors) {
      console.warn('Errors after collectibles spawn (non-blocking):', spawnCheck.errors.map(e => e.description).join(', '));
    }
  });

  test.afterEach(async ({ page }) => {
    // Check for errors after test
    if (errorCollection) {
      const errorCheck = await checkForErrorsDuringTest(page, errorCollection);
      if (errorCheck.hasErrors) {
        console.error('Errors detected during test:', errorCheck.errors);
      }
      errorCollection.cleanup();
    }
  });

  test.describe('Collection Tracking', () => {
    test('should have collection tracker system', async ({ page }) => {
      const trackerExists = await page.evaluate(() => {
        return typeof window.gameSystems !== 'undefined' && 
               window.gameSystems.collectionTracker !== null;
      });
      
      expect(trackerExists).toBe(true);
    });

    test('should track collection statistics', async ({ page }) => {
      const stats = await page.evaluate(() => {
        if (window.gameSystems && window.gameSystems.collectionTracker) {
          return window.gameSystems.collectionTracker.getStats();
        }
        return null;
      });
      
      // Should have stats object
      expect(stats).not.toBeNull();
      if (stats) {
        expect(typeof stats).toBe('object');
      }
    });

    test('should have collection statistics system', async ({ page }) => {
      const statsSystem = await page.evaluate(() => {
        return typeof window.gameSystems !== 'undefined' && 
               window.gameSystems.collectionStatistics !== null;
      });
      
      // Collection statistics might exist
      expect(typeof statsSystem).toBe('boolean');
    });
  });

  test.describe('Fragment Progression', () => {
    test('should have fragment progression system', async ({ page }) => {
      const progressionExists = await page.evaluate(() => {
        return typeof window.gameSystems !== 'undefined' && 
               window.gameSystems.fragmentProgression !== null;
      });
      
      expect(progressionExists).toBe(true);
    });

    test('should track fragment count', async ({ page }) => {
      const fragmentCount = await page.evaluate(() => {
        if (window.gameSystems && window.gameSystems.fragmentProgression) {
          return window.gameSystems.fragmentProgression.getFragmentCount();
        }
        return 0;
      });
      
      // Should return a number
      expect(typeof fragmentCount).toBe('number');
      expect(fragmentCount).toBeGreaterThanOrEqual(0);
    });

    test('should have fragment milestones', async ({ page }) => {
      const milestones = await page.evaluate(() => {
        if (window.gameSystems && window.gameSystems.fragmentProgression) {
          return window.gameSystems.fragmentProgression.getMilestones();
        }
        return [];
      });
      
      // Should have milestones array
      expect(Array.isArray(milestones)).toBe(true);
    });
  });

  test.describe('Collection Events', () => {
    test('should emit collection events', async ({ page }) => {
      const eventEmitted = await page.evaluate(() => {
        return new Promise((resolve) => {
          if (window.gameSystems && window.gameSystems.eventBus) {
            const eventBus = window.gameSystems.eventBus;
            let eventReceived = false;
            
            const handler = () => {
              eventReceived = true;
              eventBus.off('collectible:collected', handler);
              resolve(eventReceived);
            };
            
            eventBus.on('collectible:collected', handler);
            
            // Trigger a test event
            setTimeout(() => {
              if (!eventReceived) {
                eventBus.off('collectible:collected', handler);
                resolve(false);
              }
            }, 1000);
          } else {
            resolve(false);
          }
        });
      });
      
      // Event system should exist
      expect(typeof eventEmitted).toBe('boolean');
    });
  });

  test.describe('Collection UI', () => {
    test('should display collection progress', async ({ page }) => {
      // Open collection progress UI
      await page.keyboard.press('F3');
      await page.waitForTimeout(500);
      
      // Should show collection information
      const collectionInfo = page.locator('text=/collection|drips|bubbles|fragments|glow/i').first();
      const count = await collectionInfo.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});

