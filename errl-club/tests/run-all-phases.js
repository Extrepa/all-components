#!/usr/bin/env node

/**
 * Master Test Execution Script
 * 
 * Runs all phases or specific phases of tests with error recovery.
 * 
 * Usage:
 *   node tests/run-all-phases.js --phase A|B|C|D|E|F
 *   node tests/run-all-phases.js --all
 *   node tests/run-all-phases.js --from-phase B
 *   node tests/run-all-phases.js --headed
 *   node tests/run-all-phases.js --workers 2
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    phase: null,
    all: false,
    fromPhase: null,
    headed: false,
    workers: 1
};

for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
        case '--phase':
            options.phase = args[++i];
            break;
        case '--all':
            options.all = true;
            break;
        case '--from-phase':
            options.fromPhase = args[++i];
            break;
        case '--headed':
            options.headed = true;
            break;
        case '--workers':
            options.workers = parseInt(args[++i], 10) || 1;
            break;
    }
}

// Determine which test files to run
function getTestFilesForPhase(phase) {
    const phaseTestFiles = {
        A: [
            'game-loads.spec.js',
            'initialization.spec.js',
            'audio-reactive-features.spec.js',
            'post-processing-presets.spec.js',
            'ui-component-initialization.spec.js',
            'integration.spec.js',
            'avatar-systems.spec.js',
            'interactions.spec.js',
            'collectibles.spec.js',
            'visual-effects.spec.js',
            'settings-persistence.spec.js'
        ],
        B: [
            'settings-persistence.spec.js',
            'integration.spec.js',
            'state-manager.spec.js',
            'event-bus.spec.js',
            'avatar-serialization.spec.js'
        ],
        C: [
            'connection.spec.js',
            'player-management.spec.js',
            'network-client.spec.js',
            'state-sync.spec.js',
            'network-events.spec.js'
        ],
        D: [
            'transitions.spec.js',
            'room-management.spec.js',
            'room-definition.spec.js',
            'asset-management.spec.js',
            'room-loading.spec.js'
        ],
        E: [
            'ui-component-initialization.spec.js',
            'ui-interactions.spec.js',
            'ui-systems.spec.js',
            'settings-panels.spec.js',
            'errl-phone.spec.js',
            'ui-manager.spec.js',
            'menu-system.spec.js',
            'ui-components.spec.js',
            'settings-management.spec.js'
        ],
        F: [
            'performance-monitoring.spec.js',
            'analytics.spec.js',
            'error-reporting.spec.js',
            'plugin-system.spec.js',
            'build-deployment.spec.js'
        ]
    };
    
    return phaseTestFiles[phase] || [];
}

// Build Playwright command
function buildPlaywrightCommand(testFiles, options) {
    const cmd = ['npx', 'playwright', 'test'];
    
    if (options.headed) {
        cmd.push('--headed');
    }
    
    cmd.push('--workers', options.workers.toString());
    cmd.push('--project', 'chromium');
    
    // Add test files
    testFiles.forEach(file => {
        cmd.push(`tests/e2e/${file}`);
    });
    
    return cmd;
}

// Run tests
async function runTests(testFiles, phase) {
    console.log(`\n🚀 Running Phase ${phase} tests (${testFiles.length} files)...\n`);
    
    const cmd = buildPlaywrightCommand(testFiles, options);
    console.log(`Command: ${cmd.join(' ')}\n`);
    
    return new Promise((resolve, reject) => {
        const child = spawn(cmd[0], cmd.slice(1), {
            stdio: 'inherit',
            shell: true,
            cwd: resolve(__dirname, '..')
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                console.log(`\n✅ Phase ${phase} tests completed successfully\n`);
                resolve(code);
            } else {
                console.error(`\n❌ Phase ${phase} tests failed with code ${code}\n`);
                reject(new Error(`Tests failed with code ${code}`));
            }
        });
        
        child.on('error', (error) => {
            console.error(`\n❌ Error running tests: ${error.message}\n`);
            reject(error);
        });
    });
}

// Main execution
async function main() {
    try {
        if (options.all) {
            // Run all phases in order
            const phases = ['A', 'B', 'C', 'D', 'E', 'F'];
            for (const phase of phases) {
                const testFiles = getTestFilesForPhase(phase);
                if (testFiles.length > 0) {
                    await runTests(testFiles, phase);
                }
            }
        } else if (options.fromPhase) {
            // Run from specific phase onwards
            const phases = ['A', 'B', 'C', 'D', 'E', 'F'];
            const startIndex = phases.indexOf(options.fromPhase);
            if (startIndex === -1) {
                throw new Error(`Unknown phase: ${options.fromPhase}`);
            }
            for (let i = startIndex; i < phases.length; i++) {
                const phase = phases[i];
                const testFiles = getTestFilesForPhase(phase);
                if (testFiles.length > 0) {
                    await runTests(testFiles, phase);
                }
            }
        } else if (options.phase) {
            // Run specific phase
            const testFiles = getTestFilesForPhase(options.phase);
            if (testFiles.length === 0) {
                throw new Error(`No test files found for phase ${options.phase}`);
            }
            await runTests(testFiles, options.phase);
        } else {
            // Default: run Phase A
            const testFiles = getTestFilesForPhase('A');
            await runTests(testFiles, 'A');
        }
        
        console.log('\n✅ All tests completed successfully!\n');
    } catch (error) {
        console.error('\n❌ Test execution failed:', error.message);
        process.exit(1);
    }
}

main();

