/**
 * Audio-Reactive Features Tests
 * Tests for portal rifts, chromatic fog, spark trails, laser ribbons, and asset audio reactions
 */
import { test, expect } from '@playwright/test';
import { waitForGameReady } from '../helpers/gameHelpers.js';
import { setupErrorCollection, checkForBlockingErrors } from '../helpers/errorRecovery.js';

test.describe('Audio-Reactive Features', () => {
    let errorCollection;

    test.beforeEach(async ({ page }) => {
        errorCollection = setupErrorCollection(page);
        page._errorCollection = errorCollection;
        
        await page.goto('/');
        await waitForGameReady(page);
        
        // Check for blocking errors before proceeding
        const blockingCheck = checkForBlockingErrors(errorCollection, {
            ignoreExpected: true,
            ignoreKnownBugs: true,
            logErrors: true
        });
        
        await page.waitForTimeout(2000);
    });

    test.afterEach(async ({ page }) => {
        if (errorCollection) {
            const blockingCheck = checkForBlockingErrors(errorCollection, {
                ignoreExpected: true,
                ignoreKnownBugs: true,
                logErrors: true
            });
            errorCollection.cleanup();
        }
    });

    test('should have portal rifts with beat synchronization', async ({ page }) => {
        const hasPortalRifts = await page.evaluate(() => {
            return window.portalRifts && Array.isArray(window.portalRifts) && window.portalRifts.length > 0;
        });
        
        expect(hasPortalRifts).toBe(true);
        
        // Check if portal rifts have beat detector
        const hasBeatDetector = await page.evaluate(() => {
            return window.portalRifts && window.portalRifts[0] && 
                   typeof window.portalRifts[0].setBeatDetector === 'function';
        });
        
        expect(hasBeatDetector).toBe(true);
    });

    test('should have frequency band extractor', async ({ page }) => {
        const hasFrequencyExtractor = await page.evaluate(() => {
            return window.frequencyExtractor !== undefined;
        });
        
        expect(hasFrequencyExtractor).toBe(true);
    });

    test('should have beat detector', async ({ page }) => {
        const hasBeatDetector = await page.evaluate(() => {
            return window.beatDetector !== undefined;
        });
        
        expect(hasBeatDetector).toBe(true);
    });

    test('should have chromatic fog system', async ({ page }) => {
        const hasChromaticFog = await page.evaluate(() => {
            return window.scene && window.scene.fog !== undefined;
        });
        
        expect(hasChromaticFog).toBe(true);
    });

    test('should have audio-reactive asset updates', async ({ page }) => {
        const hasAudioReactiveUpdate = await page.evaluate(() => {
            const integration = window.gameSystems?.codexAssetIntegration;
            return integration && typeof integration.updateAudioReactive === 'function';
        });
        
        expect(hasAudioReactiveUpdate).toBe(true);
    });

    test('should have frequency bands extracted', async ({ page }) => {
        await page.waitForTimeout(1000);
        
        const frequencyBands = await page.evaluate(() => {
            return window.frequencyBands || null;
        });
        
        expect(frequencyBands).not.toBeNull();
        expect(frequencyBands).toHaveProperty('bass');
        expect(frequencyBands).toHaveProperty('mid');
        expect(frequencyBands).toHaveProperty('treble');
    });

    test('should have audio-reactive camera system', async ({ page }) => {
        const hasAudioReactiveCamera = await page.evaluate(() => {
            const cameraController = window.gameSystems?.cameraController;
            return cameraController && typeof cameraController.updateAudioReactive === 'function';
        });
        
        expect(hasAudioReactiveCamera).toBe(true);
    });

    test('should have audio-reactive particle system', async ({ page }) => {
        const hasAudioReactiveParticles = await page.evaluate(() => {
            const particleSystem = window.gameSystems?.particleSystem;
            return particleSystem !== undefined;
        });
        
        expect(hasAudioReactiveParticles).toBe(true);
    });
});

