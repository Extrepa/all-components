/**
 * Test Runner with Error Recovery
 * 
 * This helper runs tests and automatically fixes console errors, then retries.
 * If a console error occurs:
 * 1. Captures the error
 * 2. Attempts to fix the code
 * 3. Retries the test from the beginning
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export class TestRunner {
    constructor(options = {}) {
        this.maxRetries = options.maxRetries || 3;
        this.testTimeout = options.testTimeout || 60000;
        this.consoleErrorPatterns = this.loadErrorPatterns();
    }

    /**
     * Load known error patterns and their fixes
     */
    loadErrorPatterns() {
        return [
            {
                pattern: /LoadingScreen|loadingScreen|loading-screen/g,
                fix: (error, file) => {
                    // Replace LoadingScreen references with MainMenu
                    if (file && fs.existsSync(file)) {
                        let content = fs.readFileSync(file, 'utf8');
                        const original = content;
                        content = content.replace(/LoadingScreen/g, 'MainMenu');
                        content = content.replace(/loadingScreen/g, 'mainMenu');
                        content = content.replace(/loading-screen/g, 'main-menu');
                        if (content !== original) {
                            fs.writeFileSync(file, content, 'utf8');
                            return true;
                        }
                    }
                    return false;
                },
                description: 'Replace LoadingScreen with MainMenu'
            },
            {
                pattern: /is not a function|Cannot read property|undefined is not an object/g,
                fix: (error, file) => {
                    // This is a generic error - would need specific context
                    console.log('Generic error detected - needs manual investigation');
                    return false;
                },
                description: 'Function/property access error'
            }
        ];
    }

    /**
     * Extract file path from error stack trace
     */
    extractFilePath(error) {
        const stack = error.stack || error;
        const match = stack.match(/\(([^:]+):\d+:\d+\)/);
        if (match) {
            return match[1];
        }
        // Try alternative format
        const match2 = stack.match(/at\s+([^:]+):\d+:\d+/);
        if (match2) {
            return match2[1];
        }
        return null;
    }

    /**
     * Attempt to fix an error
     */
    async attemptFix(error, testFile) {
        console.log(`\n🔧 Attempting to fix error: ${error.message || error}`);
        
        const filePath = this.extractFilePath(error);
        const targetFile = filePath || testFile;
        
        for (const errorPattern of this.consoleErrorPatterns) {
            if (errorPattern.pattern.test(error.message || error.toString())) {
                console.log(`  → Applying fix: ${errorPattern.description}`);
                const fixed = errorPattern.fix(error, targetFile);
                if (fixed) {
                    console.log(`  ✅ Fix applied to ${targetFile}`);
                    return true;
                }
            }
        }
        
        console.log(`  ⚠️  No automatic fix available for this error`);
        return false;
    }

    /**
     * Run a test with error recovery
     */
    async runTest(testFile, options = {}) {
        const { headed = false, workers = 1, project = 'chromium' } = options;
        let attempt = 0;
        let lastError = null;

        while (attempt < this.maxRetries) {
            attempt++;
            console.log(`\n🧪 Running test: ${testFile} (Attempt ${attempt}/${this.maxRetries})`);

            try {
                const errors = [];
                const command = `FORCE_COLOR= NO_COLOR=1 NODE_NO_WARNINGS=1 npx playwright test ${headed ? '--headed' : ''} --workers=${workers} --project=${project} ${testFile}`;
                
                // Run test and capture output
                const output = execSync(command, { 
                    encoding: 'utf8',
                    maxBuffer: 10 * 1024 * 1024,
                    stdio: 'pipe'
                });

                console.log(output);
                console.log(`\n✅ Test passed: ${testFile}`);
                return { success: true, attempt };

            } catch (error) {
                lastError = error;
                const errorOutput = error.stdout?.toString() || error.stderr?.toString() || error.message;
                console.log(`\n❌ Test failed on attempt ${attempt}:`);
                console.log(errorOutput);

                // Check for console errors in output
                const consoleErrorMatch = errorOutput.match(/CONSOLE ERROR:|PAGE ERROR:([^\n]+)/g);
                if (consoleErrorMatch) {
                    console.log(`\n🔍 Console errors detected:`);
                    consoleErrorMatch.forEach(err => console.log(`  - ${err}`));

                    // Attempt to fix
                    const fixed = await this.attemptFix(
                        { message: errorOutput, stack: errorOutput },
                        testFile
                    );

                    if (fixed) {
                        console.log(`\n🔄 Retrying test after fix...`);
                        continue; // Retry
                    } else {
                        console.log(`\n⚠️  Could not auto-fix error. Manual intervention needed.`);
                        break;
                    }
                } else {
                    // Test failure but no console errors - might be a test logic issue
                    console.log(`\n⚠️  Test failed but no console errors detected.`);
                    break;
                }
            }
        }

        return { 
            success: false, 
            attempt, 
            error: lastError 
        };
    }

    /**
     * Run multiple tests sequentially with error recovery
     */
    async runTests(testFiles, options = {}) {
        const results = [];
        
        for (const testFile of testFiles) {
            const result = await this.runTest(testFile, options);
            results.push({ testFile, ...result });
            
            if (!result.success) {
                console.log(`\n⛔ Stopping test suite due to failure in: ${testFile}`);
                break;
            }
        }
        
        return results;
    }
}

