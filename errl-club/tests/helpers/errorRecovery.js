/**
 * Error Recovery Helper for Playwright Tests
 * 
 * Wraps test execution to catch console errors, attempt fixes, and retry.
 */

import { classifyError, classifyErrors, hasCriticalErrors, getErrorSummary, ERROR_TYPES } from './errorClassification.js';

/**
 * Setup console error collection for a page
 * @param {import('@playwright/test').Page} page - Playwright page
 * @returns {Object} Error collection object with errors array and cleanup function
 */
export function setupErrorCollection(page) {
    const errors = [];
    const warnings = [];
    
    const consoleHandler = (msg) => {
        const text = msg.text();
        if (msg.type() === 'error') {
            errors.push({
                text,
                type: 'console',
                timestamp: Date.now()
            });
        } else if (msg.type() === 'warning') {
            warnings.push({
                text,
                type: 'warning',
                timestamp: Date.now()
            });
        }
    };
    
    const pageErrorHandler = (error) => {
        errors.push({
            text: error.message,
            stack: error.stack,
            type: 'page',
            timestamp: Date.now()
        });
    };
    
    page.on('console', consoleHandler);
    page.on('pageerror', pageErrorHandler);
    
    return {
        errors,
        warnings,
        cleanup: () => {
            page.off('console', consoleHandler);
            page.off('pageerror', pageErrorHandler);
        },
        getClassifiedErrors: () => classifyErrors(errors),
        hasCriticalErrors: () => {
            const classified = classifyErrors(errors);
            return hasCriticalErrors(classified);
        },
        getErrorSummary: () => {
            const classified = classifyErrors(errors);
            return getErrorSummary(classified);
        }
    };
}

/**
 * Check if error is related to LoadingScreen/MainMenu migration
 * @param {Object} error - Error object
 * @returns {boolean} True if error is related to LoadingScreen
 */
export function isLoadingScreenError(error) {
    const text = error.text || error.message || '';
    return /LoadingScreen|loadingScreen|loading-screen/.test(text);
}

/**
 * Attempt to fix LoadingScreen errors by checking and updating code
 * This would need to be called manually or via a script
 * @param {string} errorText - Error text
 * @returns {Object} Fix result with success flag and message
 */
export function attemptFixLoadingScreenError(errorText) {
    // This is a placeholder - actual fixes would need file system access
    // In practice, this would:
    // 1. Search for LoadingScreen references in codebase
    // 2. Replace with MainMenu
    // 3. Return success/failure
    
    if (isLoadingScreenError({ text: errorText })) {
        return {
            success: true,
            message: 'LoadingScreen error detected - needs manual fix (replace with MainMenu)',
            action: 'Search codebase for LoadingScreen/loadingScreen/loading-screen and replace with MainMenu/mainMenu/main-menu'
        };
    }
    
    return {
        success: false,
        message: 'No automatic fix available for this error'
    };
}

/**
 * Run test with error recovery wrapper
 * @param {Function} testFn - Test function
 * @param {Object} options - Options
 * @returns {Promise} Test result
 */
export async function runWithErrorRecovery(testFn, options = {}) {
    const { 
        maxRetries = 3, 
        onError = null,
        errorCollection = null,
        logErrors = true
    } = options;
    let attempt = 0;
    let lastError = null;
    
    while (attempt < maxRetries) {
        attempt++;
        
        try {
            await testFn();
            
            // Check for console errors after test
            if (errorCollection) {
                const summary = errorCollection.getErrorSummary();
                if (summary.critical > 0 && logErrors) {
                    console.warn(`\n⚠️  Critical errors detected after test (${summary.critical} critical, ${summary.expected} expected, ${summary.knownBugs} known bugs)`);
                }
            }
            
            return { 
                success: true, 
                attempt,
                errors: errorCollection ? errorCollection.getErrorSummary() : null
            };
        } catch (error) {
            lastError = error;
            
            // Classify error
            const errorClassification = classifyError({
                text: error.message,
                stack: error.stack
            });
            
            if (logErrors) {
                console.error(`\n❌ Test failed (attempt ${attempt}/${maxRetries}):`, errorClassification.description);
                if (errorClassification.suggestion) {
                    console.error(`   Suggestion: ${errorClassification.suggestion}`);
                }
            }
            
            if (onError) {
                const fixResult = await onError(error, attempt, errorClassification);
                if (fixResult && fixResult.shouldRetry) {
                    if (logErrors) {
                        console.log(`\n🔄 Retrying after fix (attempt ${attempt + 1}/${maxRetries})...`);
                    }
                    // Wait before retry (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt - 1), 5000)));
                    continue;
                }
            }
            
            // If no fix or fix says don't retry, throw error
            throw error;
        }
    }
    
    throw lastError;
}

/**
 * Check for blocking errors before proceeding with test
 * @param {Object} errorCollection - Error collection object from setupErrorCollection
 * @param {Object} options - Options
 * @returns {Object} Check result with shouldProceed flag
 */
export function checkForBlockingErrors(errorCollection, options = {}) {
    const { 
        ignoreExpected = true,
        ignoreKnownBugs = true,
        logErrors = true
    } = options;
    
    if (!errorCollection) {
        return { shouldProceed: true, errors: [] };
    }
    
    const summary = errorCollection.getErrorSummary();
    const criticalErrors = summary.errors.filter(err => err.type === ERROR_TYPES.CRITICAL);
    
    if (criticalErrors.length > 0) {
        if (logErrors) {
            console.error(`\n🚫 Blocking errors detected (${criticalErrors.length} critical):`);
            criticalErrors.forEach(err => {
                console.error(`   - ${err.description}`);
                console.error(`     ${err.errorText.substring(0, 100)}...`);
            });
        }
        return {
            shouldProceed: false,
            errors: criticalErrors,
            summary
        };
    }
    
    if (logErrors && (summary.expected > 0 || summary.knownBugs > 0)) {
        console.log(`\nℹ️  Non-blocking errors: ${summary.expected} expected, ${summary.knownBugs} known bugs`);
    }
    
    return {
        shouldProceed: true,
        errors: [],
        summary
    };
}

