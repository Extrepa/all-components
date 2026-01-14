/**
 * Quick Settings Menu Tests
 * Tests for quick settings menu and graphics quality integration
 */
import { test, expect } from '@playwright/test';
import { waitForGameReady } from '../helpers/gameHelpers.js';

test.describe('Quick Settings Menu', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await waitForGameReady(page);
        await page.waitForTimeout(1000);
    });

    test('should open quick settings menu with F4', async ({ page }) => {
        await page.keyboard.press('F4');
        await page.waitForTimeout(500);
        
        const menuVisible = await page.evaluate(() => {
            const menu = document.querySelector('#quick_settings_menu');
            return menu && menu.style.display !== 'none';
        });
        
        expect(menuVisible).toBe(true);
    });

    test('should have graphics quality selector', async ({ page }) => {
        await page.keyboard.press('F4');
        await page.waitForTimeout(500);
        
        const hasQualitySelector = await page.evaluate(() => {
            const menu = document.querySelector('#quick_settings_menu');
            if (!menu) return false;
            
            // Look for quality preset dropdown
            const dropdowns = menu.querySelectorAll('select, [role="combobox"]');
            return dropdowns.length > 0;
        });
        
        expect(hasQualitySelector).toBe(true);
    });

    test('should apply graphics quality preset to all systems', async ({ page }) => {
        const presetApplied = await page.evaluate(() => {
            const graphicsSettings = window.gameSystems?.graphicsSettings;
            if (!graphicsSettings) return false;
            
            // Change to low quality
            graphicsSettings.setQualityPreset('low');
            
            // Check if related presets were applied
            const postPreset = window.gameSystems?.postProcessingPresets?.currentPreset;
            const particlePreset = window.gameSystems?.particlePresets?.currentPreset;
            const screenPreset = window.gameSystems?.screenEffectsPresets?.currentPreset;
            
            return postPreset === 'low' && 
                   particlePreset === 'minimal' && 
                   screenPreset === 'minimal';
        });
        
        expect(presetApplied).toBe(true);
    });

    test('should have camera intensity controls', async ({ page }) => {
        await page.keyboard.press('F4');
        await page.waitForTimeout(500);
        
        const hasCameraControls = await page.evaluate(() => {
            const menu = document.querySelector('#quick_settings_menu');
            if (!menu) return false;
            
            const text = menu.textContent || '';
            return text.includes('Camera') || text.includes('Intensity');
        });
        
        expect(hasCameraControls).toBe(true);
    });

    test('should have audio volume controls', async ({ page }) => {
        await page.keyboard.press('F4');
        await page.waitForTimeout(500);
        
        const hasAudioControls = await page.evaluate(() => {
            const menu = document.querySelector('#quick_settings_menu');
            if (!menu) return false;
            
            const text = menu.textContent || '';
            return text.includes('Audio') || text.includes('Volume');
        });
        
        expect(hasAudioControls).toBe(true);
    });

    test('should close quick settings menu with Escape', async ({ page }) => {
        await page.keyboard.press('F4');
        await page.waitForTimeout(500);
        
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        
        const menuVisible = await page.evaluate(() => {
            const menu = document.querySelector('#quick_settings_menu');
            return menu && menu.style.display !== 'none';
        });
        
        expect(menuVisible).toBe(false);
    });
});

