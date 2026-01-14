/**
 * GraphicsSettings Integration Tests
 * Tests for unified preset system coordination
 */
import { test, expect } from '@playwright/test';
import { waitForGameReady } from '../helpers/gameHelpers.js';

test.describe('GraphicsSettings Integration', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await waitForGameReady(page);
        await page.waitForTimeout(1000);
    });

    test('should have GraphicsSettings system', async ({ page }) => {
        const hasGraphicsSettings = await page.evaluate(() => {
            return window.gameSystems?.graphicsSettings !== undefined;
        });
        
        expect(hasGraphicsSettings).toBe(true);
    });

    test('should have all graphics quality presets', async ({ page }) => {
        const presets = await page.evaluate(() => {
            const graphicsSettings = window.gameSystems?.graphicsSettings;
            if (!graphicsSettings) return {};
            return graphicsSettings.presets || {};
        });
        
        expect(presets).toHaveProperty('low');
        expect(presets).toHaveProperty('medium');
        expect(presets).toHaveProperty('high');
        expect(presets).toHaveProperty('ultra');
    });

    test('should apply presets to all related systems when graphics quality changes', async ({ page }) => {
        const presetApplied = await page.evaluate(() => {
            const graphicsSettings = window.gameSystems?.graphicsSettings;
            const postProcessingPresets = window.gameSystems?.postProcessingPresets;
            const particlePresets = window.gameSystems?.particlePresets;
            const screenEffectsPresets = window.gameSystems?.screenEffectsPresets;
            
            if (!graphicsSettings || !postProcessingPresets || !particlePresets || !screenEffectsPresets) {
                return false;
            }
            
            // Change graphics quality to low
            graphicsSettings.setQualityPreset('low');
            
            // Check if related presets were applied
            const postPreset = postProcessingPresets.currentPreset;
            const particlePreset = particlePresets.currentPreset;
            const screenPreset = screenEffectsPresets.currentPreset;
            
            return postPreset === 'low' && 
                   particlePreset === 'minimal' && 
                   screenPreset === 'minimal';
        });
        
        expect(presetApplied).toBe(true);
    });

    test('should map graphics quality to post-processing presets correctly', async ({ page }) => {
        const mappings = await page.evaluate(() => {
            const graphicsSettings = window.gameSystems?.graphicsSettings;
            const postProcessingPresets = window.gameSystems?.postProcessingPresets;
            
            if (!graphicsSettings || !postProcessingPresets) return {};
            
            const mappings = {};
            const qualities = ['low', 'medium', 'high', 'ultra'];
            
            qualities.forEach(quality => {
                graphicsSettings.setQualityPreset(quality);
                mappings[quality] = postProcessingPresets.currentPreset;
            });
            
            return mappings;
        });
        
        expect(mappings.low).toBe('low');
        expect(mappings.medium).toBe('medium');
        expect(mappings.high).toBe('high');
        expect(mappings.ultra).toBe('ultra');
    });

    test('should map graphics quality to particle presets correctly', async ({ page }) => {
        const mappings = await page.evaluate(() => {
            const graphicsSettings = window.gameSystems?.graphicsSettings;
            const particlePresets = window.gameSystems?.particlePresets;
            
            if (!graphicsSettings || !particlePresets) return {};
            
            const mappings = {};
            const qualities = ['low', 'medium', 'high', 'ultra'];
            
            qualities.forEach(quality => {
                graphicsSettings.setQualityPreset(quality);
                mappings[quality] = particlePresets.currentPreset;
            });
            
            return mappings;
        });
        
        expect(mappings.low).toBe('minimal');
        expect(mappings.medium).toBe('subtle');
        expect(mappings.high).toBe('normal');
        expect(mappings.ultra).toBe('intense');
    });

    test('should map graphics quality to screen effects presets correctly', async ({ page }) => {
        const mappings = await page.evaluate(() => {
            const graphicsSettings = window.gameSystems?.graphicsSettings;
            const screenEffectsPresets = window.gameSystems?.screenEffectsPresets;
            
            if (!graphicsSettings || !screenEffectsPresets) return {};
            
            const mappings = {};
            const qualities = ['low', 'medium', 'high', 'ultra'];
            
            qualities.forEach(quality => {
                graphicsSettings.setQualityPreset(quality);
                mappings[quality] = screenEffectsPresets.currentPreset;
            });
            
            return mappings;
        });
        
        expect(mappings.low).toBe('minimal');
        expect(mappings.medium).toBe('subtle');
        expect(mappings.high).toBe('normal');
        expect(mappings.ultra).toBe('intense');
    });
});

