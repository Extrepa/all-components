/**
 * Multi-Phase Test Runner
 * 
 * Orchestrates execution of all phase test runners (A, B, C, D, E, F) in order.
 */

import { runPhaseATests } from './phaseATestRunner.js';
import { runPhaseBTests } from './phaseBTestRunner.js';
import { runPhaseCTests } from './phaseCTestRunner.js';
import { runPhaseDTests } from './phaseDTestRunner.js';
import { runPhaseETests } from './phaseETestRunner.js';
import { runPhaseFTests } from './phaseFTestRunner.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Phase configuration
 */
export const PHASES = {
    A: {
        name: 'Phase A: Complete Current Refactoring',
        runner: runPhaseATests,
        dependencies: []
    },
    B: {
        name: 'Phase B: Foundation Modules',
        runner: runPhaseBTests,
        dependencies: ['A']
    },
    C: {
        name: 'Phase C: Multiplayer Preparation',
        runner: runPhaseCTests,
        dependencies: ['B']
    },
    D: {
        name: 'Phase D: Multi-Room Architecture',
        runner: runPhaseDTests,
        dependencies: ['A']
    },
    E: {
        name: 'Phase E: UI Framework',
        runner: runPhaseETests,
        dependencies: ['A']
    },
    F: {
        name: 'Phase F: Production Readiness',
        runner: runPhaseFTests,
        dependencies: ['A']
    }
};

/**
 * Get path to multi-phase execution log
 */
function getExecutionLogPath() {
    const workspaceRoot = path.resolve(__dirname, '../../');
    return path.join(workspaceRoot, 'docs/testing/multi-phase-test-execution-log.md');
}

/**
 * Initialize multi-phase execution log
 */
function initializeExecutionLog() {
    const logPath = getExecutionLogPath();
    const header = `# Multi-Phase Test Execution Log

This log tracks the execution of all phases (A, B, C, D, E, F) with error detection and recovery.

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
 * Check if phase dependencies are met
 */
function checkDependencies(phase, completedPhases) {
    const phaseConfig = PHASES[phase];
    if (!phaseConfig) {
        return { canRun: false, reason: `Unknown phase: ${phase}` };
    }
    
    for (const dep of phaseConfig.dependencies) {
        if (!completedPhases.includes(dep)) {
            return { 
                canRun: false, 
                reason: `Phase ${phase} requires Phase ${dep} to be completed first` 
            };
        }
    }
    
    return { canRun: true };
}

/**
 * Run a specific phase
 */
export async function runPhase(page, phase, options = {}) {
    const phaseConfig = PHASES[phase];
    if (!phaseConfig) {
        throw new Error(`Unknown phase: ${phase}`);
    }
    
    console.log(`\n🚀 Starting ${phaseConfig.name}`);
    appendToExecutionLog(`# ${phaseConfig.name}\n\nStarting execution...\n`);
    
    const startTime = Date.now();
    const result = await phaseConfig.runner(page, options);
    const duration = Date.now() - startTime;
    
    const summary = {
        phase,
        name: phaseConfig.name,
        duration,
        ...result.summary
    };
    
    appendToExecutionLog(`## Phase ${phase} Summary

- **Duration**: ${duration}ms
- **Total Tests**: ${summary.total}
- **Passed**: ${summary.passed}
- **Failed**: ${summary.failed}
- **Blocked**: ${summary.blocked}
- **Has Blocking Errors**: ${summary.hasBlockingErrors ? 'Yes' : 'No'}
- **Status**: ${summary.hasBlockingErrors ? '❌ INCOMPLETE' : '✅ COMPLETE'}

`);
    
    return {
        phase,
        summary,
        results: result.results
    };
}

/**
 * Run multiple phases in order
 */
export async function runPhases(page, phases, options = {}) {
    const { stopOnError = false, logResults = true } = options;
    
    if (logResults) {
        initializeExecutionLog();
        appendToExecutionLog(`# Starting Multi-Phase Test Execution\n\nPhases to run: ${phases.join(', ')}\n`);
    }
    
    const completedPhases = [];
    const allResults = [];
    let hasBlockingErrors = false;
    
    for (const phase of phases) {
        // Check dependencies
        const depCheck = checkDependencies(phase, completedPhases);
        if (!depCheck.canRun) {
            console.error(`\n❌ Cannot run Phase ${phase}: ${depCheck.reason}`);
            appendToExecutionLog(`## Phase ${phase} Skipped\n\n**Reason**: ${depCheck.reason}\n`);
            continue;
        }
        
        try {
            const result = await runPhase(page, phase, options);
            allResults.push(result);
            completedPhases.push(phase);
            
            if (result.summary.hasBlockingErrors) {
                hasBlockingErrors = true;
                console.error(`\n❌ Phase ${phase} has blocking errors`);
                
                if (stopOnError) {
                    console.error(`\n🛑 Stopping execution due to blocking errors in Phase ${phase}`);
                    break;
                }
            } else {
                console.log(`\n✅ Phase ${phase} completed successfully`);
            }
        } catch (error) {
            console.error(`\n❌ Phase ${phase} failed with error:`, error.message);
            appendToExecutionLog(`## Phase ${phase} Failed\n\n**Error**: ${error.message}\n`);
            
            if (stopOnError) {
                throw error;
            }
        }
    }
    
    // Overall summary
    const overallSummary = {
        phasesRun: completedPhases.length,
        phasesRequested: phases.length,
        totalTests: allResults.reduce((sum, r) => sum + r.summary.total, 0),
        totalPassed: allResults.reduce((sum, r) => sum + r.summary.passed, 0),
        totalFailed: allResults.reduce((sum, r) => sum + r.summary.failed, 0),
        totalBlocked: allResults.reduce((sum, r) => sum + r.summary.blocked, 0),
        hasBlockingErrors
    };
    
    if (logResults) {
        const summaryEntry = `# Multi-Phase Test Execution Summary

- **Phases Run**: ${overallSummary.phasesRun} / ${overallSummary.phasesRequested}
- **Total Tests**: ${overallSummary.totalTests}
- **Total Passed**: ${overallSummary.totalPassed}
- **Total Failed**: ${overallSummary.totalFailed}
- **Total Blocked**: ${overallSummary.totalBlocked}
- **Has Blocking Errors**: ${overallSummary.hasBlockingErrors ? 'Yes' : 'No'}
- **Status**: ${overallSummary.hasBlockingErrors ? '❌ INCOMPLETE' : '✅ COMPLETE'}

## Phase Breakdown

${allResults.map(r => `- **Phase ${r.phase}**: ${r.summary.passed}/${r.summary.total} passed${r.summary.hasBlockingErrors ? ' (has blocking errors)' : ''}`).join('\n')}

`;
        appendToExecutionLog(summaryEntry);
    }
    
    return {
        summary: overallSummary,
        phaseResults: allResults
    };
}

/**
 * Run all phases in order (A → B → C → D → E → F)
 */
export async function runAllPhases(page, options = {}) {
    return runPhases(page, ['A', 'B', 'C', 'D', 'E', 'F'], options);
}

/**
 * Run phases from a specific phase onwards
 */
export async function runFromPhase(page, startPhase, options = {}) {
    const phaseOrder = ['A', 'B', 'C', 'D', 'E', 'F'];
    const startIndex = phaseOrder.indexOf(startPhase);
    
    if (startIndex === -1) {
        throw new Error(`Unknown phase: ${startPhase}`);
    }
    
    const phasesToRun = phaseOrder.slice(startIndex);
    return runPhases(page, phasesToRun, options);
}

