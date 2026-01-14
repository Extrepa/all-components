import { test, expect } from '@playwright/test';
import { waitForGameReady } from '../helpers/gameHelpers.js';

/**
 * Transition Tests - Verifies TV-to-Nightclub transition works correctly
 * 
 * This test suite verifies:
 * 1. The TV transition can be triggered
 * 2. The transition completes successfully
 * 3. The camera switches from TV room to club camera
 * 4. The avatar is positioned in the nightclub scene
 * 5. The club scene is active and rendering
 */
test.describe('TV-to-Nightclub Transition', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGameReady(page);
    
    // Wait for ready button and click it
    const readyButton = page.locator('button').filter({ hasText: /READY\?/i });
    await expect(readyButton).toBeVisible({ timeout: 30000 });
    await readyButton.click();
    
    // Wait for game systems to be initialized
    await page.waitForFunction(() => {
      return typeof window.gameSystems !== 'undefined' &&
             window.gameSystems.scene !== null;
    }, { timeout: 10000 });
    
    // Wait a bit for full initialization
    await page.waitForTimeout(2000);
  });

  test('should have TV transition system available', async ({ page }) => {
    const hasTransitionSystem = await page.evaluate(() => {
      return typeof window.gameSystems !== 'undefined' &&
             window.gameSystems.tvTransitionSystem !== null &&
             window.gameSystems.tvTransitionSystem !== undefined;
    });
    
    expect(hasTransitionSystem).toBe(true);
  });

  test('should be able to start TV transition', async ({ page }) => {
    // Check if transition can be started
    const transitionInfo = await page.evaluate(() => {
      if (!window.gameSystems || !window.gameSystems.tvTransitionSystem) {
        return { canStart: false, reason: 'No transition system' };
      }
      
      const transition = window.gameSystems.tvTransitionSystem;
      return {
        canStart: true,
        inProgress: transition.inProgress || false,
        hasTVRoomCamera: transition.tvRoomCamera !== null,
        hasClubCamera: transition.clubCamera !== null,
        hasClubScene: window.gameSystems.clubScene !== null,
      };
    });
    
    expect(transitionInfo.canStart).toBe(true);
    expect(transitionInfo.hasTVRoomCamera).toBe(true);
    expect(transitionInfo.hasClubCamera).toBe(true);
    expect(transitionInfo.hasClubScene).toBe(true);
  });

  test('should complete transition and switch to club scene', async ({ page }) => {
    // Start the transition programmatically
    const transitionStarted = await page.evaluate(async () => {
      if (!window.gameSystems || !window.gameSystems.tvTransitionSystem) {
        return false;
      }
      
      const transition = window.gameSystems.tvTransitionSystem;
      
      // Start transition
      await transition.start();
      
      return transition.inProgress;
    });
    
    expect(transitionStarted).toBe(true);
    
    // Wait for transition to complete (max 10 seconds for 8 second transition)
    await page.waitForFunction(() => {
      if (!window.gameSystems || !window.gameSystems.tvTransitionSystem) {
        return false;
      }
      return !window.gameSystems.tvTransitionSystem.inProgress;
    }, { timeout: 12000 });
    
    // Verify transition completed
    const transitionComplete = await page.evaluate(() => {
      if (!window.gameSystems || !window.gameSystems.tvTransitionSystem) {
        return { complete: false, reason: 'No transition system' };
      }
      
      const transition = window.gameSystems.tvTransitionSystem;
      return {
        complete: !transition.inProgress,
        cameraSwitched: transition.cameraSwitched || false,
        activeCamera: transition.activeCamera === transition.clubCamera,
        clubSceneActive: window.gameSystems.clubScene !== null,
      };
    });
    
    expect(transitionComplete.complete).toBe(true);
    expect(transitionComplete.cameraSwitched).toBe(true);
    expect(transitionComplete.activeCamera).toBe(true);
    expect(transitionComplete.clubSceneActive).toBe(true);
  });

  test('should position avatar in nightclub after transition', async ({ page }) => {
    // Start and wait for transition
    await page.evaluate(async () => {
      if (window.gameSystems && window.gameSystems.tvTransitionSystem) {
        await window.gameSystems.tvTransitionSystem.start();
      }
    });
    
    // Wait for transition to complete
    await page.waitForFunction(() => {
      return window.gameSystems &&
             window.gameSystems.tvTransitionSystem &&
             !window.gameSystems.tvTransitionSystem.inProgress;
    }, { timeout: 12000 });
    
    // Check avatar position and scene
    const avatarInfo = await page.evaluate(() => {
      if (!window.gameSystems || !window.gameSystems.avatar) {
        return { hasAvatar: false };
      }
      
      const avatar = window.gameSystems.avatar;
      return {
        hasAvatar: true,
        position: avatar.position ? {
          x: avatar.position.x,
          y: avatar.position.y,
          z: avatar.position.z
        } : null,
        inClubScene: avatar.scene === window.gameSystems.clubScene,
        groupInScene: avatar.group && avatar.group.parent === window.gameSystems.clubScene,
        visible: avatar.group ? avatar.group.visible : false,
      };
    });
    
    expect(avatarInfo.hasAvatar).toBe(true);
    expect(avatarInfo.position).not.toBeNull();
    expect(avatarInfo.inClubScene).toBe(true);
    expect(avatarInfo.groupInScene).toBe(true);
    expect(avatarInfo.visible).toBe(true);
  });

  test('should have club scene with objects after transition', async ({ page }) => {
    // Start and wait for transition
    await page.evaluate(async () => {
      if (window.gameSystems && window.gameSystems.tvTransitionSystem) {
        await window.gameSystems.tvTransitionSystem.start();
      }
    });
    
    // Wait for transition to complete
    await page.waitForFunction(() => {
      return window.gameSystems &&
             window.gameSystems.tvTransitionSystem &&
             !window.gameSystems.tvTransitionSystem.inProgress;
    }, { timeout: 12000 });
    
    // Check club scene has objects
    const sceneInfo = await page.evaluate(() => {
      if (!window.gameSystems || !window.gameSystems.clubScene) {
        return { hasScene: false };
      }
      
      const scene = window.gameSystems.clubScene;
      return {
        hasScene: true,
        childrenCount: scene.children.length,
        hasFloor: scene.children.some(child => 
          child.name && child.name.toLowerCase().includes('floor')
        ),
        hasWalls: scene.children.some(child => 
          child.name && child.name.toLowerCase().includes('wall')
        ),
        hasStage: scene.children.some(child => 
          child.name && child.name.toLowerCase().includes('stage')
        ),
        hasAvatar: scene.children.some(child => 
          child === window.gameSystems.avatar?.group
        ),
      };
    });
    
    expect(sceneInfo.hasScene).toBe(true);
    expect(sceneInfo.childrenCount).toBeGreaterThan(0);
    expect(sceneInfo.hasAvatar).toBe(true);
  });

  test('should not have WebGL errors during transition', async ({ page }) => {
    // Collect console errors
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Start transition
    await page.evaluate(async () => {
      if (window.gameSystems && window.gameSystems.tvTransitionSystem) {
        await window.gameSystems.tvTransitionSystem.start();
      }
    });
    
    // Wait for transition to complete
    await page.waitForFunction(() => {
      return window.gameSystems &&
             window.gameSystems.tvTransitionSystem &&
             !window.gameSystems.tvTransitionSystem.inProgress;
    }, { timeout: 12000 });
    
    // Wait a bit more to catch any delayed errors
    await page.waitForTimeout(1000);
    
    // Check for WebGL errors
    const errorMessages = consoleErrors.join('\n');
    const hasWebGLError = errorMessages.includes('WebGL') || 
                          errorMessages.includes('Shader Error') ||
                          errorMessages.includes('texture') ||
                          errorMessages.includes('TEXTURE_IMAGE_UNITS') ||
                          errorMessages.includes('INVALID_OPERATION');
    
    if (hasWebGLError) {
      console.error('WebGL errors during transition:', errorMessages);
    }
    
    expect(hasWebGLError).toBe(false);
  });
});

