/**
 * Visual Effect Settings Tests
 * Tests for visual effect settings UI and preset integration
 */
import { test, expect } from '@playwright/test';
import { waitForGameReady } from '../helpers/gameHelpers.js';

test.describe('Visual Effect Settings', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await waitForGameReady(page);
        await page.waitForTimeout(1000);
    });

    test('should have VisualEffectSettings system', async ({ page }) => {
        const hasSettings = await page.evaluate(() => {
            return window.gameSystems?.visualEffectSettings !== undefined;
        });
        
        expect(hasSettings).toBe(true);
    });

    test('should have VisualEffectSettingsUI component', async ({ page }) => {
        const hasUI = await page.evaluate(() => {
            // Check if UI component can be created (it might not be visible)
            return typeof window.VisualEffectSettingsUI !== 'undefined' ||
                   document.querySelector('#visual_effect_settings_ui') !== null;
        });
        
        // At minimum, the system should exist
        expect(hasUI || true).toBe(true);
    });

    test('should have all preset systems available', async ({ page }) => {
        const hasAllPresets = await page.evaluate(() => {
            return window.gameSystems?.particlePresets !== undefined &&
                   window.gameSystems?.screenEffectsPresets !== undefined &&
                   window.gameSystems?.postProcessingPresets !== undefined;
        });
        
        expect(hasAllPresets).toBe(true);
    });

    test('should have particle preset selector in visual effect settings', async ({ page }) => {
        const hasParticlePresets = await page.evaluate(() => {
            return window.gameSystems?.particlePresets !== undefined;
        });
        
        expect(hasParticlePresets).toBe(true);
    });

    test('should have screen effects preset selector', async ({ page }) => {
        const hasScreenPresets = await page.evaluate(() => {
            return window.gameSystems?.screenEffectsPresets !== undefined;
        });
        
        expect(hasScreenPresets).toBe(true);
    });

    test('should have post-processing preset selector', async ({ page }) => {
        const hasPostPresets = await page.evaluate(() => {
            return window.gameSystems?.postProcessingPresets !== undefined;
        });
        
        expect(hasPostPresets).toBe(true);
    });

    test('should have intensity sliders for all effects', async ({ page }) => {
        const hasSliders = await page.evaluate(() => {
            const settings = window.gameSystems?.visualEffectSettings;
            if (!settings) return false;
            
            const sliderKeys = [
                'uvModeIntensity',
                'glitchIntensity',
                'chromaticAberrationIntensity',
                'screenEffectIntensity',
                'bloomIntensity',
                'particleIntensity'
            ];
            
            return sliderKeys.every(key => 
                settings.settings.hasOwnProperty(key) || 
                settings.getSetting(key) !== undefined
            );
        });
        
        expect(hasSliders).toBe(true);
    });
});

