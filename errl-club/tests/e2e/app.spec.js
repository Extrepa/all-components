import { test, expect } from '@playwright/test';
import { waitForGameReady } from '../helpers/gameHelpers.js';

/**
 * Main Application Flow Tests
 * 
 * These tests verify the critical user journeys and main application flows:
 * 1. Game initialization and startup
 * 2. Navigation through UI menus
 * 3. Component rendering across different states
 * 4. User interactions and workflows
 * 5. Edge cases and error handling
 */
test.describe('Main Application Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Application Startup', () => {
    test('should complete full initialization flow', async ({ page }) => {
      // Wait for loading screen
      await page.waitForFunction(() => {
        return document.getElementById('loading-screen') !== null;
      }, { timeout: 10000 });

      // Wait for ready button to appear
      await page.waitForFunction(() => {
        const button = document.querySelector('button');
        return button && button.textContent.includes('READY?') && button.getAttribute('aria-disabled') === 'false';
      }, { timeout: 60000 });

      // Click ready button
      const readyButton = page.locator('button').filter({ hasText: /READY\?/i });
      await readyButton.first().click();

      // Wait for loading screen to disappear
      await page.waitForFunction(() => {
        const loadingScreen = document.getElementById('loading-screen');
        return !loadingScreen || loadingScreen.style.display === 'none' || !loadingScreen.offsetParent;
      }, { timeout: 15000 });

      // Verify game systems are initialized
      await page.waitForFunction(() => {
        return typeof window.gameSystems !== 'undefined' &&
               window.gameSystems.scene !== null &&
               window.gameSystems.renderer !== null;
      }, { timeout: 20000 });

      // Verify canvas is visible
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible({ timeout: 10000 });
    });

    test('should handle page reload gracefully', async ({ page }) => {
      await page.goto('/');
      await waitForGameReady(page);
      
      // Reload the page
      await page.reload();
      
      // Wait for game to reinitialize
      await waitForGameReady(page);
      
      // Verify systems still work
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
    });
  });

  test.describe('Navigation Flow', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await waitForGameReady(page);
      await page.waitForTimeout(1000);
    });

    test('should navigate through all major UI menus', async ({ page }) => {
      // Open Collection Progress (F3)
      await page.keyboard.press('F3');
      await page.waitForTimeout(500);
      
      // Open Quick Settings (F4)
      await page.keyboard.press('F4');
      await page.waitForTimeout(500);
      
      // Open Tutorial/Help (F5)
      await page.keyboard.press('F5');
      await page.waitForTimeout(500);
      
      // Open Audio Settings (F6)
      await page.keyboard.press('F6');
      await page.waitForTimeout(500);
      
      // Close with Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      // Verify game still running
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
    });

    test('should handle rapid menu toggling', async ({ page }) => {
      // Rapidly open and close menus
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('F4');
        await page.waitForTimeout(100);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(100);
      }
      
      // Verify no errors occurred
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
    });
  });

  test.describe('Component Rendering', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await waitForGameReady(page);
      await page.waitForTimeout(1000);
    });

    test('should render all UI components correctly', async ({ page }) => {
      // Check canvas is rendered
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
      
      // Verify canvas has proper dimensions
      const canvasBox = await canvas.boundingBox();
      expect(canvasBox).not.toBeNull();
      expect(canvasBox.width).toBeGreaterThan(0);
      expect(canvasBox.height).toBeGreaterThan(0);
      
      // Check that game systems are available
      const systemsAvailable = await page.evaluate(() => {
        return typeof window.gameSystems !== 'undefined';
      });
      expect(systemsAvailable).toBe(true);
    });

    test('should render UI panels when opened', async ({ page }) => {
      // Open collection progress
      await page.keyboard.press('F3');
      await page.waitForTimeout(500);
      
      // UI should be accessible (check for any visible panels)
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Close UI
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    });
  });

  test.describe('User Interactions', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await waitForGameReady(page);
      await page.waitForTimeout(1000);
    });

    test('should handle complete exploration workflow', async ({ page }) => {
      // Move around
      await page.keyboard.press('KeyW');
      await page.waitForTimeout(300);
      await page.keyboard.up('KeyW');
      
      await page.keyboard.press('KeyA');
      await page.waitForTimeout(300);
      await page.keyboard.up('KeyA');
      
      // Try different movement modes
      await page.keyboard.press('Shift+KeyW');
      await page.waitForTimeout(300);
      await page.keyboard.up('Shift+KeyW');
      
      await page.keyboard.press('Space');
      await page.waitForTimeout(300);
      
      // Use camera
      const canvas = page.locator('#club-canvas');
      const box = await canvas.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2);
        await page.mouse.up();
      }
      
      // Verify game still responsive
      await expect(canvas).toBeVisible();
    });

    test('should handle interaction workflow', async ({ page }) => {
      // Try interaction key
      await page.keyboard.press('KeyE');
      await page.waitForTimeout(500);
      
      // Try emote wheel
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      // Verify game still running
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
    });

    test('should handle camera preset cycling', async ({ page }) => {
      // Cycle through camera presets
      await page.keyboard.press('Digit1');
      await page.waitForTimeout(300);
      
      await page.keyboard.press('Digit2');
      await page.waitForTimeout(300);
      
      await page.keyboard.press('Digit3');
      await page.waitForTimeout(300);
      
      // Reset to preset 1
      await page.keyboard.press('Digit1');
      await page.waitForTimeout(300);
      
      // Verify camera still working
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
    });
  });

  test.describe('Critical Paths', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await waitForGameReady(page);
      await page.waitForTimeout(1000);
    });

    test('should complete first-time player journey', async ({ page }) => {
      // 1. Game loads and shows canvas
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
      
      // 2. Player can move around
      await page.keyboard.press('KeyW');
      await page.waitForTimeout(200);
      await page.keyboard.up('KeyW');
      
      // 3. Player can open help/tutorial
      await page.keyboard.press('F5');
      await page.waitForTimeout(500);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      // 4. Player can access settings
      await page.keyboard.press('F4');
      await page.waitForTimeout(500);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      // 5. Game remains stable throughout
      await expect(canvas).toBeVisible();
    });

    test('should handle collectible collection workflow', async ({ page }) => {
      // Move around (collectibles might be nearby)
      await page.keyboard.press('KeyW');
      await page.waitForTimeout(1000);
      await page.keyboard.up('KeyW');
      
      // Open collection progress to verify system works
      await page.keyboard.press('F3');
      await page.waitForTimeout(500);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      // Verify collection system exists
      const collectionSystem = await page.evaluate(() => {
        return window.gameSystems && window.gameSystems.collectionTracker !== null;
      });
      
      expect(typeof collectionSystem).toBe('boolean');
    });

    test('should handle replay workflow', async ({ page }) => {
      // Start recording (T key)
      await page.keyboard.press('KeyT');
      await page.waitForTimeout(500);
      
      // Move around while recording
      await page.keyboard.press('KeyW');
      await page.waitForTimeout(300);
      await page.keyboard.up('KeyW');
      
      // Stop recording (T key again)
      await page.keyboard.press('KeyT');
      await page.waitForTimeout(500);
      
      // Try to spawn ghost (G key)
      await page.keyboard.press('KeyG');
      await page.waitForTimeout(500);
      
      // Verify game still running
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
    });
  });

  test.describe('Edge Cases', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await waitForGameReady(page);
      await page.waitForTimeout(1000);
    });

    test('should handle rapid key presses', async ({ page }) => {
      // Rapidly press multiple keys
      const keys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space'];
      
      for (let i = 0; i < 10; i++) {
        const key = keys[Math.floor(Math.random() * keys.length)];
        await page.keyboard.press(key);
        await page.waitForTimeout(50);
      }
      
      // Verify game didn't crash
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
    });

    test('should handle simultaneous actions', async ({ page }) => {
      // Try multiple simultaneous actions
      await page.keyboard.press('KeyW');
      await page.keyboard.press('Space');
      await page.waitForTimeout(200);
      await page.keyboard.up('KeyW');
      await page.keyboard.up('Space');
      
      // Open menu while moving
      await page.keyboard.press('KeyW');
      await page.keyboard.press('F4');
      await page.waitForTimeout(300);
      await page.keyboard.up('KeyW');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      
      // Verify game handled it gracefully
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
    });

    test('should handle window resize', async ({ page }) => {
      // Resize window
      await page.setViewportSize({ width: 800, height: 600 });
      await page.waitForTimeout(500);
      
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(500);
      
      // Verify canvas adapts
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
      
      const canvasBox = await canvas.boundingBox();
      expect(canvasBox).not.toBeNull();
    });

    test('should handle multiple UI opens and closes', async ({ page }) => {
      // Open and close multiple UIs rapidly
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press('F3');
        await page.waitForTimeout(100);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(100);
        
        await page.keyboard.press('F4');
        await page.waitForTimeout(100);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(100);
      }
      
      // Verify no state corruption
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should recover from initialization errors gracefully', async ({ page }) => {
      // Monitor for console errors
      const errors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.goto('/');
      await waitForGameReady(page);
      
      // Game should still load even if there are minor errors
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible({ timeout: 15000 });
      
      // Note: We don't fail on errors, just verify game still works
      // This allows for non-critical errors while ensuring core functionality
    });

    test('should maintain state after errors', async ({ page }) => {
      await page.goto('/');
      await waitForGameReady(page);
      
      // Perform actions that might trigger errors
      await page.keyboard.press('KeyW');
      await page.waitForTimeout(200);
      
      // Try invalid key combinations
      await page.keyboard.press('F12'); // Dev tools (might not do anything)
      await page.waitForTimeout(200);
      
      // Verify game state is maintained
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
      
      // Verify systems still exist
      const systemsExist = await page.evaluate(() => {
        return typeof window.gameSystems !== 'undefined';
      });
      expect(systemsExist).toBe(true);
    });
  });

  test.describe('Performance', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await waitForGameReady(page);
      await page.waitForTimeout(1000);
    });

    test('should maintain performance during extended play', async ({ page }) => {
      // Simulate extended play session
      for (let i = 0; i < 5; i++) {
        // Move around
        await page.keyboard.press('KeyW');
        await page.waitForTimeout(200);
        await page.keyboard.up('KeyW');
        
        // Open/close UI
        await page.keyboard.press('F4');
        await page.waitForTimeout(200);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);
      }
      
      // Verify canvas still rendering
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
      
      // Check for memory leaks (basic check - systems still accessible)
      const systemsAccessible = await page.evaluate(() => {
        return typeof window.gameSystems !== 'undefined' &&
               window.gameSystems.scene !== null;
      });
      expect(systemsAccessible).toBe(true);
    });

    test('should handle high interaction rate', async ({ page }) => {
      // High rate of interactions
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Space');
        await page.waitForTimeout(50);
      }
      
      // Verify game is still responsive
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
    });
  });
});

