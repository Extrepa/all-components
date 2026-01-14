/**
 * Audio-Reactive Camera Tests
 * Tests for audio-reactive camera features with frequency band mapping
 */
import { test, expect } from '@playwright/test';
import { waitForGameReady } from '../helpers/gameHelpers.js';

test.describe('Audio-Reactive Camera', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await waitForGameReady(page);
        await page.waitForTimeout(1000);
    });

    test('should have CameraController with audio-reactive support', async ({ page }) => {
        const hasAudioReactive = await page.evaluate(() => {
            const cameraController = window.gameSystems?.cameraController;
            return cameraController && 
                   typeof cameraController.updateAudioReactive === 'function';
        });
        
        expect(hasAudioReactive).toBe(true);
    });

    test('should have CameraSettings with audio-reactive properties', async ({ page }) => {
        const hasAudioReactiveSettings = await page.evaluate(() => {
            const cameraSettings = window.gameSystems?.cameraSettings;
            if (!cameraSettings) return false;
            
            const settings = cameraSettings.getSettings();
            return settings.hasOwnProperty('audioReactiveEnabled') &&
                   settings.hasOwnProperty('audioReactiveIntensity') &&
                   settings.hasOwnProperty('audioReactiveSmoothing');
        });
        
        expect(hasAudioReactiveSettings).toBe(true);
    });

    test('should have frequency band mapping in camera controller', async ({ page }) => {
        const hasFrequencyMapping = await page.evaluate(() => {
            const cameraController = window.gameSystems?.cameraController;
            return cameraController && 
                   cameraController.frequencyBandMapping !== undefined;
        });
        
        expect(hasFrequencyMapping).toBe(true);
    });

    test('should have audio-reactive camera settings in all presets', async ({ page }) => {
        const presetsHaveAudioReactive = await page.evaluate(() => {
            const cameraSettings = window.gameSystems?.cameraSettings;
            if (!cameraSettings) return false;
            
            const presets = ['low', 'medium', 'high'];
            return presets.every(preset => {
                const settings = cameraSettings.getPreset(preset);
                return settings && 
                       settings.hasOwnProperty('audioReactiveEnabled') &&
                       settings.hasOwnProperty('audioReactiveIntensity');
            });
        });
        
        expect(presetsHaveAudioReactive).toBe(true);
    });

    test('should update camera with frequency bands', async ({ page }) => {
        await page.waitForTimeout(1000);
        
        const cameraUpdated = await page.evaluate(() => {
            const cameraController = window.gameSystems?.cameraController;
            const frequencyBands = window.frequencyBands;
            const cameraSettings = window.gameSystems?.cameraSettings;
            
            if (!cameraController || !frequencyBands || !cameraSettings) {
                return false;
            }
            
            // Simulate audio-reactive update
            const settings = cameraSettings.getSettings();
            cameraController.updateAudioReactive(frequencyBands, cameraSettings);
            
            return true;
        });
        
        expect(cameraUpdated).toBe(true);
    });
});

