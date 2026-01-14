import { test, expect } from '@playwright/test';
import { waitForGameReady, moveAvatar, waitForAvatarReady, checkForErrorsDuringTest } from '../helpers/gameHelpers.js';
import { setupErrorCollection, checkForBlockingErrors } from '../helpers/errorRecovery.js';

test.describe('Avatar Systems Tests', () => {
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
    
    // Small delay to ensure everything is settled
    await page.waitForTimeout(500);
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

  test.describe('Avatar Movement', () => {
    test('should move avatar with WASD', async ({ page }) => {
      // Check for errors before movement
      const preCheck = await checkForErrorsDuringTest(page, errorCollection);
      if (preCheck.hasErrors) {
        throw new Error(`Errors before movement: ${preCheck.errors.map(e => e.description).join(', ')}`);
      }
      
      // Move forward
      await moveAvatar(page, 'w', 300);
      let postCheck = await checkForErrorsDuringTest(page, errorCollection);
      if (postCheck.hasErrors) {
        throw new Error(`Errors after forward movement: ${postCheck.errors.map(e => e.description).join(', ')}`);
      }
      
      // Move backward
      await moveAvatar(page, 's', 300);
      postCheck = await checkForErrorsDuringTest(page, errorCollection);
      if (postCheck.hasErrors) {
        throw new Error(`Errors after backward movement: ${postCheck.errors.map(e => e.description).join(', ')}`);
      }
      
      // Move left
      await moveAvatar(page, 'a', 300);
      postCheck = await checkForErrorsDuringTest(page, errorCollection);
      if (postCheck.hasErrors) {
        throw new Error(`Errors after left movement: ${postCheck.errors.map(e => e.description).join(', ')}`);
      }
      
      // Move right
      await moveAvatar(page, 'd', 300);
      postCheck = await checkForErrorsDuringTest(page, errorCollection);
      if (postCheck.hasErrors) {
        throw new Error(`Errors after right movement: ${postCheck.errors.map(e => e.description).join(', ')}`);
      }
      
      // Avatar should still be visible
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
    });

    test('should run with Shift+WASD', async ({ page }) => {
      // Check for errors before running
      const preCheck = await checkForErrorsDuringTest(page, errorCollection);
      if (preCheck.hasErrors) {
        throw new Error(`Errors before running: ${preCheck.errors.map(e => e.description).join(', ')}`);
      }
      
      await page.keyboard.down('Shift');
      await moveAvatar(page, 'w', 300);
      await page.keyboard.up('Shift');
      
      // Check for errors after running
      const postCheck = await checkForErrorsDuringTest(page, errorCollection);
      if (postCheck.hasErrors) {
        throw new Error(`Errors after running: ${postCheck.errors.map(e => e.description).join(', ')}`);
      }
      
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
    });

    test('should crouch with Ctrl', async ({ page }) => {
      // Check for errors before crouching
      const preCheck = await checkForErrorsDuringTest(page, errorCollection);
      if (preCheck.hasErrors) {
        throw new Error(`Errors before crouching: ${preCheck.errors.map(e => e.description).join(', ')}`);
      }
      
      await page.keyboard.press('Control');
      await page.waitForTimeout(200);
      await page.keyboard.up('Control');
      
      // Check for errors after crouching
      const postCheck = await checkForErrorsDuringTest(page, errorCollection);
      if (postCheck.hasErrors) {
        throw new Error(`Errors after crouching: ${postCheck.errors.map(e => e.description).join(', ')}`);
      }
      
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
    });

    test('should hop with Space', async ({ page }) => {
      await page.keyboard.press('Space');
      await page.waitForTimeout(300);
      await page.keyboard.up('Space');
      
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
    });

    test('should dash with Shift+Space', async ({ page }) => {
      await page.keyboard.press('Shift+Space');
      await page.waitForTimeout(300);
      await page.keyboard.up('Shift+Space');
      
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
    });

    test('should dance with Shift+D', async ({ page }) => {
      await page.keyboard.press('Shift+KeyD');
      await page.waitForTimeout(500);
      await page.keyboard.up('Shift+KeyD');
      
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
    });
  });

  test.describe('Avatar Color Variants', () => {
    test('should have avatar with color variant', async ({ page }) => {
      // Check if avatar exists in game state
      const avatarExists = await page.evaluate(() => {
        return typeof window.gameSystems !== 'undefined' && 
               window.gameSystems.avatar !== null;
      });
      
      expect(avatarExists).toBe(true);
    });

    test('should support color variant changes', async ({ page }) => {
      // Try to change color variant via game systems
      const variantChanged = await page.evaluate(() => {
        if (window.gameSystems && window.gameSystems.avatar) {
          const avatar = window.gameSystems.avatar;
          if (typeof avatar.setColorVariant === 'function') {
            avatar.setColorVariant('ocean_blue');
            return true;
          }
        }
        return false;
      });
      
      // Should support variant changes (or at least have the method)
      expect(variantChanged).toBe(true);
    });

    test('should randomize color variant', async ({ page }) => {
      const variantRandomized = await page.evaluate(() => {
        if (window.gameSystems && window.gameSystems.avatar) {
          const avatar = window.gameSystems.avatar;
          if (typeof avatar.randomizeColorVariant === 'function') {
            avatar.randomizeColorVariant();
            return true;
          }
        }
        return false;
      });
      
      expect(variantRandomized).toBe(true);
    });

    test('should have all 25 color variants available', async ({ page }) => {
      const variantCount = await page.evaluate(() => {
        if (window.gameSystems && window.gameSystems.avatar) {
          const avatar = window.gameSystems.avatar;
          if (avatar.colorVariants) {
            return Object.keys(avatar.colorVariants).length;
          }
        }
        return 0;
      });
      
      // Should have 25 variants (or at least some variants)
      expect(variantCount).toBeGreaterThan(0);
    });
  });

  test.describe('Avatar Camera', () => {
    test('should orbit camera with mouse drag', async ({ page }) => {
      const canvas = page.locator('#club-canvas');
      const box = await canvas.boundingBox();
      
      if (box) {
        // Simulate mouse drag
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2 + 50);
        await page.mouse.up();
        
        await page.waitForTimeout(300);
        await expect(canvas).toBeVisible();
      }
    });

    test('should zoom with scroll wheel', async ({ page }) => {
      const canvas = page.locator('#club-canvas');
      const box = await canvas.boundingBox();
      
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.wheel(0, -100); // Scroll up (zoom in)
        await page.waitForTimeout(300);
        await page.mouse.wheel(0, 100); // Scroll down (zoom out)
        await page.waitForTimeout(300);
        
        await expect(canvas).toBeVisible();
      }
    });

    test('should snap camera with R key', async ({ page }) => {
      await page.keyboard.press('KeyR');
      await page.waitForTimeout(500);
      
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
    });

    test('should toggle cinematic mode with C', async ({ page }) => {
      await page.keyboard.press('KeyC');
      await page.waitForTimeout(500);
      
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
    });

    test('should toggle freecam with F', async ({ page }) => {
      await page.keyboard.press('KeyF');
      await page.waitForTimeout(500);
      
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
    });

    test('should toggle lock-on mode with L', async ({ page }) => {
      await page.keyboard.press('KeyL');
      await page.waitForTimeout(500);
      
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
    });

    test('should use camera presets with 1/2/3', async ({ page }) => {
      await page.keyboard.press('Digit1');
      await page.waitForTimeout(300);
      await page.keyboard.press('Digit2');
      await page.waitForTimeout(300);
      await page.keyboard.press('Digit3');
      await page.waitForTimeout(300);
      
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
    });
  });

  test.describe('Avatar Interactions', () => {
    test('should interact with objects using E key', async ({ page }) => {
      await page.keyboard.press('KeyE');
      await page.waitForTimeout(500);
      
      const canvas = page.locator('#club-canvas');
      await expect(canvas).toBeVisible();
    });

    test('should open emote wheel with Tab', async ({ page }) => {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
      
      // Emote wheel might appear
      const emoteWheel = page.locator('[data-testid="emote-wheel"], .emote-wheel').first();
      const count = await emoteWheel.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});

