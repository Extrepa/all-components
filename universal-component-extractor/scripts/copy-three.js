import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const threePath = path.join(projectRoot, 'node_modules', 'three');
const publicLibsPath = path.join(projectRoot, 'public', 'libs', 'three');

// Create directories
fs.mkdirSync(publicLibsPath, { recursive: true });

// Copy three.module.js (ES module build)
const threeModuleSrc = path.join(threePath, 'build', 'three.module.js');
const threeModuleDest = path.join(publicLibsPath, 'three.module.js');
if (fs.existsSync(threeModuleSrc)) {
  fs.copyFileSync(threeModuleSrc, threeModuleDest);
  console.log('✓ Copied three.module.js');
} else {
  console.warn('⚠ three.module.js not found');
}

// Copy three.min.js (UMD build for compatibility)
const threeMinSrc = path.join(threePath, 'build', 'three.min.js');
const threeMinDest = path.join(publicLibsPath, 'three.min.js');
if (fs.existsSync(threeMinSrc)) {
  fs.copyFileSync(threeMinSrc, threeMinDest);
  console.log('✓ Copied three.min.js');
} else {
  console.warn('⚠ three.min.js not found');
}

// Copy OrbitControls and create addons structure
const orbitControlsSrc = path.join(threePath, 'examples', 'jsm', 'controls', 'OrbitControls.js');
const orbitControlsDest = path.join(publicLibsPath, 'OrbitControls.js');
if (fs.existsSync(orbitControlsSrc)) {
  fs.mkdirSync(path.dirname(orbitControlsDest), { recursive: true });
  fs.copyFileSync(orbitControlsSrc, orbitControlsDest);
  console.log('✓ Copied OrbitControls.js');
} else {
  console.warn('⚠ OrbitControls.js not found');
}

// Also copy to controls/ subdirectory for three/addons/ path
const controlsDir = path.join(publicLibsPath, 'controls');
fs.mkdirSync(controlsDir, { recursive: true });
if (fs.existsSync(orbitControlsSrc)) {
  fs.copyFileSync(orbitControlsSrc, path.join(controlsDir, 'OrbitControls.js'));
  console.log('✓ Copied OrbitControls.js to controls/');
}

console.log('✓ Three.js files copied to public/libs/three');

