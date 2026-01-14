/**
 * StateManager Tests
 * Tests for StateManager functionality (Phase B)
 */
import { test, expect } from '@playwright/test';
import { setupTestWithGameInit, cleanupTestWithErrorCheck, waitForAvatarReady, checkForErrorsDuringTest } from '../helpers/gameHelpers.js';

test.describe('StateManager', () => {
    let errorCollection;

    test.beforeEach(async ({ page }) => {
        const setup = await setupTestWithGameInit(page);
        errorCollection = setup.errorCollection;
    });

    test.afterEach(async ({ page }) => {
        await cleanupTestWithErrorCheck(page, errorCollection);
    });

    test('should have StateManager available', async ({ page }) => {
        // Check for errors before test
        const preCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (preCheck.hasErrors) {
            throw new Error(`Errors before StateManager test: ${preCheck.errors.map(e => e.description).join(', ')}`);
        }
        
        const hasStateManager = await page.evaluate(() => {
            return typeof window.stateManager !== 'undefined' && 
                   window.stateManager !== null;
        });
        
        // Check for errors after test
        const postCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (postCheck.hasErrors) {
            throw new Error(`Errors after StateManager test: ${postCheck.errors.map(e => e.description).join(', ')}`);
        }
        
        expect(hasStateManager).toBe(true);
    });

    test('should be able to get and set state', async ({ page }) => {
        // Check for errors before test
        const preCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (preCheck.hasErrors) {
            throw new Error(`Errors before state get/set test: ${preCheck.errors.map(e => e.description).join(', ')}`);
        }
        
        const stateWorks = await page.evaluate(() => {
            if (!window.stateManager) return false;
            try {
                window.stateManager.set('testKey', 'testValue');
                const value = window.stateManager.get('testKey');
                return value === 'testValue';
            } catch (error) {
                return false;
            }
        });
        
        // Check for errors after test
        const postCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (postCheck.hasErrors) {
            throw new Error(`Errors after state get/set test: ${postCheck.errors.map(e => e.description).join(', ')}`);
        }
        
        expect(stateWorks).toBe(true);
    });

    test('should support state subscriptions', async ({ page }) => {
        // Check for errors before test
        const preCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (preCheck.hasErrors) {
            throw new Error(`Errors before subscription test: ${preCheck.errors.map(e => e.description).join(', ')}`);
        }
        
        const subscriptionsWork = await page.evaluate(() => {
            if (!window.stateManager) return false;
            try {
                let callbackCalled = false;
                window.stateManager.subscribe('testKey', () => {
                    callbackCalled = true;
                });
                window.stateManager.set('testKey', 'newValue');
                return callbackCalled;
            } catch (error) {
                return false;
            }
        });
        
        // Check for errors after test
        const postCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (postCheck.hasErrors) {
            throw new Error(`Errors after subscription test: ${postCheck.errors.map(e => e.description).join(', ')}`);
        }
        
        expect(subscriptionsWork).toBe(true);
    });
});

