/**
 * Multiplayer test helpers for Playwright
 * Provides utilities for testing multiplayer scenarios with multiple browser contexts
 */

/**
 * Create multiple browser contexts for multiplayer testing
 * @param {import('@playwright/test').Browser} browser - Playwright browser
 * @param {number} count - Number of contexts to create
 * @returns {Promise<Array<import('@playwright/test').BrowserContext>>} Array of contexts
 */
export async function createMultiplayerContexts(browser, count = 2) {
  const contexts = [];
  for (let i = 0; i < count; i++) {
    const context = await browser.newContext();
    contexts.push(context);
  }
  return contexts;
}

/**
 * Create pages from contexts
 * @param {Array<import('@playwright/test').BrowserContext>} contexts - Browser contexts
 * @returns {Promise<Array<import('@playwright/test').Page>>} Array of pages
 */
export async function createPagesFromContexts(contexts) {
  const pages = [];
  for (const context of contexts) {
    const page = await context.newPage();
    pages.push(page);
  }
  return pages;
}

/**
 * Navigate all pages to game
 * @param {Array<import('@playwright/test').Page>} pages - Pages to navigate
 * @param {string} url - URL to navigate to (default: '/')
 */
export async function navigateAllPages(pages, url = '/') {
  await Promise.all(pages.map(page => page.goto(url)));
}

/**
 * Wait for all pages to be ready
 * @param {Array<import('@playwright/test').Page>} pages - Pages to wait for
 */
export async function waitForAllPagesReady(pages) {
  const { waitForGameReady } = await import('./gameHelpers.js');
  await Promise.all(pages.map(page => waitForGameReady(page)));
}

/**
 * Get player IDs from all pages
 * @param {Array<import('@playwright/test').Page>} pages - Pages
 * @returns {Promise<Array<string>>} Array of player IDs
 */
export async function getPlayerIds(pages) {
  const playerIds = await Promise.all(
    pages.map(page =>
      page.evaluate(() => {
        if (window.multiplayerManager && window.multiplayerManager.localPlayerId) {
          return window.multiplayerManager.localPlayerId;
        }
        if (window.localPlayerId) {
          return window.localPlayerId;
        }
        return null;
      })
    )
  );
  return playerIds.filter(id => id !== null);
}

/**
 * Wait for players to join
 * @param {Array<import('@playwright/test').Page>} pages - Pages
 * @param {number} expectedCount - Expected number of players
 * @param {number} timeout - Timeout in ms
 */
export async function waitForPlayersToJoin(pages, expectedCount, timeout = 10000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const playerCounts = await Promise.all(
      pages.map(page =>
        page.evaluate(() => {
          if (window.multiplayerManager && window.multiplayerManager.playerManager) {
            return window.multiplayerManager.playerManager.remotePlayers.size + 1; // +1 for local
          }
          return 1;
        })
      )
    );
    
    // Check if any page sees the expected count
    if (playerCounts.some(count => count >= expectedCount)) {
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Timeout waiting for ${expectedCount} players to join`);
}

/**
 * Check if players are synchronized (positions are close)
 * @param {Array<import('@playwright/test').Page>} pages - Pages
 * @param {number} tolerance - Position tolerance (default: 1.0)
 * @returns {Promise<boolean>} True if players are synchronized
 */
export async function arePlayersSynchronized(pages, tolerance = 1.0) {
  const positions = await Promise.all(
    pages.map(page =>
      page.evaluate(() => {
        if (window.avatar && window.avatar.position) {
          const pos = window.avatar.position;
          return { x: pos.x, y: pos.y, z: pos.z };
        }
        return null;
      })
    )
  );
  
  // Filter out null positions
  const validPositions = positions.filter(p => p !== null);
  if (validPositions.length < 2) return false;
  
  // Check if all positions are within tolerance
  const firstPos = validPositions[0];
  for (let i = 1; i < validPositions.length; i++) {
    const pos = validPositions[i];
    const dx = Math.abs(pos.x - firstPos.x);
    const dy = Math.abs(pos.y - firstPos.y);
    const dz = Math.abs(pos.z - firstPos.z);
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (distance > tolerance) {
      return false;
    }
  }
  
  return true;
}

/**
 * Send message from one page and verify it appears on others
 * @param {import('@playwright/test').Page} senderPage - Page sending message
 * @param {Array<import('@playwright/test').Page>} receiverPages - Pages that should receive message
 * @param {string} message - Message to send
 * @param {number} timeout - Timeout in ms
 */
export async function testChatMessage(senderPage, receiverPages, message, timeout = 5000) {
  const { typeChatMessage } = await import('./gameHelpers.js');
  
  // Send message
  await typeChatMessage(senderPage, message);
  
  // Wait for message to appear on receiver pages
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const { getChatMessages } = await import('./gameHelpers.js');
    const allReceived = await Promise.all(
      receiverPages.map(async page => {
        const messages = await getChatMessages(page);
        return messages.some(msg => msg.includes(message));
      })
    );
    
    if (allReceived.every(received => received)) {
      return true;
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return false;
}

/**
 * Clean up multiplayer contexts
 * @param {Array<import('@playwright/test').BrowserContext>} contexts - Contexts to close
 */
export async function cleanupMultiplayerContexts(contexts) {
  await Promise.all(contexts.map(context => context.close()));
}



