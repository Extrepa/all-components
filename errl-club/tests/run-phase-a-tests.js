#!/usr/bin/env node

/**
 * Phase A Test Runner
 * 
 * Runs all Phase A tests with automatic error recovery.
 * If a console error occurs, it attempts to fix it and retries.
 */

import { TestRunner } from './helpers/testRunner.js';

const testRunner = new TestRunner({
    maxRetries: 3,
    testTimeout: 60000
});

// Phase A test files in order
const phaseATests = [
    'tests/e2e/game-loads.spec.js',
    'tests/e2e/check-console-errors.spec.js',
    'tests/e2e/initialization.spec.js',
    'tests/e2e/audio-reactive-features.spec.js',
    'tests/e2e/post-processing-presets.spec.js',
    'tests/e2e/ui-component-initialization.spec.js',
    'tests/e2e/integration.spec.js'
];

const options = {
    headed: process.argv.includes('--headed'),
    workers: 1,
    project: 'chromium'
};

console.log('🚀 Starting Phase A Test Suite');
console.log(`   Mode: ${options.headed ? 'Headed' : 'Headless'}`);
console.log(`   Workers: ${options.workers}`);
console.log(`   Project: ${options.project}`);
console.log(`   Tests: ${phaseATests.length}\n`);

const results = await testRunner.runTests(phaseATests, options);

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Phase A Test Suite Results');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;

results.forEach(({ testFile, success, attempt }) => {
    const status = success ? '✅ PASSED' : '❌ FAILED';
    console.log(`${status} - ${testFile} (${attempt} attempt${attempt > 1 ? 's' : ''})`);
    if (success) passed++;
    else failed++;
});

console.log('='.repeat(60));
console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);

if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Review errors above.');
    process.exit(1);
} else {
    console.log('\n✅ All Phase A tests passed!');
    process.exit(0);
}

