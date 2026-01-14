import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distElectron = path.join(__dirname, '..', 'dist-electron');

// Rename main.js to main.cjs
const mainJs = path.join(distElectron, 'main.js');
const mainCjs = path.join(distElectron, 'main.cjs');
if (fs.existsSync(mainJs)) {
  fs.renameSync(mainJs, mainCjs);
  console.log('Renamed main.js to main.cjs');
}

// Rename preload.js to preload.cjs
const preloadJs = path.join(distElectron, 'preload.js');
const preloadCjs = path.join(distElectron, 'preload.cjs');
if (fs.existsSync(preloadJs)) {
  fs.renameSync(preloadJs, preloadCjs);
  console.log('Renamed preload.js to preload.cjs');
}

