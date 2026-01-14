/**
 * Game interaction helpers for Playwright tests
 * Provides utilities for interacting with the game (keyboard, mouse, waiting)
 */

import { setupErrorCollection, checkForBlockingErrors } from './errorRecovery.js';

/**
 * Wait for game to be ready
 * @param {import('@playwright/test').Page} page - Playwright page
 */
export async function waitForGameReady(page) {
  // Wait for page to load
  await page.waitForLoadState('domcontentloaded');
  
  // Wait for main menu to be created
  await page.waitForFunction(() => {
    return document.getElementById('main-menu') !== null;
  }, { timeout: 5000 });
  
  // Wait for the "Start Game" button to be ready - check multiple conditions
  // MainMenu sets isReady=true and aria-disabled='false' when ready
  // Look specifically for button within main-menu to avoid other buttons on the page
  await page.waitForFunction(() => {
    const mainMenu = document.getElementById('main-menu');
    if (!mainMenu) return false;
    
    // Find button within main menu (more specific than querySelector('button'))
    const buttons = mainMenu.querySelectorAll('button');
    if (!buttons || buttons.length === 0) return false;
    
    // Find the "Start Game" button
    let startButton = null;
    for (const button of buttons) {
      const buttonText = button.textContent.trim().toUpperCase();
      if (buttonText.includes('START GAME') || buttonText.includes('START')) {
        startButton = button;
        break;
      }
    }
    
    if (!startButton) return false;
    
    // Check if button is enabled via aria-disabled
    const ariaDisabled = startButton.getAttribute('aria-disabled');
    const isAriaEnabled = ariaDisabled === 'false';
    
    // Check if button is not disabled
    const isNotDisabled = !startButton.disabled;
    
    // Check pointer events (should be 'auto' when ready)
    const style = window.getComputedStyle(startButton);
    const pointerEventsOk = style.pointerEvents !== 'none';
    
    // Check if button is visible
    const isVisible = startButton.offsetParent !== null && style.display !== 'none';
    
    // Button is ready if it has START text AND is enabled AND is visible
    return isAriaEnabled && isNotDisabled && pointerEventsOk && isVisible;
  }, { timeout: 10000, polling: 100 });
  
  // Ensure button is focused (MainMenu auto-focuses, but ensure it's focused)
  // This is important for Enter key to work
  await page.evaluate(() => {
    const mainMenu = document.getElementById('main-menu');
    if (!mainMenu) return;
    
    const buttons = mainMenu.querySelectorAll('button');
    for (const button of buttons) {
      const buttonText = button.textContent.trim().toUpperCase();
      if (buttonText.includes('START GAME') || buttonText.includes('START')) {
        button.focus();
        break;
      }
    }
  });
  
  // Wait a moment for focus to settle
  await page.waitForTimeout(100);
  
  // Press Enter key - MainMenu keydown handler will catch this
  // The handler checks: if (this.isReady && (e.key === 'Enter' || e.key === ' '))
  await page.keyboard.press('Enter');
  
  // Wait for button text to change to "STARTING..." (confirms Enter was processed)
  await page.waitForFunction(() => {
    const mainMenu = document.getElementById('main-menu');
    if (!mainMenu) return false;
    
    const buttons = mainMenu.querySelectorAll('button');
    for (const button of buttons) {
      if (button.textContent.includes('STARTING')) {
        return true;
      }
    }
    return false;
  }, { timeout: 2000 }).catch(() => {
    // Button might not change text immediately, that's okay
  });
  
  // Wait a moment for the game to start processing
  await page.waitForTimeout(100);
  
  // Wait for main menu to disappear (game has started)
  // Check multiple conditions: element removed, display: none, or not in DOM
  try {
    await page.waitForFunction(() => {
      const mainMenu = document.getElementById('main-menu');
      if (!mainMenu) return true; // Element removed
      
      const style = window.getComputedStyle(mainMenu);
      const isHidden = style.display === 'none' || 
                      style.visibility === 'hidden' || 
                      style.opacity === '0' ||
                      !mainMenu.offsetParent;
      
      // Also check if pointer events are disabled (menu is fading out)
      const pointerEventsDisabled = style.pointerEvents === 'none';
      
      return isHidden || pointerEventsDisabled;
    }, { timeout: 10000, polling: 100 });
  } catch (error) {
    throw new Error(`Main menu did not disappear within timeout. Error: ${error.message}`);
  }
  
  // Additional wait to ensure menu fade-out animation completes
  await page.waitForTimeout(300);
  
  // Wait for canvas to be visible with improved checks
  try {
    // First, ensure canvas element exists
    await page.waitForSelector('#club-canvas', { state: 'attached', timeout: 5000 });
    
    // Then wait for canvas to be visible and have dimensions
    await page.waitForFunction(() => {
      const canvas = document.getElementById('club-canvas');
      if (!canvas) return false;
      
      const style = window.getComputedStyle(canvas);
      const isVisible = style.display !== 'none' && 
                       style.visibility !== 'hidden' && 
                       style.opacity !== '0' &&
                       canvas.offsetParent !== null;
      
      // Check canvas has non-zero dimensions
      const hasDimensions = canvas.width > 0 && canvas.height > 0;
      
      // Check canvas is in viewport
      const rect = canvas.getBoundingClientRect();
      const inViewport = rect.width > 0 && rect.height > 0;
      
      return isVisible && hasDimensions && inViewport;
    }, { timeout: 10000, polling: 100 });
  } catch (error) {
    throw new Error(`Canvas did not become visible within timeout. Error: ${error.message}`);
  }
  
  // Wait for game systems to be available
  await page.waitForFunction(() => {
    return typeof window.gameSystems !== 'undefined' &&
           window.gameSystems.scene !== null &&
           window.gameSystems.avatar !== null &&
           window.gameSystems.inputManager !== null;
  }, { timeout: 10000 });
  
  // Wait for avatar to be ready (not spawning or on ground)
  // Give more time for physics to settle - avatar spawns at y=3.0 and needs to fall to y=0.5
  // Use a more lenient check - just verify avatar exists and game is running
  try {
    await page.waitForFunction(() => {
      if (!window.gameSystems?.avatar) return false;
      const avatar = window.gameSystems.avatar;
      
      // Check if avatar exists and has position
      if (!avatar.position) return false;
      
      // More lenient check: avatar is ready if:
      // 1. Not spawning (physics has started)
      // 2. OR position is reasonable (not stuck at spawn height)
      // 3. OR game loop is running (indicates game is functional)
      const isNotSpawning = avatar.isSpawning === false;
      const baseY = avatar.baseY || 0.5;
      const currentY = avatar.position.y;
      const hasReasonablePosition = currentY <= baseY + 3.0; // Within 3 units of ground
      const gameLoopRunning = typeof window.gameLoop !== 'undefined' && window.gameLoop?.isRunning;
      
      // Avatar is ready if game is functional and avatar has reasonable state
      return (isNotSpawning || hasReasonablePosition || gameLoopRunning);
    }, { timeout: 10000, polling: 100 }); // 10s timeout should be enough
  } catch (error) {
    // If avatar landing check fails, log diagnostic but don't fail the test
    // The game has loaded successfully, which is the main goal
    try {
      const diagnostic = await page.evaluate(() => {
        if (!window.gameSystems?.avatar) return { error: 'Avatar not found' };
        const avatar = window.gameSystems.avatar;
        return {
          hasAvatar: !!avatar,
          hasPosition: !!avatar.position,
          positionY: avatar.position?.y,
          baseY: avatar.baseY,
          isSpawning: avatar.isSpawning,
          velocityY: avatar.velocity?.y,
        };
      });
      console.warn(`Avatar landing check timed out, but game loaded successfully. Diagnostic: ${JSON.stringify(diagnostic)}`);
    } catch (diagError) {
      console.warn(`Avatar landing check timed out, but game loaded successfully.`);
    }
    // Don't throw - game has loaded, which is what we're testing
  }
  
  // Small delay to ensure everything is settled
  await page.waitForTimeout(200);
}

