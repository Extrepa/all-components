/**
 * Network testing helpers for Playwright
 * Provides utilities for testing network functionality
 */

/**
 * Wait for network connection
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {number} timeout - Timeout in ms
 */
export async function waitForNetworkConnection(page, timeout = 10000) {
  await page.waitForFunction(
    () => {
      if (window.networkClient) {
        return window.networkClient.state === 'connected';
      }
      if (window.multiplayerManager && window.multiplayerManager.networkClient) {
        return window.multiplayerManager.networkClient.state === 'connected';
      }
      return false;
    },
    { timeout }
  );
}

/**
 * Check if network is connected
 * @param {import('@playwright/test').Page} page - Playwright page
 * @returns {Promise<boolean>} True if connected
 */
export async function isNetworkConnected(page) {
  return await page.evaluate(() => {
    if (window.networkClient) {
      return window.networkClient.state === 'connected';
    }
    if (window.multiplayerManager && window.multiplayerManager.networkClient) {
      return window.multiplayerManager.networkClient.state === 'connected';
    }
    return false;
  });
}

/**
 * Get network state
 * @param {import('@playwright/test').Page} page - Playwright page
 * @returns {Promise<string>} Network state ('disconnected', 'connecting', 'connected', 'error')
 */
export async function getNetworkState(page) {
  return await page.evaluate(() => {
    if (window.networkClient) {
      return window.networkClient.state;
    }
    if (window.multiplayerManager && window.multiplayerManager.networkClient) {
      return window.multiplayerManager.networkClient.state;
    }
    return 'disconnected';
  });
}

/**
 * Wait for player join event
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} playerId - Player ID to wait for (optional)
 * @param {number} timeout - Timeout in ms
 */
export async function waitForPlayerJoin(page, playerId = null, timeout = 10000) {
  await page.waitForFunction(
    ({ pid }) => {
      if (window.multiplayerManager && window.multiplayerManager.playerManager) {
        const remotePlayers = window.multiplayerManager.playerManager.remotePlayers;
        if (pid) {
          return remotePlayers.has(pid);
        }
        return remotePlayers.size > 0;
      }
      return false;
    },
    { pid: playerId },
    { timeout }
  );
}

/**
 * Wait for player leave event
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} playerId - Player ID that should leave
 * @param {number} timeout - Timeout in ms
 */
export async function waitForPlayerLeave(page, playerId, timeout = 10000) {
  await page.waitForFunction(
    ({ pid }) => {
      if (window.multiplayerManager && window.multiplayerManager.playerManager) {
        const remotePlayers = window.multiplayerManager.playerManager.remotePlayers;
        return !remotePlayers.has(pid);
      }
      return true;
    },
    { pid: playerId },
    { timeout }
  );
}

/**
 * Get remote player count
 * @param {import('@playwright/test').Page} page - Playwright page
 * @returns {Promise<number>} Number of remote players
 */
export async function getRemotePlayerCount(page) {
  return await page.evaluate(() => {
    if (window.multiplayerManager && window.multiplayerManager.playerManager) {
      return window.multiplayerManager.playerManager.remotePlayers.size;
    }
    return 0;
  });
}

/**
 * Get all player IDs (local + remote)
 * @param {import('@playwright/test').Page} page - Playwright page
 * @returns {Promise<Array<string>>} Array of player IDs
 */
export async function getAllPlayerIds(page) {
  return await page.evaluate(() => {
    const playerIds = [];
    
    // Get local player ID
    if (window.multiplayerManager && window.multiplayerManager.localPlayerId) {
      playerIds.push(window.multiplayerManager.localPlayerId);
    }
    
    // Get remote player IDs
    if (window.multiplayerManager && window.multiplayerManager.playerManager) {
      const remotePlayers = window.multiplayerManager.playerManager.remotePlayers;
      remotePlayers.forEach((player, id) => {
        if (!playerIds.includes(id)) {
          playerIds.push(id);
        }
      });
    }
    
    return playerIds;
  });
}

/**
 * Wait for state synchronization
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} playerId - Player ID to check
 * @param {Object} expectedState - Expected state properties
 * @param {number} timeout - Timeout in ms
 */
export async function waitForStateSync(page, playerId, expectedState, timeout = 5000) {
  await page.waitForFunction(
    ({ pid, state }) => {
      if (window.multiplayerManager && window.multiplayerManager.playerManager) {
        const remotePlayer = window.multiplayerManager.playerManager.remotePlayers.get(pid);
        if (!remotePlayer) return false;
        
        const currentState = remotePlayer.currentState;
        if (!currentState) return false;
        
        // Check each property in expectedState
        for (const key in state) {
          if (key === 'position') {
            const pos = currentState.position;
            const expectedPos = state.position;
            const dx = Math.abs(pos.x - expectedPos.x);
            const dy = Math.abs(pos.y - expectedPos.y);
            const dz = Math.abs(pos.z - expectedPos.z);
            if (dx > 0.5 || dy > 0.5 || dz > 0.5) return false;
          } else if (currentState[key] !== state[key]) {
            return false;
          }
        }
        return true;
      }
      return false;
    },
    { pid: playerId, state: expectedState },
    { timeout }
  );
}

/**
 * Monitor network messages
 * @param {import('@playwright/test').Page} page - Playwright page
 * @returns {Promise<Array>} Array of network messages
 */
export async function getNetworkMessages(page) {
  return await page.evaluate(() => {
    if (window.networkMessages) {
      return window.networkMessages;
    }
    return [];
  });
}

/**
 * Clear network message log
 * @param {import('@playwright/test').Page} page - Playwright page
 */
export async function clearNetworkMessages(page) {
  await page.evaluate(() => {
    if (window.networkMessages) {
      window.networkMessages = [];
    }
  });
}



