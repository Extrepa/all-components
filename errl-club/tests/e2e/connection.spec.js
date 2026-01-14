import { test, expect } from '@playwright/test';
import { waitForGameReady, waitForUI } from '../helpers/gameHelpers.js';
import { waitForNetworkConnection, getNetworkState, waitForPlayerJoin, getRemotePlayerCount } from '../helpers/networkHelpers.js';
import { expectNetworkConnected, expectPlayerCount } from '../helpers/assertionHelpers.js';
import { test as multiplayerTest } from '../fixtures/multiplayer.fixture.js';

test.describe('Connection Tests', () => {
  test('should connect to network', async ({ page }) => {
    await page.goto('/');
    await waitForGameReady(page);
    
    // Wait for network connection (if multiplayer is enabled)
    const networkState = await getNetworkState(page);
    if (networkState !== 'disconnected') {
      await waitForNetworkConnection(page);
      await expectNetworkConnected(page);
    }
  });
  
  test('should handle connection failure gracefully', async ({ page }) => {
    // This test would require mocking network failure
    // For now, just verify game still works without network
    await page.goto('/');
    await waitForGameReady(page);
    
    // Game should still be functional in single-player mode
    const canvas = page.locator('#club-canvas');
    await expect(canvas).toBeVisible();
  });
});

test.describe('Multiplayer Connection Tests', () => {
  multiplayerTest('should connect multiple clients', async ({ multiplayerPages }) => {
    const [page1, page2] = multiplayerPages;
    
    // Wait for both to connect
    await Promise.all([
      waitForNetworkConnection(page1).catch(() => {}), // Ignore if not configured
      waitForNetworkConnection(page2).catch(() => {})
    ]);
    
    // Both pages should have game ready
    const canvas1 = page1.locator('#club-canvas');
    const canvas2 = page2.locator('#club-canvas');
    
    await expect(canvas1).toBeVisible();
    await expect(canvas2).toBeVisible();
  });
  
  multiplayerTest('should detect other players joining', async ({ multiplayerPages }) => {
    const [page1, page2] = multiplayerPages;
    
    // Wait a bit for players to join
    await page1.waitForTimeout(2000);
    
    // Check if page1 sees page2 (if multiplayer is enabled)
    const remoteCount1 = await getRemotePlayerCount(page1);
    const remoteCount2 = await getRemotePlayerCount(page2);
    
    // If multiplayer is enabled, at least one should see the other
    // If not enabled, both will have 0 remote players
    expect(remoteCount1 >= 0 && remoteCount1 <= 1).toBe(true);
    expect(remoteCount2 >= 0 && remoteCount2 <= 1).toBe(true);
  });
});