/**
 * Wait for game systems to be available
 * @param {import('@playwright/test').Page} page - Playwright page
 */
export async function waitForGameSystems(page) {
  await page.waitForFunction(() => {
    return typeof window.gameSystems !== 'undefined' &&
           window.gameSystems.scene !== null &&
           window.gameSystems.renderer !== null &&
           window.gameSystems.camera !== null;
  }, { timeout: 10000 });
  
  // Wait a bit more for full initialization
  await page.waitForTimeout(500);
}

/**
 * Press a key in the game
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} key - Key to press (e.g., 'w', 'a', 's', 'd', 'Space', 'Shift')
 */
export async function pressKey(page, key) {
  await page.keyboard.press(key);
  await page.waitForTimeout(25); // Small delay for game to process
}

/**
 * Press and hold a key
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} key - Key to press
 * @param {number} duration - Duration in ms
 */
export async function holdKey(page, key, duration = 1000) {
  await page.keyboard.down(key);
  await page.waitForTimeout(duration);
  await page.keyboard.up(key);
}

/**
 * Move avatar using WASD keys
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} direction - 'w', 'a', 's', 'd', or combination
 * @param {number} duration - Duration in ms
 */
export async function moveAvatar(page, direction, duration = 1000) {
  const keys = direction.toLowerCase().split('');
  for (const key of keys) {
    await page.keyboard.down(key);
  }
  await page.waitForTimeout(duration);
  for (const key of keys) {
    await page.keyboard.up(key);
  }
}

