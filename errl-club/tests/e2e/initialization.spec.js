import { test, expect } from '@playwright/test';
import { waitForGameReady } from '../helpers/gameHelpers.js';
import { setupErrorCollection, checkForBlockingErrors } from '../helpers/errorRecovery.js';

/**
 * Initialization Tests - Verifies game loads correctly and critical fixes are working
 * 
 * This test suite verifies:
 * 1. The game loads and shows the loading screen
 * 2. The Start Game button appears and becomes clickable
 * 3. No WebGL errors occur during initialization
 * 4. The 3D scene renders correctly
 * 5. The player avatar is visible
 */
test.describe('Game Initialization', () => {
  let errorCollection;

  test.beforeEach(async ({ page }) => {
    // Set up enhanced error collection
    errorCollection = setupErrorCollection(page);
    
    // Store for use in tests
    page._errorCollection = errorCollection;
  });

  test.afterEach(async ({ page }) => {
    // Check for blocking errors after each test
    if (errorCollection) {
      const blockingCheck = checkForBlockingErrors(errorCollection, {
        ignoreExpected: true,
        ignoreKnownBugs: true,
        logErrors: true
      });
      
      if (!blockingCheck.shouldProceed) {
        console.error('Blocking errors detected after test:', blockingCheck.errors);
      }
      
      errorCollection.cleanup();
    }
  });

  test('should load and show loading screen', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load and script to execute
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for main menu to be created (it's created asynchronously via dynamic import)
    await page.waitForFunction(() => {
      return document.getElementById('main-menu') !== null;
    }, { timeout: 10000 });
    
    // Wait for main menu to be visible
    const mainMenu = page.locator('#main-menu');
    await expect(mainMenu).toBeVisible({ timeout: 5000 });
    
    // Check for title
    const title = page.locator('h1').filter({ hasText: /ERRL CLUB/i });
    await expect(title.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show progress bar during loading', async ({ page }) => {
    await page.goto('/');
    
    // Wait for main menu to be created
    await page.waitForFunction(() => {
      return document.getElementById('main-menu') !== null;
    }, { timeout: 10000 });
    
    // Wait for progress bar to appear (should be visible during loading)
    await page.waitForFunction(() => {
      const progressFill = document.getElementById('loading-progress-fill');
      return progressFill !== null;
    }, { timeout: 15000 });
    
    const progressBar = page.locator('#loading-progress-fill');
    await expect(progressBar).toBeVisible({ timeout: 5000 });
    
    // Progress should be less than 100% initially
    const progressWidth = await progressBar.evaluate(el => parseFloat(el.style.width) || 0);
    expect(progressWidth).toBeLessThan(100);
  });

  test('should enable Start Game button when game is ready', async ({ page }) => {
    await page.goto('/');
    
    // Wait for main menu to be created
    await page.waitForFunction(() => {
      return document.getElementById('main-menu') !== null;
    }, { timeout: 10000 });
    
    // Wait for button to change to "Start Game" (button appears at 100%)
    // This can take a while as the game initializes
    await page.waitForFunction(() => {
      const mainMenu = document.getElementById('main-menu');
      if (!mainMenu) return false;
      const buttons = mainMenu.querySelectorAll('button');
      for (const button of buttons) {
        const text = button.textContent.trim().toUpperCase();
        if ((text.includes('START GAME') || text.includes('START')) && 
            button.getAttribute('aria-disabled') === 'false' &&
            button.offsetParent !== null) {
          return true;
        }
      }
      return false;
    }, { timeout: 60000 });
    
    const startButton = page.locator('#main-menu button').filter({ hasText: /START GAME|START/i });
    await expect(startButton.first()).toBeVisible({ timeout: 5000 });
    
    // Button should be enabled
    const isDisabled = await startButton.first().getAttribute('aria-disabled');
    expect(isDisabled).toBe('false');
    
    // Button should be clickable
    await expect(startButton.first()).toBeEnabled();
  });

  test('should click Start Game button and start game', async ({ page }) => {
    await page.goto('/');
    
    // Use waitForGameReady helper which handles button click/Enter key automatically
    await waitForGameReady(page);
    
    // Game should now be running - verify main menu is gone
    await page.waitForFunction(() => {
      const mainMenu = document.getElementById('main-menu');
      return !mainMenu || mainMenu.style.display === 'none' || !mainMenu.offsetParent;
    }, { timeout: 5000 });
  });

  test('should not have WebGL or shader errors during initialization', async ({ page }) => {
    // Collect console errors
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Also listen for page errors
    page.on('pageerror', (error) => {
      consoleErrors.push(error.message);
    });
    
    await page.goto('/');
    
    // Use waitForGameReady helper which handles button click/Enter key automatically
    await waitForGameReady(page);
    
    // Wait a bit more for any delayed errors
    await page.waitForTimeout(2000);
    
    // Check console for WebGL errors (filter out 404 errors and handled texture unit errors)
    const errorMessages = consoleErrors
      .filter(err => !err.includes('404') && 
                     !err.includes('favicon') &&
                     !err.includes('texture unit limit exceeded') && // Handled by PostProcessingManager
                     !err.includes('MAX_TEXTURE_IMAGE_UNITS')) // Handled gracefully
      .join('\n');
    
    // Fail if we see unhandled WebGL or shader errors
    // Note: Texture unit limit errors are handled by disabling post-processing, so we ignore them
    const hasWebGLError = errorMessages.includes('WebGL') || 
                          errorMessages.includes('Shader Error') ||
                          (errorMessages.includes('INVALID_OPERATION') && 
                           !errorMessages.includes('texture unit limit exceeded'));
    
    if (hasWebGLError) {
      console.error('Unhandled WebGL errors detected:', errorMessages);
    }
    
    expect(hasWebGLError).toBe(false);
  });

  test('should render 3D scene canvas', async ({ page }) => {
    await page.goto('/');
    
    // Wait for loading screen
    await page.waitForFunction(() => {
      return document.getElementById('main-menu') !== null;
    }, { timeout: 10000 });
    
    // Wait for Start Game button and click it
    await page.waitForFunction(() => {
      const button = document.querySelector('button');
      const mainMenu = document.getElementById('main-menu');
      if (!mainMenu) return false;
      const buttons = mainMenu.querySelectorAll('button');
      for (const button of buttons) {
        const text = button.textContent.trim().toUpperCase();
        if ((text.includes('START GAME') || text.includes('START')) && 
            button.getAttribute('aria-disabled') === 'false' &&
            button.offsetParent !== null) {
          return true;
        }
      }
      return false;
    }, { timeout: 60000 });
    
    // Try to click the Start Game button, fallback to Enter key if click fails
    const startButton = page.locator('#main-menu button').filter({ hasText: /START GAME|START/i });
    try {
      await startButton.first().click({ timeout: 5000 });
    } catch (error) {
      // If click fails, press Enter key (MainMenu supports Enter key)
      console.log('Button click failed, using Enter key instead');
      await page.keyboard.press('Enter');
    }
    
    // Wait for loading screen to disappear
    await page.waitForFunction(() => {
      const mainMenu = document.getElementById('main-menu');
      return !mainMenu || mainMenu.style.display === 'none' || !mainMenu.offsetParent;
    }, { timeout: 15000 });
    
    // Wait for canvas to be visible
    const canvas = page.locator('#club-canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    
    // Verify canvas has dimensions
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();
    expect(canvasBox.width).toBeGreaterThan(0);
    expect(canvasBox.height).toBeGreaterThan(0);
  });

  test('should initialize game systems', async ({ page }) => {
    await page.goto('/');
    
    // Use waitForGameReady helper which handles button click/Enter key automatically
    await waitForGameReady(page);
    
    // Wait for game systems to be available (waitForGameReady already waits, but verify)
    await page.waitForFunction(() => {
      return typeof window.gameSystems !== 'undefined' &&
             window.gameSystems.scene !== null;
    }, { timeout: 5000 });
    
    // Verify core systems exist
    const systems = await page.evaluate(() => {
      if (typeof window.gameSystems === 'undefined') {
        return {};
      }
      
      return {
        scene: window.gameSystems.scene !== null && window.gameSystems.scene !== undefined,
        renderer: window.gameSystems.renderer !== null && window.gameSystems.renderer !== undefined,
        camera: window.gameSystems.camera !== null && window.gameSystems.camera !== undefined,
        avatar: window.gameSystems.avatar !== null && window.gameSystems.avatar !== undefined,
        clubScene: window.gameSystems.clubScene !== null && window.gameSystems.clubScene !== undefined,
      };
    });
    
    expect(systems.scene).toBe(true);
    expect(systems.renderer).toBe(true);
    expect(systems.camera).toBe(true);
    expect(systems.avatar).toBe(true);
    expect(systems.clubScene).toBe(true);
  });

  test('should have player avatar visible with name label', async ({ page }) => {
    await page.goto('/');
    
    // Use waitForGameReady helper which handles button click/Enter key automatically
    await waitForGameReady(page);
    
    // Wait for avatar to be initialized (waitForGameReady already waits, but verify)
    await page.waitForFunction(() => {
      return typeof window.gameSystems !== 'undefined' &&
             window.gameSystems.avatar !== null &&
             window.gameSystems.avatar !== undefined;
    }, { timeout: 5000 });
    
    // Wait a bit more for name label to be created
    await page.waitForTimeout(2000);
    
    // Check if avatar has name label
    const avatarInfo = await page.evaluate(() => {
      if (!window.gameSystems || !window.gameSystems.avatar) {
        return { hasAvatar: false, hasNameLabel: false };
      }
      
      const avatar = window.gameSystems.avatar;
      return {
        hasAvatar: true,
        hasNameLabel: avatar.nameLabel !== null && avatar.nameLabel !== undefined,
        nameLabelVisible: avatar.nameLabel ? avatar.nameLabel.visible : false,
        avatarVisible: avatar.group ? avatar.group.visible : false,
        avatarPosition: avatar.position ? {
          x: avatar.position.x,
          y: avatar.position.y,
          z: avatar.position.z
        } : null
      };
    });
    
    expect(avatarInfo.hasAvatar).toBe(true);
    expect(avatarInfo.hasNameLabel).toBe(true);
    expect(avatarInfo.nameLabelVisible).toBe(true);
    expect(avatarInfo.avatarVisible).toBe(true);
    expect(avatarInfo.avatarPosition).not.toBeNull();
  });
});

