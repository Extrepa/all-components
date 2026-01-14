/**
 * Codex Assets Integration Tests
 * Tests for all Codex asset loading, visibility, interactions, and audio-reactive features
 */
import { test, expect } from '@playwright/test';
import { setupTestWithGameInit, cleanupTestWithErrorCheck, waitForUI, waitForAvatarReady, checkForErrorsDuringTest } from '../helpers/gameHelpers.js';

test.describe('Codex Assets Integration', () => {
    let errorCollection;

    test.beforeEach(async ({ page }) => {
        const setup = await setupTestWithGameInit(page);
        errorCollection = setup.errorCollection;
        
        // Wait for assets to load
        await page.waitForTimeout(2000);
        
        // Check for blocking errors after asset loading
        const preCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (preCheck.hasErrors) {
            console.warn('Errors after asset loading (non-blocking):', preCheck.errors.map(e => e.description).join(', '));
        }
    });

    test.afterEach(async ({ page }) => {
        await cleanupTestWithErrorCheck(page, errorCollection);
    });

    test('should load all Codex assets', async ({ page }) => {
        const assetsLoaded = await page.evaluate(() => {
            return window.gameSystems?.codexAssetIntegration?.loadedAssets?.size || 0;
        });
        
        expect(assetsLoaded).toBeGreaterThan(0);
        
        // Check for specific assets
        const assetNames = await page.evaluate(() => {
            const integration = window.gameSystems?.codexAssetIntegration;
            if (!integration || !integration.loadedAssets) return [];
            return Array.from(integration.loadedAssets.keys());
        });
        
        expect(assetNames).toContain('theShroomBar');
        expect(assetNames).toContain('geodesicStation');
        expect(assetNames).toContain('boombox');
        expect(assetNames).toContain('damagedHelmet');
    });

    test('should have assets positioned correctly', async ({ page }) => {
        const positions = await page.evaluate(() => {
            const integration = window.gameSystems?.codexAssetIntegration;
            if (!integration || !integration.loadedAssets) return {};
            
            const positions = {};
            integration.loadedAssets.forEach((asset, name) => {
                if (asset && asset.position) {
                    positions[name] = {
                        x: asset.position.x,
                        y: asset.position.y,
                        z: asset.position.z,
                    };
                }
            });
            return positions;
        });
        
        expect(positions.theShroomBar).toBeDefined();
        expect(positions.geodesicStation).toBeDefined();
        expect(positions.boombox).toBeDefined();
        expect(positions.damagedHelmet).toBeDefined();
    });

    test('should have proximity-based visibility system', async ({ page }) => {
        const hasProximitySystem = await page.evaluate(() => {
            const integration = window.gameSystems?.codexAssetIntegration;
            return integration && typeof integration.updateProximityVisibility === 'function';
        });
        
        expect(hasProximitySystem).toBe(true);
    });

    test('should have LOD system integration', async ({ page }) => {
        const hasLODSystem = await page.evaluate(() => {
            return window.gameSystems?.lodSystem !== undefined;
        });
        
        expect(hasLODSystem).toBe(true);
    });

    test('should have audio-reactive properties on assets', async ({ page }) => {
        const audioReactiveAssets = await page.evaluate(() => {
            const integration = window.gameSystems?.codexAssetIntegration;
            if (!integration || !integration.loadedAssets) return {};
            
            const reactive = {};
            integration.loadedAssets.forEach((asset, name) => {
                if (asset && asset.userData) {
                    reactive[name] = asset.userData.audioReactive || false;
                }
            });
            return reactive;
        });
        
        expect(audioReactiveAssets.boombox).toBe(true);
        expect(audioReactiveAssets.geodesicStation).toBe(true);
        expect(audioReactiveAssets.damagedHelmet).toBe(true);
    });

    test('should have rest mode toggle functionality', async ({ page }) => {
        const hasRestMode = await page.evaluate(() => {
            const integration = window.gameSystems?.codexAssetIntegration;
            return integration && typeof integration.setRestMode === 'function';
        });
        
        expect(hasRestMode).toBe(true);
        
        // Test rest mode toggle
        await page.keyboard.press('Control+r');
        await page.waitForTimeout(500);
        
        const restModeEnabled = await page.evaluate(() => {
            return window.restModeEnabled === true;
        });
        
        expect(restModeEnabled).toBe(true);
    });

    test('should have asset attribution panel accessible', async ({ page }) => {
        await page.keyboard.press('Control+Shift+a');
        await page.waitForTimeout(500);
        
        const panelVisible = await page.evaluate(() => {
            const panel = document.querySelector('#asset_attribution_panel');
            return panel && panel.style.display !== 'none';
        });
        
        expect(panelVisible).toBe(true);
    });
});