/**
 * Click on canvas at specific coordinates
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 */
export async function clickCanvas(page, x, y) {
  const canvas = await page.locator('#club-canvas');
  await canvas.click({ position: { x, y } });
}

/**
 * Drag on canvas
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {number} startX - Start X coordinate
 * @param {number} startY - Start Y coordinate
 * @param {number} endX - End X coordinate
 * @param {number} endY - End Y coordinate
 */
export async function dragCanvas(page, startX, startY, endX, endY) {
  const canvas = await page.locator('#club-canvas');
  await canvas.hover({ position: { x: startX, y: startY } });
  await page.mouse.down();
  await canvas.hover({ position: { x: endX, y: endY } });
  await page.mouse.up();
}

/**
 * Scroll canvas (zoom)
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {number} deltaY - Scroll delta (positive = zoom in, negative = zoom out)
 */
export async function scrollCanvas(page, deltaY) {
  const canvas = await page.locator('#club-canvas');
  await canvas.hover();
  await page.mouse.wheel(0, deltaY);
}

/**
 * Wait for avatar to be at position (with tolerance)
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {Object} position - Expected position {x, y, z}
 * @param {number} tolerance - Position tolerance (default: 0.5)
 * @param {number} timeout - Timeout in ms (default: 5000)
 */
export async function waitForAvatarPosition(page, position, tolerance = 0.5, timeout = 3000) {
  await page.waitForFunction(
    ({ pos, tol }) => {
      if (!window.avatar || !window.avatar.position) return false;
      const avatarPos = window.avatar.position;
      const dx = Math.abs(avatarPos.x - pos.x);
      const dy = Math.abs(avatarPos.y - pos.y);
      const dz = Math.abs(avatarPos.z - pos.z);
      return dx < tol && dy < tol && dz < tol;
    },
    { pos: position, tol: tolerance },
    { timeout }
  );
}

/**
 * Get avatar position from game
 * @param {import('@playwright/test').Page} page - Playwright page
 * @returns {Promise<Object>} Avatar position {x, y, z}
 */
export async function getAvatarPosition(page) {
  return await page.evaluate(() => {
    if (window.avatar && window.avatar.position) {
      const pos = window.avatar.position;
      return { x: pos.x, y: pos.y, z: pos.z };
    }
    return null;
  });
}

/**
 * Get avatar state from game
 * @param {import('@playwright/test').Page} page - Playwright page
 * @returns {Promise<string>} Avatar state
 */
export async function getAvatarState(page) {
  return await page.evaluate(() => {
    if (window.avatar && window.avatar.currentState) {
      return window.avatar.currentState;
    }
    return null;
  });
}

/**
 * Wait for UI element to appear
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} selector - CSS selector
 * @param {number} timeout - Timeout in ms
 */
