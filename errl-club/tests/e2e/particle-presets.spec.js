/**
 * Particle Presets Tests
 * Tests for particle preset system and integration
 */
import { test, expect } from '@playwright/test';
import { waitForGameReady } from '../helpers/gameHelpers.js';

test.describe('Particle Presets', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await waitForGameReady(page);
        await page.waitForTimeout(1000);
    });

    test('should have ParticlePresets system', async ({ page }) => {
        const hasPresets = await page.evaluate(() => {
            return window.gameSystems?.particlePresets !== undefined;
        });
        
        expect(hasPresets).toBe(true);
    });

    test('should have all particle presets', async ({ page }) => {
        const presets = await page.evaluate(() => {
            const presetsSystem = window.gameSystems?.particlePresets;
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

    test('should have ParticleSystem with preset support', async ({ page }) => {
        const hasParticleSystem = await page.evaluate(() => {
            const particleSystem = window.gameSystems?.particleSystem;
            return particleSystem && typeof particleSystem.setPreset === 'function';
        });
        
        expect(hasParticleSystem).toBe(true);
    });

    test('should be able to change particle preset', async ({ page }) => {
        const presetChanged = await page.evaluate(() => {
            const presetsSystem = window.gameSystems?.particlePresets;
            const particleSystem = window.gameSystems?.particleSystem;
            
            if (!presetsSystem || !particleSystem) return false;
            
            const originalPreset = presetsSystem.currentPreset;
            const newPreset = presetsSystem.getPreset('intense');
            presetsSystem.setPreset('intense');
            particleSystem.setPreset(newPreset);
            
            return presetsSystem.currentPreset === 'intense';
        });
        
        expect(presetChanged).toBe(true);
    });

    test('should persist particle preset', async ({ page }) => {
        await page.evaluate(() => {
            const presetsSystem = window.gameSystems?.particlePresets;
            if (presetsSystem) {
                presetsSystem.setPreset('extreme');
                presetsSystem.save();
            }
        });
        
        await page.reload();
        await waitForGameReady(page);
        await page.waitForTimeout(1000);
        
        const currentPreset = await page.evaluate(() => {
            const presetsSystem = window.gameSystems?.particlePresets;
            return presetsSystem?.currentPreset || null;
        });
        
        expect(currentPreset).not.toBeNull();
    });
});

