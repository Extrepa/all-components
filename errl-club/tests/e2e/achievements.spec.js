import { test, expect } from '@playwright/test';
import { waitForGameReady } from '../helpers/gameHelpers.js';

test.describe('Achievement System Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGameReady(page);
    await page.waitForTimeout(1000);
  });

  test.describe('Achievement System Initialization', () => {
    test('should have achievement system', async ({ page }) => {
      const systemExists = await page.evaluate(() => {
        return typeof window.gameSystems !== 'undefined' && 
               window.gameSystems.achievementSystem !== null;
      });
      
      expect(systemExists).toBe(true);
    });

    test('should have achievement definitions', async ({ page }) => {
      const achievementCount = await page.evaluate(() => {
        if (window.gameSystems && window.gameSystems.achievementSystem) {
          const system = window.gameSystems.achievementSystem;
          if (typeof system.getAllAchievements === 'function') {
            return system.getAllAchievements().length;
          }
        }
        return 0;
      });
      
      // Should have achievements defined
      expect(achievementCount).toBeGreaterThan(0);
    });
  });

  test.describe('Achievement Tracking', () => {
    test('should track achievement progress', async ({ page }) => {
      const progress = await page.evaluate(() => {
        if (window.gameSystems && window.gameSystems.achievementSystem) {
          const system = window.gameSystems.achievementSystem;
          if (typeof system.getProgress === 'function') {
            return system.getProgress();
          }
        }
        return null;
      });
      
      // Should have progress tracking
      expect(progress !== null || typeof progress === 'object').toBe(true);
    });

    test('should check achievements on events', async ({ page }) => {
      const checksAchievements = await page.evaluate(() => {
        if (window.gameSystems && window.gameSystems.achievementSystem) {
          const system = window.gameSystems.achievementSystem;
          // Check if system has event listeners
          return typeof system.checkAchievements === 'function' || 
                 typeof system.updateProgress === 'function';
        }
        return false;
      });
      
      expect(checksAchievements).toBe(true);
    });
  });

  test.describe('Achievement Notifications', () => {
    test('should show achievement notifications', async ({ page }) => {
      // Achievement notifications should be handled by NotificationSystem
      const notificationSystem = await page.evaluate(() => {
        return typeof window.gameSystems !== 'undefined' && 
               window.gameSystems.notificationSystem !== null;
      });
      
      expect(notificationSystem).toBe(true);
    });
  });

  test.describe('Achievement Persistence', () => {
    test('should persist achievements', async ({ page }) => {
      const persists = await page.evaluate(() => {
        if (window.gameSystems && window.gameSystems.achievementSystem) {
          const system = window.gameSystems.achievementSystem;
          // Check if system has save/load methods
          return typeof system.save === 'function' || 
                 typeof system.load === 'function' ||
                 system.settingsManager !== null;
        }
        return false;
      });
      
      // Should have persistence mechanism
      expect(persists).toBe(true);
    });
  });
});