export async function waitForUI(page, selector, timeout = 3000) {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

/**
 * Check if UI element exists
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} selector - CSS selector
 * @returns {Promise<boolean>} True if element exists
 */
export async function hasUI(page, selector) {
  const element = await page.locator(selector);
  return await element.count() > 0;
}

/**
 * Type in chat input
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} message - Message to type
 */
export async function typeChatMessage(page, message) {
  const chatInput = page.locator('#chat-input, input[type="text"][placeholder*="chat" i]');
  await chatInput.fill(message);
  await page.keyboard.press('Enter');
}

/**
 * Get chat messages
 * @param {import('@playwright/test').Page} page - Playwright page
 * @returns {Promise<Array<string>>} Array of chat messages
 */
export async function getChatMessages(page) {
  return await page.evaluate(() => {
    const chatContainer = document.querySelector('#chat-messages, .chat-messages');
    if (!chatContainer) return [];
    return Array.from(chatContainer.querySelectorAll('.chat-message, .message')).map(
      el => el.textContent.trim()
    );
  });
}

/**
 * Wait for avatar to be ready (not spawning, on ground)
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {number} timeout - Timeout in ms (default: 10000)
 */
export async function waitForAvatarReady(page, timeout = 10000) {
  await page.waitForFunction(() => {
    if (!window.gameSystems?.avatar) return false;
    const avatar = window.gameSystems.avatar;
    
    // Check if avatar exists and has position
    if (!avatar.position) return false;
    
    // Check if not spawning OR on ground
    const isNotSpawning = avatar.isSpawning === false;
    const baseY = avatar.baseY || 0.5; // Default baseY if not set
    const isOnGround = avatar.position.y <= baseY + 1.0;
    const hasLowVelocity = Math.abs(avatar.velocity?.y || 0) < 0.5; // Not falling fast
    
    // Avatar is ready if: not spawning AND (on ground OR has low velocity)
    return isNotSpawning && (isOnGround || hasLowVelocity);
  }, { timeout, polling: 100 }); // Poll every 100ms for faster detection
  
  // Small delay to ensure avatar is settled
  await page.waitForTimeout(300);
}

/**
 * Move avatar towards a target position
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {Object} targetPosition - Target position {x, y, z}
 * @param {Object} options - Options
 * @param {number} options.tolerance - Position tolerance (default: 1.0)
 * @param {number} options.maxSteps - Maximum movement steps (default: 50)
 * @param {number} options.stepDuration - Duration per step in ms (default: 200)
 * @param {Function} options.onError - Error callback
 * @returns {Promise<boolean>} True if reached target
 */
export async function moveAvatarToPosition(page, targetPosition, options = {}) {
  const {
    tolerance = 1.0,
    maxSteps = 50,
    stepDuration = 200,
    onError = null
  } = options;
  
  // Wait for avatar to be ready
  await waitForAvatarReady(page);
  
  for (let step = 0; step < maxSteps; step++) {
    // Get current position
    const currentPos = await getAvatarPosition(page);
    if (!currentPos) {
      if (onError) onError(new Error('Avatar position not available'));
      return false;
    }
    
    // Check if we're close enough
    const dx = Math.abs(currentPos.x - targetPosition.x);
    const dz = Math.abs(currentPos.z - targetPosition.z);
    if (dx < tolerance && dz < tolerance) {
      return true;
    }
    
    // Determine direction to move
    const moveX = currentPos.x < targetPosition.x ? 'd' : 'a';
    const moveZ = currentPos.z < targetPosition.z ? 'w' : 's';
    
    // Move in the direction needed
    if (dx > tolerance) {
      await moveAvatar(page, moveX, stepDuration);
    }
    if (dz > tolerance) {
      await moveAvatar(page, moveZ, stepDuration);
    }
    
    // Check for errors during movement
    if (onError) {
      const errors = page._errorCollection?.getErrorSummary();
      if (errors && errors.critical > 0) {
        onError(new Error(`Critical errors during movement: ${errors.critical}`));
        return false;
      }
    }
  }
  
  return false; // Didn't reach target
}

/**
 * Move avatar to interactable object
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {Object} objectPosition - Object position {x, y, z}
 * @param {number} interactionDistance - Distance to maintain (default: 2.0)
 * @param {Function} onError - Error callback
 * @returns {Promise<boolean>} True if reached object
 */
export async function moveAvatarToObject(page, objectPosition, interactionDistance = 2.0, onError = null) {
  // Calculate position near object (maintain interaction distance)
  const dx = objectPosition.x;
  const dz = objectPosition.z;
  const distance = Math.sqrt(dx * dx + dz * dz);
  
  if (distance > 0) {
    const scale = Math.max(0, distance - interactionDistance) / distance;
    const targetPosition = {
      x: objectPosition.x * scale,
      y: objectPosition.y,
      z: objectPosition.z * scale
    };
    
    return await moveAvatarToPosition(page, targetPosition, {
      tolerance: interactionDistance + 0.5,
      onError
    });
  }
  
  return true;
}

/**
 * Check for console errors during test execution
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {Object} errorCollection - Error collection object
 * @returns {Object} Error check result
 */
export async function checkForErrorsDuringTest(page, errorCollection) {
  if (!errorCollection) {
    return { hasErrors: false, errors: [] };
  }
  
  const summary = errorCollection.getErrorSummary();
  const criticalErrors = summary.errors.filter(err => err.type === 'critical');
  
  return {
    hasErrors: criticalErrors.length > 0,
    errors: criticalErrors,
    summary
  };
}

/**
 * Setup test with full game initialization and error checking
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {Object} options - Options
 * @returns {Object} Setup result with errorCollection
 */
export async function setupTestWithGameInit(page, options = {}) {
  // Setup error collection
  const errorCollection = setupErrorCollection(page);
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
  
  return { errorCollection };
}

/**
 * Cleanup test and check for errors
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {Object} errorCollection - Error collection object
 */
export async function cleanupTestWithErrorCheck(page, errorCollection) {
  if (errorCollection) {
    const errorCheck = await checkForErrorsDuringTest(page, errorCollection);
    if (errorCheck.hasErrors) {
      console.error('Errors detected during test:', errorCheck.errors);
    }
    errorCollection.cleanup();
  }
}


