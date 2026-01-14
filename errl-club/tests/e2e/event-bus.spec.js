/**
 * EventBus Tests
 * Tests for EventBus functionality (Phase B)
 */
import { test, expect } from '@playwright/test';
import { setupTestWithGameInit, cleanupTestWithErrorCheck, checkForErrorsDuringTest } from '../helpers/gameHelpers.js';

test.describe('EventBus', () => {
    let errorCollection;

    test.beforeEach(async ({ page }) => {
        const setup = await setupTestWithGameInit(page);
        errorCollection = setup.errorCollection;
    });

    test.afterEach(async ({ page }) => {
        await cleanupTestWithErrorCheck(page, errorCollection);
    });

    test('should have EventBus available', async ({ page }) => {
        // Check for errors before test
        const preCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (preCheck.hasErrors) {
            throw new Error(`Errors before EventBus test: ${preCheck.errors.map(e => e.description).join(', ')}`);
        }
        
        const hasEventBus = await page.evaluate(() => {
            return typeof window.eventBus !== 'undefined' && 
                   window.eventBus !== null;
        });
        
        // Check for errors after test
        const postCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (postCheck.hasErrors) {
            throw new Error(`Errors after EventBus test: ${postCheck.errors.map(e => e.description).join(', ')}`);
        }
        
        expect(hasEventBus).toBe(true);
    });

    test('should be able to register and emit events', async ({ page }) => {
        // Check for errors before test
        const preCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (preCheck.hasErrors) {
            throw new Error(`Errors before event registration test: ${preCheck.errors.map(e => e.description).join(', ')}`);
        }
        
        const eventsWork = await page.evaluate(() => {
            if (!window.eventBus) return false;
            try {
                let eventReceived = false;
                window.eventBus.on('testEvent', () => {
                    eventReceived = true;
                });
                window.eventBus.emit('testEvent');
                return eventReceived;
            } catch (error) {
                return false;
            }
        });
        
        // Check for errors after test
        const postCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (postCheck.hasErrors) {
            throw new Error(`Errors after event registration test: ${postCheck.errors.map(e => e.description).join(', ')}`);
        }
        
        expect(eventsWork).toBe(true);
    });

    test('should support event removal', async ({ page }) => {
        // Check for errors before test
        const preCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (preCheck.hasErrors) {
            throw new Error(`Errors before event removal test: ${preCheck.errors.map(e => e.description).join(', ')}`);
        }
        
        const removalWorks = await page.evaluate(() => {
            if (!window.eventBus) return false;
            try {
                let callCount = 0;
                const handler = () => { callCount++; };
                window.eventBus.on('testEvent', handler);
                window.eventBus.emit('testEvent');
                window.eventBus.off('testEvent', handler);
                window.eventBus.emit('testEvent');
                return callCount === 1;
            } catch (error) {
                return false;
            }
        });
        
        // Check for errors after test
        const postCheck = await checkForErrorsDuringTest(page, errorCollection);
        if (postCheck.hasErrors) {
            throw new Error(`Errors after event removal test: ${postCheck.errors.map(e => e.description).join(', ')}`);
        }
        
        expect(removalWorks).toBe(true);
    });
});

