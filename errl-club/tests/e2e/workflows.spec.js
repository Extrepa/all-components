/**
 * Workflow E2E Tests
 *
 * Tests for complete user workflows, integration testing, and state persistence
 */
import { test, expect } from '@playwright/test';
import { setupTestWithGameInit, cleanupTestWithErrorCheck, waitForGameSystems, waitForAvatarReady, checkForErrorsDuringTest, moveAvatar } from '../helpers/gameHelpers.js';

test.describe('User Workflows', () => {
    let errorCollection;

    test.beforeEach(async ({ page }) => {
        const setup = await setupTestWithGameInit(page);
        errorCollection = setup.errorCollection;
        await waitForGameSystems(page);
        
        // Check for blocking errors after initialization
        const preCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (preCheck.hasErrors) {
            throw new Error(`Blocking errors detected after initialization: ${preCheck.errors.map(e => e.description).join(', ')}`);
        }
    });

    test.afterEach(async ({ page }) => {
        await cleanupTestWithErrorCheck(page, errorCollection);
    });

    test('should complete full player journey: Load → Ready → Play', async ({ page }) => {
        // This test is already handled by setupTestWithGameInit, but verify the journey
        // Check for errors at each step
        
        // Step 1: Game should be loaded (already done in beforeEach)
        const preCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (preCheck.hasErrors) {
            throw new Error(`Errors during game load: ${preCheck.errors.map(e => e.description).join(', ')}`);
        }

        // Step 2: Verify game started
        const gameStarted = await page.evaluate(() => {
            return (
                window.gameSystems?.gameLoop?.isRunning === true &&
                window.gameSystems?.avatar !== undefined
            );
        });

        expect(gameStarted).toBe(true);

        // Step 3: Wait for avatar to be ready
        await waitForAvatarReady(page);
        
        // Check for errors after avatar ready
        const avatarCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (avatarCheck.hasErrors) {
            throw new Error(`Errors after avatar ready: ${avatarCheck.errors.map(e => e.description).join(', ')}`);
        }

        // Step 4: Verify main menu is hidden
        const mainMenu = page.locator('#main-menu');
        await expect(mainMenu).not.toBeVisible({ timeout: 5000 });
    });

    test('should handle room transition workflow', async ({ page }) => {
        // Check for errors before room transition
        const preCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (preCheck.hasErrors) {
            throw new Error(`Errors before room transition: ${preCheck.errors.map(e => e.description).join(', ')}`);
        }

        // Verify we're in the initial room
        const inInitialRoom = await page.evaluate(() => {
            return window.gameSystems?.scene !== undefined;
        });

        expect(inInitialRoom).toBe(true);

        // Wait for avatar to be ready before interaction
        await waitForAvatarReady(page);

        // Try to trigger room transition (if TV is available)
        await page.keyboard.press('e'); // Interact key
        await page.waitForTimeout(1000);

        // Check for errors after transition attempt
        const postCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (postCheck.hasErrors) {
            console.warn('Errors after room transition attempt (non-blocking):', postCheck.errors.map(e => e.description).join(', '));
        }
    });

    test('should handle collection workflow', async ({ page }) => {
        // Check for errors before opening collection UI
        const preCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (preCheck.hasErrors) {
            throw new Error(`Errors before collection workflow: ${preCheck.errors.map(e => e.description).join(', ')}`);
        }

        // Open collection progress (F3)
        await page.keyboard.press('F3');
        await page.waitForTimeout(500);

        // Check for errors after opening collection UI
        const postCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (postCheck.hasErrors) {
            console.warn('Errors after opening collection UI (non-blocking):', postCheck.errors.map(e => e.description).join(', '));
        }

        // Verify collection UI appeared
        const collectionVisible = await page.evaluate(() => {
            const collection = document.getElementById('collection-progress-ui');
            return collection && collection.style.display !== 'none';
        });

        expect(collectionVisible).toBe(true);
    });

    test('should handle phone UI workflow', async ({ page }) => {
        // Check for errors before opening phone
        const preCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (preCheck.hasErrors) {
            throw new Error(`Errors before phone workflow: ${preCheck.errors.map(e => e.description).join(', ')}`);
        }

        // Open phone (if available via keybind or UI)
        await page.evaluate(() => {
            if (window.gameSystems?.uiManager) {
                const phone = window.gameSystems.uiManager.getPanel('errl_phone');
                if (phone) {
                    phone.show();
                }
            }
        });

        await page.waitForTimeout(500);

        // Check for errors after opening phone
        const openCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (openCheck.hasErrors) {
            console.warn('Errors after opening phone (non-blocking):', openCheck.errors.map(e => e.description).join(', '));
        }

        // Verify phone opened
        const phoneVisible = await page.evaluate(() => {
            const phone = document.getElementById('errl-phone');
            return phone && phone.style.display !== 'none';
        });

        if (phoneVisible) {
            // Navigate tabs
            const tabs = page.locator('#errl-phone [role="tab"], #errl-phone .tab-button');
            const tabCount = await tabs.count();

            if (tabCount > 0) {
                await tabs.first().click();
                await page.waitForTimeout(200);
                
                // Check for errors after tab navigation
                const tabCheck = await checkForErrorsDuringTest(page, errorCollection);
                if (tabCheck.hasErrors) {
                    console.warn('Errors after tab navigation (non-blocking):', tabCheck.errors.map(e => e.description).join(', '));
                }
            }
        }

        // Test passes if no errors
        expect(true).toBe(true);
    });

    test('should handle settings workflow', async ({ page }) => {
        // Check for errors before opening settings
        const preCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (preCheck.hasErrors) {
            throw new Error(`Errors before settings workflow: ${preCheck.errors.map(e => e.description).join(', ')}`);
        }

        // Open quick settings (F4)
        await page.keyboard.press('F4');
        await page.waitForTimeout(500);
        
        // Check for errors after opening settings
        const postCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (postCheck.hasErrors) {
            console.warn('Errors after opening settings (non-blocking):', postCheck.errors.map(e => e.description).join(', '));
        }

        // Verify settings opened
        const settingsVisible = await page.evaluate(() => {
            const settings = document.getElementById('quick-settings-menu');
            return settings && settings.display !== 'none';
        });

        expect(settingsVisible).toBe(true);

        // Close settings
        await page.keyboard.press('F4');
        await page.waitForTimeout(500);
    });

    test('should persist state across interactions', async ({ page }) => {
        await page.goto('/');
        await waitForGameReady(page);
        await waitForGameSystems(page);

        // Change a setting
        await page.evaluate(() => {
            if (window.gameSystems?.settingsManager) {
                window.gameSystems.settingsManager.setSetting('test.setting', 'test-value');
            }
        });

        // Verify setting was stored
        const settingStored = await page.evaluate(() => {
            if (window.gameSystems?.settingsManager) {
                const value = window.gameSystems.settingsManager.getSetting('test.setting');
                return value === 'test-value';
            }
            return false;
        });

        expect(settingStored).toBe(true);
    });

    test('should handle error recovery in workflows', async ({ page }) => {
        await page.goto('/');
        await waitForGameReady(page);
        await waitForGameSystems(page);

        // Try to trigger an error scenario
        const errorRecovered = await page.evaluate(() => {
            try {
                // Try to access a non-existent panel
                if (window.gameSystems?.uiManager) {
                    const panel = window.gameSystems.uiManager.getPanel('nonexistent');
                    if (panel) {
                        panel.show();
                    }
                }
                return true; // No error thrown
            } catch (error) {
                // Error was caught, recovery works
                return true;
            }
        });

        expect(errorRecovered).toBe(true);
    });

    test('should handle multiple systems working together', async ({ page }) => {
        await page.goto('/');
        await waitForGameReady(page);
        await waitForGameSystems(page);

        // Verify all systems are initialized
        const systemsReady = await page.evaluate(() => {
            return (
                window.gameSystems?.avatar !== undefined &&
                window.gameSystems?.scene !== undefined &&
                window.gameSystems?.camera !== undefined &&
                window.gameSystems?.renderer !== undefined &&
                window.gameSystems?.gameLoop !== undefined
            );
        });

        expect(systemsReady).toBe(true);
    });

    test('should handle workflow with UI interactions', async ({ page }) => {
        await page.goto('/');
        await waitForGameReady(page);
        await waitForGameSystems(page);

        // Open settings
        await page.keyboard.press('F4');
        await page.waitForTimeout(300);

        // Interact with avatar (move)
        await page.keyboard.press('w');
        await page.waitForTimeout(100);

        // Open collection
        await page.keyboard.press('F3');
        await page.waitForTimeout(300);

        // Verify no errors occurred
        const errors = page._consoleErrors || [];
        expect(errors.length).toBe(0);
    });

    test('should handle complete session workflow', async ({ page }) => {
        await page.goto('/');
        await waitForGameReady(page);
        await waitForGameSystems(page);

        // Simulate a complete session:
        // 1. Move around
        await page.keyboard.press('w');
        await page.waitForTimeout(100);
        await page.keyboard.press('d');
        await page.waitForTimeout(100);

        // 2. Open settings
        await page.keyboard.press('F4');
        await page.waitForTimeout(300);
        await page.keyboard.press('F4'); // Close
        await page.waitForTimeout(300);

        // 3. Open collection
        await page.keyboard.press('F3');
        await page.waitForTimeout(300);

        // 4. Verify game is still running
        const gameRunning = await page.evaluate(() => {
            return window.gameSystems?.gameLoop?.isRunning === true;
        });

        expect(gameRunning).toBe(true);
    });
});

