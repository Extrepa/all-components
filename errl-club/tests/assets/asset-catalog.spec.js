/**
 * AssetCatalog Tests
 */
import { test, expect } from '@playwright/test';

test.describe('AssetCatalog', () => {
    test('should create AssetCatalog instance', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);

        const hasCatalog = await page.evaluate(() => {
            const { AssetCatalog } = require('../../src/assets/AssetCatalog.js');
            const catalog = new AssetCatalog();
            return catalog !== null;
        });

        expect(hasCatalog).toBe(true);
    });

    test('should add asset to catalog', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);

        const added = await page.evaluate(() => {
            const { AssetCatalog } = require('../../src/assets/AssetCatalog.js');
            const catalog = new AssetCatalog();
            return catalog.addAsset('testAsset', {
                type: '3d-model',
                path: '/models/test.glb',
                category: 'props',
                size: 1024,
                format: 'glb',
                license: 'CC BY 4.0',
                source: 'Test Source',
            });
        });

        expect(added).toBe(true);
    });

    test('should search assets', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);

        const results = await page.evaluate(() => {
            const { AssetCatalog } = require('../../src/assets/AssetCatalog.js');
            const catalog = new AssetCatalog();
            catalog.addAsset('testAsset1', {
                type: '3d-model',
                path: '/models/test1.glb',
                category: 'props',
                size: 1024,
                format: 'glb',
                license: 'CC BY 4.0',
                source: 'Test Source',
            });
            catalog.addAsset('testAsset2', {
                type: 'texture',
                path: '/textures/test2.png',
                category: 'materials',
                size: 512,
                format: 'png',
                license: 'CC BY 4.0',
                source: 'Test Source',
            });
            return catalog.search('test');
        });

        expect(results.length).toBeGreaterThanOrEqual(2);
    });

    test('should generate attribution report', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);

        const report = await page.evaluate(() => {
            const { AssetCatalog } = require('../../src/assets/AssetCatalog.js');
            const catalog = new AssetCatalog();
            catalog.addAsset('testAsset', {
                type: '3d-model',
                path: '/models/test.glb',
                category: 'props',
                size: 1024,
                format: 'glb',
                license: 'CC BY 4.0',
                source: 'Test Source',
            });
            return catalog.generateAttributionReport();
        });

        expect(report).not.toBeNull();
        expect(report.totalAssets).toBeGreaterThanOrEqual(1);
    });
});

