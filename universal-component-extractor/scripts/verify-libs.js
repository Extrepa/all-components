#!/usr/bin/env node
/**
 * Library Verification Script
 * Verifies all required libraries are present and accessible
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const publicLibsPath = path.join(projectRoot, 'public', 'libs');

const requiredLibraries = {
  'three/three.module.js': 'Three.js ES Module',
  'three/three.min.js': 'Three.js UMD Build',
  'three/OrbitControls.js': 'Three.js OrbitControls',
  'three/controls/OrbitControls.js': 'Three.js OrbitControls (controls/)',
  'p5/p5.min.js': 'p5.js',
  'babel/babel.min.js': 'Babel Standalone',
  'react/react.development.js': 'React UMD',
  'react/react-dom.development.js': 'ReactDOM UMD',
};

function verifyLibrary(libPath, name) {
  const fullPath = path.join(publicLibsPath, libPath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Missing: ${name} (${libPath})`);
    return false;
  }
  
  try {
    const stats = fs.statSync(fullPath);
    if (stats.size === 0) {
      console.warn(`⚠ Empty: ${name} (${libPath})`);
      return false;
    }
    
    // Check if file is readable
    fs.accessSync(fullPath, fs.constants.R_OK);
    
    console.log(`✓ ${name} (${(stats.size / 1024).toFixed(1)} KB)`);
    return true;
  } catch (error) {
    console.error(`❌ Cannot read: ${name} (${libPath}) - ${error.message}`);
    return false;
  }
}

console.log('🔍 Verifying library accessibility...\n');

let allValid = true;
for (const [libPath, name] of Object.entries(requiredLibraries)) {
  if (!verifyLibrary(libPath, name)) {
    allValid = false;
  }
}

console.log('\n' + '='.repeat(50));

if (allValid) {
  console.log('✅ All libraries are accessible and ready!');
  process.exit(0);
} else {
  console.log('❌ Some libraries are missing or inaccessible.');
  console.log('\nRun: npm run copy-libs');
  process.exit(1);
}

