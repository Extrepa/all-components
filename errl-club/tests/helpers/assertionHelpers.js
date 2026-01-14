/**
 * Custom assertion helpers for Playwright tests
 * Provides game-specific assertions
 */

import { expect } from '@playwright/test';

/**
 * Assert avatar is at position (with tolerance)
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {Object} expectedPosition - Expected position {x, y, z}
 * @param {number} tolerance - Position tolerance (default: 0.5)
 */
export async function expectAvatarPosition(page, expectedPosition, tolerance = 0.5) {
  const actualPosition = await page.evaluate(() => {
    if (window.avatar && window.avatar.position) {
      const pos = window.avatar.position;
      return { x: pos.x, y: pos.y, z: pos.z };
    }
    return null;
  });
  
  expect(actualPosition).not.toBeNull();
  expect(Math.abs(actualPosition.x - expectedPosition.x)).toBeLessThan(tolerance);
  expect(Math.abs(actualPosition.y - expectedPosition.y)).toBeLessThan(tolerance);
  expect(Math.abs(actualPosition.z - expectedPosition.z)).toBeLessThan(tolerance);
}

/**
 * Assert avatar state
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} expectedState - Expected state
 */
export async function expectAvatarState(page, expectedState) {
  const actualState = await page.evaluate(() => {
    if (window.avatar && window.avatar.currentState) {
      return window.avatar.currentState;
    }
    return null;
  });
  
  expect(actualState).toBe(expectedState);
}

/**
 * Assert network is connected
 * @param {import('@playwright/test').Page} page - Playwright page
 */
export async function expectNetworkConnected(page) {
  const isConnected = await page.evaluate(() => {
    if (window.networkClient) {
      return window.networkClient.state === 'connected';
    }
    if (window.multiplayerManager && window.multiplayerManager.networkClient) {
      return window.multiplayerManager.networkClient.state === 'connected';
    }
    return false;
  });
  
  expect(isConnected).toBe(true);
}

/**
 * Assert player count
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {number} expectedCount - Expected player count
 */
export async function expectPlayerCount(page, expectedCount) {
  const actualCount = await page.evaluate(() => {
    if (window.multiplayerManager && window.multiplayerManager.playerManager) {
      return window.multiplayerManager.playerManager.remotePlayers.size + 1; // +1 for local
    }
    return 1;
  });
  
  expect(actualCount).toBe(expectedCount);
}

/**
 * Assert chat message appears
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} message - Expected message text
 */
export async function expectChatMessage(page, message) {
  const messages = await page.evaluate(() => {
    const chatContainer = document.querySelector('#chat-messages, .chat-messages');
    if (!chatContainer) return [];
    return Array.from(chatContainer.querySelectorAll('.chat-message, .message')).map(
      el => el.textContent.trim()
    );
  });
  
  expect(messages.some(msg => msg.includes(message))).toBe(true);
}

/**
 * Assert nameplate exists for player
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} playerId - Player ID
 */
export async function expectNameplate(page, playerId) {
  const hasNameplate = await page.evaluate((pid) => {
    const nameplates = document.querySelectorAll('.nameplate, [data-player-id]');
    for (const nameplate of nameplates) {
      if (nameplate.getAttribute('data-player-id') === pid) {
        return true;
      }
    }
    return false;
  }, playerId);
  
  expect(hasNameplate).toBe(true);
}

/**
 * Assert UI element is visible
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} selector - CSS selector
 */
export async function expectUIVisible(page, selector) {
  const element = page.locator(selector);
  await expect(element).toBeVisible();
}

/**
 * Assert UI element contains text
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} selector - CSS selector
 * @param {string} text - Expected text
 */
export async function expectUIText(page, selector, text) {
  const element = page.locator(selector);
  await expect(element).toContainText(text);
}



