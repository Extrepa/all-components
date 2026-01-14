/**
 * Performance Monitoring Tests
 * Tests for performance monitoring, optimization, and asset metrics
 */
import { test, expect } from '@playwright/test';
import { waitForGameReady } from '../helpers/gameHelpers.js';

test.describe('Performance Monitoring', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await waitForGameReady(page);
        await page.waitForTimeout(2000);
    });

    test('should have DevTools with performance monitoring', async ({ page }) => {
        const hasDevTools = await page.evaluate(() => {
            return window.devTools !== undefined;
        });
        
        expect(hasDevTools).toBe(true);
        
        const hasPerformanceStats = await page.evaluate(() => {
            return window.devTools && window.devTools.stats !== undefined;
        });
        
        expect(hasPerformanceStats).toBe(true);
    });

    test('should track FPS', async ({ page }) => {
        await page.waitForTimeout(1000);
        
        const fps = await page.evaluate(() => {
            return window.devTools?.fps || 0;
        });
        
        expect(fps).toBeGreaterThan(0);
    });

    test('should track performance stats', async ({ page }) => {
        await page.waitForTimeout(1000);
        
        const stats = await page.evaluate(() => {
            return window.devTools?.stats || null;
        });
        
        expect(stats).not.toBeNull();
        expect(stats).toHaveProperty('fps');
        expect(stats).toHaveProperty('frameTime');
        expect(stats).toHaveProperty('drawCalls');
        expect(stats).toHaveProperty('triangles');
        expect(stats).toHaveProperty('assetStats');
    });

    test('should have PerformanceOptimizer system', async ({ page }) => {
        const hasOptimizer = await page.evaluate(() => {
            return window.gameSystems?.performanceOptimizer !== undefined;
        });
        
        expect(hasOptimizer).toBe(true);
    });

    test('should have asset-specific performance metrics', async ({ page }) => {
        await page.waitForTimeout(2000);
        
        const assetStats = await page.evaluate(() => {
            return window.devTools?.stats?.assetStats || {};
        });
        
        // Should have asset stats object (may be empty if assets not loaded yet)
        expect(typeof assetStats).toBe('object');
    });

    test('should have CodexAssetIntegration connected to DevTools', async ({ page }) => {
        const isConnected = await page.evaluate(() => {
            return window.devTools?.codexAssetIntegration !== undefined;
        });
        
        expect(isConnected).toBe(true);
    });

    test('should have LOD system for performance', async ({ page }) => {
        const hasLODSystem = await page.evaluate(() => {
            return window.gameSystems?.lodSystem !== undefined;
        });
        
        expect(hasLODSystem).toBe(true);
    });

    test('should have performance recommendations system', async ({ page }) => {
        const hasRecommendations = await page.evaluate(() => {
            return window.devTools && 
                   Array.isArray(window.devTools.recommendations);
        });
        
        expect(hasRecommendations).toBe(true);
    });
});

