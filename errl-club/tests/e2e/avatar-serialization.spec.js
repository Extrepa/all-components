/**
 * Avatar Serialization Tests
 * Tests for avatar serialization/deserialization (Phase B)
 */
import { test, expect } from '@playwright/test';
import { setupTestWithGameInit, cleanupTestWithErrorCheck, waitForAvatarReady, checkForErrorsDuringTest } from '../helpers/gameHelpers.js';

test.describe('Avatar Serialization', () => {
    let errorCollection;

    test.beforeEach(async ({ page }) => {
        const setup = await setupTestWithGameInit(page);
        errorCollection = setup.errorCollection;
    });

    test.afterEach(async ({ page }) => {
        await cleanupTestWithErrorCheck(page, errorCollection);
    });

    test('should have avatar with serialization methods', async ({ page }) => {
        // Check for errors before test
        const preCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (preCheck.hasErrors) {
            throw new Error(`Errors before serialization methods test: ${preCheck.errors.map(e => e.description).join(', ')}`);
        }
        
        const hasSerialization = await page.evaluate(() => {
            return window.gameSystems?.avatar !== undefined &&
                   typeof window.gameSystems.avatar.toJSON === 'function' &&
                   typeof window.gameSystems.avatar.fromJSON === 'function';
        });
        
        // Check for errors after test
        const postCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (postCheck.hasErrors) {
            throw new Error(`Errors after serialization methods test: ${postCheck.errors.map(e => e.description).join(', ')}`);
        }
        
        expect(hasSerialization).toBe(true);
    });

    test('should be able to serialize avatar state', async ({ page }) => {
        // Check for errors before test
        const preCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (preCheck.hasErrors) {
            throw new Error(`Errors before serialize test: ${preCheck.errors.map(e => e.description).join(', ')}`);
        }
        
        const canSerialize = await page.evaluate(() => {
            if (!window.gameSystems?.avatar) return false;
            try {
                const serialized = window.gameSystems.avatar.toJSON();
                return serialized !== null && typeof serialized === 'object';
            } catch (error) {
                return false;
            }
        });
        
        // Check for errors after test
        const postCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (postCheck.hasErrors) {
            throw new Error(`Errors after serialize test: ${postCheck.errors.map(e => e.description).join(', ')}`);
        }
        
        expect(canSerialize).toBe(true);
    });

    test('should be able to deserialize avatar state', async ({ page }) => {
        // Check for errors before test
        const preCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (preCheck.hasErrors) {
            throw new Error(`Errors before deserialize test: ${preCheck.errors.map(e => e.description).join(', ')}`);
        }
        
        const canDeserialize = await page.evaluate(() => {
            if (!window.gameSystems?.avatar) return false;
            try {
                const originalState = window.gameSystems.avatar.toJSON();
                const newState = { ...originalState, position: { x: 10, y: 5, z: 10 } };
                window.gameSystems.avatar.fromJSON(newState);
                return true;
            } catch (error) {
                return false;
            }
        });
        
        // Wait for avatar to settle after deserialization
        await waitForAvatarReady(page);
        
        // Check for errors after test
        const postCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (postCheck.hasErrors) {
            throw new Error(`Errors after deserialize test: ${postCheck.errors.map(e => e.description).join(', ')}`);
        }
        
        expect(canDeserialize).toBe(true);
    });
});

