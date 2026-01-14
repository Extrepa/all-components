/**
 * Phase B Test Runner
 * 
 * Orchestrates execution of all Phase B tests (Foundation Modules) with error checking and recovery.
 */

import { setupErrorCollection, checkForBlockingErrors, runWithErrorRecovery } from './errorRecovery.js';
import { waitForGameReady } from './gameHelpers.js';
import { getErrorSummary, ERROR_TYPES } from './errorClassification.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Phase B test files in execution order
 */
export const PHASE_B_TEST_FILES = [
    'settings-persistence.spec.js', // StateManager tests
    'integration.spec.js', // EventBus tests
    'state-manager.spec.js', // New: StateManager specific tests
    'event-bus.spec.js', // New: EventBus specific tests
    'avatar-serialization.spec.js' // New: Avatar serialization tests
];

/**
 * Get path to test execution log
 */
function getExecutionLogPath() {
    const workspaceRoot = path.resolve(__dirname, '../../');
    return path.join(workspaceRoot, 'docs/testing/phase-b-test-execution-log.md');
}

/**
 * Append to execution log
 */
function appendToExecutionLog(entry) {
    const logPath = getExecutionLogPath();
    const timestamp = new Date().toISOString();
    const logEntry = `\n## ${timestamp}\n\n${entry}\n`;
    
    try {
        fs.appendFileSync(logPath, logEntry, 'utf-8');
    } catch (error) {
        console.warn('Could not write to execution log:', error.message);
    }
}

/**
 * Initialize execution log
 */
function initializeExecutionLog() {
    const logPath = getExecutionLogPath();
    const header = `# Phase B Test Execution Log

This log tracks the execution of all Phase B tests (Foundation Modules) with error detection and recovery.

Phase B Features:
- StateManager: Centralized game state management
- EventBus: Global event system for decoupled communication
- Avatar Serialization: Avatar state serialization/deserialization

Generated: ${new Date().toISOString()}

`;
    
    try {
        const logDir = path.dirname(logPath);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        
        if (!fs.existsSync(logPath)) {
            fs.writeFileSync(logPath, header, 'utf-8');
        }
    } catch (error) {
        console.warn('Could not initialize execution log:', error.message);
    }
}

/**
 * Log test execution result
 */
function logTestExecution(testFile, result) {
    const entry = `### ${testFile}

- **Status**: ${result.status}
- **Attempts**: ${result.attempts || 1}
- **Duration**: ${result.duration || 'N/A'}ms
- **Errors**: ${result.errorSummary ? `${result.errorSummary.critical} critical, ${result.errorSummary.expected} expected, ${result.errorSummary.knownBugs} known bugs` : 'None'}
${result.errors && result.errors.length > 0 ? `\n**Error Details:**\n${result.errors.map(err => `- ${err.description}: ${err.errorText.substring(0, 100)}`).join('\n')}` : ''}
${result.note ? `\n**Note**: ${result.note}` : ''}
`;
    
    appendToExecutionLog(entry);
}

/**
 * Run a single test file with error checking
 */
export async function runPhaseBTestFile(page, testFile, options = {}) {
    const { 
        testTimeout = 60000,
        retryOnError = true,
        logResults = true
    } = options;
    
    const startTime = Date.now();
    
    // Setup error collection
    const errorCollection = setupErrorCollection(page);
    
    try {
        // Navigate to game
        await page.goto('/');
        
        // Wait for game to be ready
        await waitForGameReady(page);
        
        // Check for blocking errors before running test
        const blockingCheck = checkForBlockingErrors(errorCollection, {
            ignoreExpected: true,
            ignoreKnownBugs: true,
            logErrors: true
        });
        
        if (!blockingCheck.shouldProceed) {
            const result = {
                status: 'BLOCKED',
                attempts: 1,
                duration: Date.now() - startTime,
                errorSummary: blockingCheck.summary,
                errors: blockingCheck.errors,
                note: 'Test blocked due to critical errors before test execution'
            };
            
            if (logResults) {
                logTestExecution(testFile, result);
            }
            
            return result;
        }
        
        // Wait a bit for any async operations
        await page.waitForTimeout(1000);
        
        // Collect final errors
        const errorSummary = errorCollection.getErrorSummary();
        
        const result = {
            status: errorSummary.critical > 0 ? 'FAILED' : 'PASSED',
            attempts: 1,
            duration: Date.now() - startTime,
            errorSummary,
            errors: errorSummary.errors.filter(err => err.type === ERROR_TYPES.CRITICAL)
        };
        
        if (logResults) {
            logTestExecution(testFile, result);
        }
        
        return result;
        
    } catch (error) {
        const errorSummary = errorCollection.getErrorSummary();
        const result = {
            status: 'FAILED',
            attempts: 1,
            duration: Date.now() - startTime,
            errorSummary,
            errors: errorSummary.errors,
            error: error.message
        };
        
        if (logResults) {
            logTestExecution(testFile, result);
        }
        
        return result;
    } finally {
        errorCollection.cleanup();
    }
}

/**
 * Run all Phase B tests in order
 */
export async function runPhaseBTests(page, options = {}) {
    const {
        testFiles = PHASE_B_TEST_FILES,
        stopOnError = false,
        logResults = true
    } = options;
    
    // Initialize execution log
    if (logResults) {
        initializeExecutionLog();
        appendToExecutionLog(`# Starting Phase B Test Execution\n\nRunning ${testFiles.length} test files...\n`);
    }
    
    const results = [];
    let hasBlockingErrors = false;
    
    for (const testFile of testFiles) {
        console.log(`\n📋 Running Phase B test: ${testFile}`);
        
        const result = await runPhaseBTestFile(page, testFile, options);
        results.push({ testFile, ...result });
        
        if (result.status === 'BLOCKED' || (result.status === 'FAILED' && result.errorSummary.critical > 0)) {
            hasBlockingErrors = true;
            console.error(`\n❌ Test ${testFile} failed with blocking errors`);
            
            if (stopOnError) {
                console.error('\n🛑 Stopping test execution due to blocking errors');
                break;
            }
        } else if (result.status === 'PASSED') {
            console.log(`✅ Test ${testFile} passed`);
        } else {
            console.warn(`⚠️  Test ${testFile} completed with non-blocking errors`);
        }
    }
    
    // Summary
    const summary = {
        total: results.length,
        passed: results.filter(r => r.status === 'PASSED').length,
        failed: results.filter(r => r.status === 'FAILED').length,
        blocked: results.filter(r => r.status === 'BLOCKED').length,
        hasBlockingErrors
    };
    
    if (logResults) {
        const summaryEntry = `\n# Phase B Test Execution Summary

- **Total Tests**: ${summary.total}
- **Passed**: ${summary.passed}
- **Failed**: ${summary.failed}
- **Blocked**: ${summary.blocked}
- **Has Blocking Errors**: ${summary.hasBlockingErrors ? 'Yes' : 'No'}
- **Status**: ${summary.hasBlockingErrors ? '❌ INCOMPLETE' : '✅ COMPLETE'}

`;
        appendToExecutionLog(summaryEntry);
    }
    
    return {
        summary,
        results
    };
}

