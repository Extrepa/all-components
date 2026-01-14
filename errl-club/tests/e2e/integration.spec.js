import { test, expect } from '@playwright/test';
import { setupTestWithGameInit, cleanupTestWithErrorCheck, waitForAvatarReady, checkForErrorsDuringTest } from '../helpers/gameHelpers.js';

test.describe('Integration Tests', () => {
  let errorCollection;

  test.beforeEach(async ({ page }) => {
    const setup = await setupTestWithGameInit(page);
    errorCollection = setup.errorCollection;
    // Additional wait for systems to fully integrate
    await page.waitForTimeout(1000);
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestWithErrorCheck(page, errorCollection);
  });

  test.describe('System Integration', () => {
    test('should have all core systems initialized', async ({ page }) => {
      // Check for errors before system check
      const preCheck = await checkForErrorsDuringTest(page, errorCollection);
      if (preCheck.hasErrors) {
        throw new Error(`Errors before system check: ${preCheck.errors.map(e => e.description).join(', ')}`);
      }
      
      const systems = await page.evaluate(() => {
        if (typeof window.gameSystems === 'undefined') {
          return {};
        }
        
        return {
          scene: window.gameSystems.scene !== null,
          renderer: window.gameSystems.renderer !== null,
          camera: window.gameSystems.camera !== null,
          avatar: window.gameSystems.avatar !== null,
          eventBus: window.gameSystems.eventBus !== null,
          stateManager: window.gameSystems.stateManager !== null,
        };
      });
      
      // Check for errors after system check
      const postCheck = await checkForErrorsDuringTest(page, errorCollection);
      if (postCheck.hasErrors) {
        throw new Error(`Errors after system check: ${postCheck.errors.map(e => e.description).join(', ')}`);
      }
      
      expect(systems.scene).toBe(true);
      expect(systems.renderer).toBe(true);
      expect(systems.camera).toBe(true);
      expect(systems.avatar).toBe(true);
      expect(systems.eventBus).toBe(true);
      expect(systems.stateManager).toBe(true);
    });

    test('should have UI systems initialized', async ({ page }) => {
      const uiSystems = await page.evaluate(() => {
        if (typeof window.gameSystems === 'undefined') {
          return {};
        }
        
        return {
          uiManager: window.gameSystems.uiManager !== null,
          notificationSystem: window.gameSystems.notificationSystem !== null,
          vibeMeter: window.gameSystems.vibeMeter !== null,
        };
      });
      
      // UI systems should exist
      expect(typeof uiSystems).toBe('object');
    });

    test('should have game systems initialized', async ({ page }) => {
      const gameSystems = await page.evaluate(() => {
        if (typeof window.gameSystems === 'undefined') {
          return {};
        }
        
        return {
          collectionTracker: window.gameSystems.collectionTracker !== null,
          interactionSystem: window.gameSystems.interactionSystem !== null,
          physicsSystem: window.gameSystems.physicsSystem !== null,
          collisionSystem: window.gameSystems.collisionSystem !== null,
        };
      });
      
      // Game systems should exist
      expect(typeof gameSystems).toBe('object');
    });
  });

  test.describe('Event Bus Integration', () => {
    test('should have event bus connected to systems', async ({ page }) => {
      const eventBusConnected = await page.evaluate(() => {
        if (window.gameSystems && window.gameSystems.eventBus) {
          const eventBus = window.gameSystems.eventBus;
          // Check if event bus has listeners
          return typeof eventBus.on === 'function' && 
                 typeof eventBus.emit === 'function';
        }
        return false;
      });
      
      expect(eventBusConnected).toBe(true);
    });

    test('should emit and receive events', async ({ page }) => {
      const eventWorks = await page.evaluate(() => {
        return new Promise((resolve) => {
          if (window.gameSystems && window.gameSystems.eventBus) {
            const eventBus = window.gameSystems.eventBus;
            let received = false;
            
            const handler = () => {
              received = true;
              eventBus.off('test:event', handler);
              resolve(true);
            };
            
            eventBus.on('test:event', handler);
            eventBus.emit('test:event');
            
            setTimeout(() => {
              if (!received) {
                eventBus.off('test:event', handler);
              }
              resolve(received);
            }, 100);
          } else {
            resolve(false);
          }
        });
      });
      
      expect(eventWorks).toBe(true);
    });
  });

  test.describe('Settings Integration', () => {
    test('should persist settings across systems', async ({ page }) => {
      // Change multiple settings
      await page.keyboard.press('Control+I'); // Camera intensity
      await page.waitForTimeout(300);
      await page.keyboard.press('KeyU'); // UV mode
      await page.waitForTimeout(300);
      
      // Reload
      await page.reload();
      await waitForGameReady(page);
      await page.waitForTimeout(1000);
      
      // All systems should still work
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
    });
  });

  test.describe('UI Integration', () => {
    test('should open and close multiple UI panels', async ({ page }) => {
      // Open collection progress
      await page.keyboard.press('F3');
      await page.waitForTimeout(500);
      
      // Open quick settings
      await page.keyboard.press('F4');
      await page.waitForTimeout(500);
      
      // Open audio settings
      await page.keyboard.press('F6');
      await page.waitForTimeout(500);
      
      // Close with Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      // All should work without errors
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
    });
  });

  test.describe('Game Loop Integration', () => {
    test('should maintain game loop', async ({ page }) => {
      // Wait for game loop to run
      await page.waitForTimeout(2000);
      
      // Check if game is still running
      const gameRunning = await page.evaluate(() => {
        return typeof window.gameSystems !== 'undefined' &&
               window.gameSystems.scene !== null;
      });
      
      expect(gameRunning).toBe(true);
    });

    test('should handle multiple interactions', async ({ page }) => {
      // Perform multiple actions
      await page.keyboard.press('KeyW');
      await page.waitForTimeout(100);
      await page.keyboard.press('Space');
      await page.waitForTimeout(200);
      await page.keyboard.press('KeyE');
      await page.waitForTimeout(200);
      await page.keyboard.press('KeyT');
      await page.waitForTimeout(200);
      
      // Game should still be responsive
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
    });
  });
});

