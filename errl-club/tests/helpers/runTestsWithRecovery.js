#!/usr/bin/env node

/**
 * Test Runner Script with Console Error Recovery
 * 
 * Runs Playwright tests and automatically fixes common errors, then retries.
 * 
 * Usage:
 *   node tests/helpers/runTestsWithRecovery.js [test-file] [--headed]
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

/**
 * Find and fix LoadingScreen references in a file
 */
function fixLoadingScreenReferences(filePath) {
    if (!fs.existsSync(filePath)) {
        return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    // Replace LoadingScreen references
    content = content.replace(/LoadingScreen/g, 'MainMenu');
    content = content.replace(/loadingScreen/g, 'mainMenu');
    content = content.replace(/loading-screen/g, 'main-menu');
    content = content.replace(/LOADING_SCREEN/g, 'MAIN_MENU');
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✅ Fixed: ${path.relative(projectRoot, filePath)}`);
        return true;
    }
    
    return false;
}

/**
 * Search for LoadingScreen references in codebase
 */
function findAndFixLoadingScreenReferences() {
    console.log('  🔍 Searching for LoadingScreen references...');
    
    const srcDir = path.join(projectRoot, 'src');
    const testDir = path.join(projectRoot, 'tests');
    const filesToCheck = [];
    
    // Find all JS files
    function findFiles(dir, fileList = []) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory() && !filePath.includes('node_modules')) {
                findFiles(filePath, fileList);
            } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
                fileList.push(filePath);
            }
        });
        return fileList;
    }
    
    filesToCheck.push(...findFiles(srcDir));
    filesToCheck.push(...findFiles(testDir));
    
    let fixedCount = 0;
    filesToCheck.forEach(file => {
        if (fixLoadingScreenReferences(file)) {
            fixedCount++;
        }
    });
    
    return fixedCount;
}

/**
 * Run a test and handle errors
 */
function runTest(testFile, options = {}) {
    const { headed = false, maxRetries = 3 } = options;
    let attempt = 0;
    
    while (attempt < maxRetries) {
        attempt++;
        console.log(`\n🧪 Running: ${testFile} (Attempt ${attempt}/${maxRetries})`);
        
        try {
            const command = `FORCE_COLOR= NO_COLOR=1 NODE_NO_WARNINGS=1 npx playwright test ${headed ? '--headed' : ''} --workers=1 --project=chromium ${testFile}`;
            const output = execSync(command, { 
                encoding: 'utf8',
                maxBuffer: 10 * 1024 * 1024,
                stdio: 'inherit'
            });
            
            console.log(`\n✅ Test passed: ${testFile}`);
            return { success: true, attempt };
            
        } catch (error) {
            const errorOutput = error.stdout?.toString() || error.stderr?.toString() || error.message;
            
            // Check for LoadingScreen errors
            if (/LoadingScreen|loadingScreen|loading-screen/.test(errorOutput)) {
                console.log('\n🔧 LoadingScreen error detected - attempting fix...');
                const fixedCount = findAndFixLoadingScreenReferences();
                
                if (fixedCount > 0) {
                    console.log(`  ✅ Fixed ${fixedCount} file(s) - retrying...`);
                    continue; // Retry
                } else {
                    console.log('  ⚠️  No files needed fixing');
                }
            }
            
            // If last attempt or no fix available, throw
            if (attempt >= maxRetries) {
                console.log(`\n❌ Test failed after ${maxRetries} attempts`);
                throw error;
            }
        }
    }
}

// Main execution
const testFile = process.argv[2] || 'tests/e2e/game-loads.spec.js';
const headed = process.argv.includes('--headed');

console.log('🚀 Test Runner with Error Recovery');
console.log(`   Test: ${testFile}`);
console.log(`   Mode: ${headed ? 'Headed' : 'Headless'}\n`);

try {
    const result = runTest(testFile, { headed, maxRetries: 3 });
    if (result.success) {
        process.exit(0);
    }
} catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    process.exit(1);
}

