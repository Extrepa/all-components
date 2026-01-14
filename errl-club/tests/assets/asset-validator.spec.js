/**
 * AssetValidator Tests
 */
import { test, expect } from '@playwright/test';

test.describe('AssetValidator', () => {
    test('should create AssetValidator instance', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);

        const hasValidator = await page.evaluate(() => {
            const { AssetValidator } = require('../../src/assets/AssetValidator.js');
            const validator = new AssetValidator();
            return validator !== null;
        });

        expect(hasValidator).toBe(true);
    });

    test('should validate 3D model asset', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);

        const result = await page.evaluate(() => {
            const { AssetValidator } = require('../../src/assets/AssetValidator.js');
            const validator = new AssetValidator();
            return validator.validate({
                type: '3d-model',
                path: '/models/test.glb',
                size: 1024 * 1024, // 1MB
                format: 'glb',
                license: 'CC BY 4.0',
                category: 'props',
            });
        });

        expect(result.valid).toBe(true);
    });

    test('should reject invalid format', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);

        const result = await page.evaluate(() => {
            const { AssetValidator } = require('../../src/assets/AssetValidator.js');
            const validator = new AssetValidator();
            return validator.validate({
                type: '3d-model',
                path: '/models/test.xyz',
                size: 1024,
                format: 'xyz',
                license: 'CC BY 4.0',
            });
        });

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should warn on large asset', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);

        const result = await page.evaluate(() => {
            const { AssetValidator } = require('../../src/assets/AssetValidator.js');
            const validator = new AssetValidator();
            return validator.validate({
                type: '3d-model',
                path: '/models/test.glb',
                size: 100 * 1024 * 1024, // 100MB (exceeds limit)
                format: 'glb',
                license: 'CC BY 4.0',
                category: 'props',
            });
        });

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should check format allowance', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);

        const allowed = await page.evaluate(() => {
            const { AssetValidator } = require('../../src/assets/AssetValidator.js');
            const validator = new AssetValidator();
            return validator.isFormatAllowed('3d-model', 'glb');
        });

        expect(allowed).toBe(true);
    });
});

