/**
 * Screen Effects Presets Tests
 * Tests for screen effects and glitch preset system
 */
import { test, expect } from '@playwright/test';
import { waitForGameReady } from '../helpers/gameHelpers.js';

test.describe('Screen Effects Presets', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await waitForGameReady(page);
        await page.waitForTimeout(1000);
    });

    test('should have ScreenEffectsPresets system', async ({ page }) => {
        const hasPresets = await page.evaluate(() => {
            return window.gameSystems?.screenEffectsPresets !== undefined;
        });
        
        expect(hasPresets).toBe(true);
    });

    test('should have all screen effects presets', async ({ page }) => {
        const presets = await page.evaluate(() => {
            const presetsSystem = window.gameSystems?.screenEffectsPresets;
            if (!presetsSystem) return {};
            return presetsSystem.presets || {};
        });
        
        expect(presets).toHaveProperty('off');
        expect(presets).toHaveProperty('minimal');
        expect(presets).toHaveProperty('subtle');
        expect(presets).toHaveProperty('normal');
        expect(presets).toHaveProperty('intense');
        expect(presets).toHaveProperty('extreme');
    });

    test('should have EnvironmentEffects with screen effect controls', async ({ page }) => {
        const hasEnvironmentEffects = await page.evaluate(() => {
            const envEffects = window.gameSystems?.environmentEffects;
            return envEffects && 
                   typeof envEffects.setScreenEffectIntensity === 'function';
        });
        
        expect(hasEnvironmentEffects).toBe(true);
    });

    test('should be able to change screen effects preset', async ({ page }) => {
        const presetChanged = await page.evaluate(() => {
            const presetsSystem = window.gameSystems?.screenEffectsPresets;
            const envEffects = window.gameSystems?.environmentEffects;
            
            if (!presetsSystem || !envEffects) return false;
            
            const originalPreset = presetsSystem.currentPreset;
            presetsSystem.setPreset('intense');
            const newPreset = presetsSystem.getCurrentPreset();
            
            if (newPreset) {
                envEffects.setScreenEffectIntensity(newPreset.screenEffectIntensity);
                envEffects.screenAnimationSpeed = newPreset.screenAnimationSpeed;
            }
            
            return presetsSystem.currentPreset === 'intense';
        });
        
        expect(presetChanged).toBe(true);
    });

    test('should persist screen effects preset', async ({ page }) => {
        await page.evaluate(() => {
            const presetsSystem = window.gameSystems?.screenEffectsPresets;
            if (presetsSystem) {
                presetsSystem.setPreset('extreme');
                presetsSystem.save();
            }
        });
        
        await page.reload();
        await waitForGameReady(page);
        await page.waitForTimeout(1000);
        
        const currentPreset = await page.evaluate(() => {
            const presetsSystem = window.gameSystems?.screenEffectsPresets;
            return presetsSystem?.currentPreset || null;
        });
        
        expect(currentPreset).not.toBeNull();
    });
});

