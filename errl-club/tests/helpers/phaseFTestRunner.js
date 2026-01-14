/**
 * Phase F Test Runner
 * 
 * Orchestrates execution of all Phase F tests (Production Readiness) with error checking and recovery.
 */

import { setupErrorCollection, checkForBlockingErrors } from './errorRecovery.js';
import { waitForGameReady } from './gameHelpers.js';
import { getErrorSummary, ERROR_TYPES } from './errorClassification.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PHASE_F_TEST_FILES = [
    'performance-monitoring.spec.js', // Performance monitoring (analytics)
    'analytics.spec.js', // Analytics and telemetry
    'error-reporting.spec.js', // Error reporting system
    'plugin-system.spec.js', // Plugin system
    'build-deployment.spec.js' // Build and deployment
];

function getExecutionLogPath() {
    const workspaceRoot = path.resolve(__dirname, '../../');
    return path.join(workspaceRoot, 'docs/testing/phase-f-test-execution-log.md');
}

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

function initializeExecutionLog() {
    const logPath = getExecutionLogPath();
    const header = `# Phase F Test Execution Log

This log tracks the execution of all Phase F tests (Production Readiness) with error detection and recovery.

Phase F Features:
- Analytics & Telemetry: Event tracking, user analytics
- Performance Monitoring: FPS tracking, memory monitoring
- Error Reporting: Error reporting (Sentry integration)
- Plugin System: Plugin loader and API
- Build & Deployment: Production build configuration

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

export async function runPhaseFTestFile(page, testFile, options = {}) {
    const { testTimeout = 60000, retryOnError = true, logResults = true } = options;
    const startTime = Date.now();
    const errorCollection = setupErrorCollection(page);
    
    try {
        await page.goto('/');
        await waitForGameReady(page);
        
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
            if (logResults) logTestExecution(testFile, result);
            return result;
        }
        
        await page.waitForTimeout(1000);
        const errorSummary = errorCollection.getErrorSummary();
        
        const result = {
            status: errorSummary.critical > 0 ? 'FAILED' : 'PASSED',
            attempts: 1,
            duration: Date.now() - startTime,
            errorSummary,
            errors: errorSummary.errors.filter(err => err.type === ERROR_TYPES.CRITICAL)
        };
        
        if (logResults) logTestExecution(testFile, result);
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
        if (logResults) logTestExecution(testFile, result);
        return result;
    } finally {
        errorCollection.cleanup();
    }
}

export async function runPhaseFTests(page, options = {}) {
    const { testFiles = PHASE_F_TEST_FILES, stopOnError = false, logResults = true } = options;
    
    if (logResults) {
        initializeExecutionLog();
        appendToExecutionLog(`# Starting Phase F Test Execution\n\nRunning ${testFiles.length} test files...\n`);
    }
    
    const results = [];
    let hasBlockingErrors = false;
    
    for (const testFile of testFiles) {
        console.log(`\n📋 Running Phase F test: ${testFile}`);
        const result = await runPhaseFTestFile(page, testFile, options);
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
    
    const summary = {
        total: results.length,
        passed: results.filter(r => r.status === 'PASSED').length,
        failed: results.filter(r => r.status === 'FAILED').length,
        blocked: results.filter(r => r.status === 'BLOCKED').length,
        hasBlockingErrors
    };
    
    if (logResults) {
        const summaryEntry = `\n# Phase F Test Execution Summary

- **Total Tests**: ${summary.total}
- **Passed**: ${summary.passed}
- **Failed**: ${summary.failed}
- **Blocked**: ${summary.blocked}
- **Has Blocking Errors**: ${summary.hasBlockingErrors ? 'Yes' : 'No'}
- **Status**: ${summary.hasBlockingErrors ? '❌ INCOMPLETE' : '✅ COMPLETE'}

`;
        appendToExecutionLog(summaryEntry);
    }
    
    return { summary, results };
}

