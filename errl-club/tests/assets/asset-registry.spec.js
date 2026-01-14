/**
 * AssetRegistry Tests
 */
import { test, expect } from '@playwright/test';

test.describe('AssetRegistry', () => {
    test('should create AssetRegistry instance', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);

        const hasRegistry = await page.evaluate(() => {
            const { AssetRegistry } = require('../../src/assets/AssetRegistry.js');
            const registry = new AssetRegistry();
            return registry !== null;
        });

        expect(hasRegistry).toBe(true);
    });

    test('should register asset', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);

        const registered = await page.evaluate(() => {
            const { AssetRegistry } = require('../../src/assets/AssetRegistry.js');
            const registry = new AssetRegistry();
            return registry.register('testAsset', {
                type: '3d-model',
                path: '/models/test.glb',
                category: 'props',
                size: 1024,
                format: 'glb',
                license: 'CC BY 4.0',
                source: 'Test Source',
            });
        });

        expect(registered).toBe(true);
    });

    test('should retrieve registered asset', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);

        const asset = await page.evaluate(() => {
            const { AssetRegistry } = require('../../src/assets/AssetRegistry.js');
            const registry = new AssetRegistry();
            registry.register('testAsset', {
                type: '3d-model',
                path: '/models/test.glb',
                category: 'props',
                size: 1024,
                format: 'glb',
                license: 'CC BY 4.0',
                source: 'Test Source',
            });
            return registry.get('testAsset');
        });

        expect(asset).not.toBeNull();
        expect(asset.id).toBe('testAsset');
        expect(asset.type).toBe('3d-model');
    });

    test('should search assets', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);

        const results = await page.evaluate(() => {
            const { AssetRegistry } = require('../../src/assets/AssetRegistry.js');
            const registry = new AssetRegistry();
            registry.register('testAsset1', {
                type: '3d-model',
                path: '/models/test1.glb',
                category: 'props',
                size: 1024,
                format: 'glb',
                license: 'CC BY 4.0',
                source: 'Test Source',
            });
            registry.register('testAsset2', {
                type: 'texture',
                path: '/textures/test2.png',
                category: 'materials',
                size: 512,
                format: 'png',
                license: 'CC BY 4.0',
                source: 'Test Source',
            });
            return registry.search('test');
        });

        expect(results.length).toBeGreaterThanOrEqual(2);
    });

    test('should filter assets by type', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);

        const assets = await page.evaluate(() => {
            const { AssetRegistry } = require('../../src/assets/AssetRegistry.js');
            const registry = new AssetRegistry();
            registry.register('testAsset1', {
                type: '3d-model',
                path: '/models/test1.glb',
                category: 'props',
                size: 1024,
                format: 'glb',
                license: 'CC BY 4.0',
                source: 'Test Source',
            });
            registry.register('testAsset2', {
                type: 'texture',
                path: '/textures/test2.png',
                category: 'materials',
                size: 512,
                format: 'png',
                license: 'CC BY 4.0',
                source: 'Test Source',
            });
            return registry.getByType('3d-model');
        });

        expect(assets.length).toBeGreaterThanOrEqual(1);
        expect(assets[0].type).toBe('3d-model');
    });
});

