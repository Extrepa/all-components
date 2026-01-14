/**
 * Test Debugging Utilities
 * 
 * Helper functions for debugging Playwright tests
 */

/**
 * Take a screenshot with timestamp
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} name - Screenshot name
 */
export async function debugScreenshot(page, name = 'debug') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ 
    path: `test-results/debug-${name}-${timestamp}.png`,
    fullPage: true 
  });
}

/**
 * Log page console messages
 * @param {import('@playwright/test').Page} page - Playwright page
 */
export function logConsoleMessages(page) {
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[${type.toUpperCase()}] ${text}`);
  });
}

/**
 * Wait for element with detailed logging
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} selector - CSS selector
 * @param {number} timeout - Timeout in ms
 */
export async function waitForElementWithLog(page, selector, timeout = 10000) {
  console.log(`Waiting for element: ${selector}`);
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout });
    console.log(`✓ Element found: ${selector}`);
    return true;
  } catch (error) {
    console.error(`✗ Element not found: ${selector}`);
    // Take screenshot for debugging
    await debugScreenshot(page, `missing-${selector.replace(/[^a-zA-Z0-9]/g, '-')}`);
    throw error;
  }
}

/**
 * Check if game is initialized
 * @param {import('@playwright/test').Page} page - Playwright page
 */
export async function checkGameInitialized(page) {
  return await page.evaluate(() => {
    return {
      hasGameSystems: typeof window.gameSystems !== 'undefined',
      hasScene: window.gameSystems?.scene !== null,
      hasRenderer: window.gameSystems?.renderer !== null,
      hasCamera: window.gameSystems?.camera !== null,
      hasAvatar: window.gameSystems?.avatar !== null,
      hasClubScene: window.gameSystems?.clubScene !== null,
    };
  });
}

/**
 * Get all visible elements matching selector
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} selector - CSS selector
 */
export async function getVisibleElements(page, selector) {
  return await page.evaluate((sel) => {
    const elements = Array.from(document.querySelectorAll(sel));
    return elements
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      })
      .map(el => ({
        tagName: el.tagName,
        id: el.id,
        className: el.className,
        textContent: el.textContent?.substring(0, 50),
      }));
  }, selector);
}

