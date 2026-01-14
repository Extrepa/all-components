import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';

// Read package.json
const packageJsonPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const nodeModulesPath = path.join(projectRoot, 'node_modules');
const publicLibsPath = path.join(projectRoot, 'public', 'libs');

// Helper function to download files
const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 200 || response.statusCode === 302) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
};

const cleanVersion = (version, defaultVersion = '') => {
  if (!version) return defaultVersion;
  return version.replace(/^[^0-9]*/, '');
};

const getMajor = (version) => {
  const cleaned = cleanVersion(version);
  const major = parseInt(cleaned.split('.')[0], 10);
  return Number.isFinite(major) ? major : 0;
};

const reactVersion = cleanVersion(pkg.dependencies?.react, '18.2.0');
const reactDomVersion = cleanVersion(pkg.dependencies?.['react-dom'], reactVersion);
const fallbackReactVersion = '18.2.0';

const ensureReactUmd = async (label, version, fallbackVersion, dest) => {
  if (fs.existsSync(dest)) {
    console.log(`✓ ${label} already exists (${path.basename(dest)})`);
    return;
  }

  const pkgName = label === 'ReactDOM' ? 'react-dom' : 'react';
  const urlFor = (ver) => `https://unpkg.com/${pkgName}@${ver}/umd/${pkgName === 'react-dom' ? 'react-dom.development.js' : 'react.development.js'}`;

  try {
    console.log(`📥 Downloading ${label} UMD (${version})...`);
    await downloadFile(urlFor(version), dest);
    console.log(`✓ Downloaded ${label} (${version})`);
  } catch (err) {
    if (getMajor(version) >= 19 && fallbackVersion) {
      console.warn(`⚠ ${label} ${version} UMD not available; falling back to ${fallbackVersion}`);
      try {
        await downloadFile(urlFor(fallbackVersion), dest);
        console.log(`✓ Downloaded ${label} fallback (${fallbackVersion})`);
        return;
      } catch (fallbackErr) {
        console.warn(`⚠ Failed to download ${label} fallback (${fallbackVersion}): ${fallbackErr.message}`);
      }
    }
    console.warn(`⚠ Failed to download ${label} (${version}): ${err.message}`);
  }
};

// Main function
// Library Management Strategy:
// - Libraries are stored locally in public/libs/ for offline support
// - Copied from node_modules during build (ensures version consistency with package.json)
// - React UMD builds downloaded from CDN as fallback (not in node_modules)
// - Uses both ES modules (three.module.js) and UMD (three.min.js) for flexibility
// - All library versions are locked in package.json for reproducible builds
// - This approach provides: offline support, version control, faster loading, no CDN dependency
(async () => {
  // Create libs directory
  fs.mkdirSync(publicLibsPath, { recursive: true });

  console.log('📦 Copying libraries to public/libs...\n');

  // 1. Copy Three.js
  const threePath = path.join(nodeModulesPath, 'three');
  const threeLibsPath = path.join(publicLibsPath, 'three');
  fs.mkdirSync(threeLibsPath, { recursive: true });

  const threeModuleSrc = path.join(threePath, 'build', 'three.module.js');
  const threeModuleDest = path.join(threeLibsPath, 'three.module.js');
  if (fs.existsSync(threeModuleSrc)) {
    fs.copyFileSync(threeModuleSrc, threeModuleDest);
    console.log('✓ Copied three.module.js');
  } else {
    console.warn('⚠ three.module.js not found');
  }

  const threeMinSrc = path.join(threePath, 'build', 'three.min.js');
  const threeMinDest = path.join(threeLibsPath, 'three.min.js');
  if (fs.existsSync(threeMinSrc)) {
    fs.copyFileSync(threeMinSrc, threeMinDest);
    console.log('✓ Copied three.min.js');
  } else {
    console.warn('⚠ three.min.js not found');
  }

  const orbitControlsSrc = path.join(threePath, 'examples', 'jsm', 'controls', 'OrbitControls.js');
  const orbitControlsDest = path.join(threeLibsPath, 'OrbitControls.js');
  if (fs.existsSync(orbitControlsSrc)) {
    fs.mkdirSync(path.dirname(orbitControlsDest), { recursive: true });
    fs.copyFileSync(orbitControlsSrc, orbitControlsDest);
    console.log('✓ Copied OrbitControls.js');
    
    const controlsDir = path.join(threeLibsPath, 'controls');
    fs.mkdirSync(controlsDir, { recursive: true });
    fs.copyFileSync(orbitControlsSrc, path.join(controlsDir, 'OrbitControls.js'));
    console.log('✓ Copied OrbitControls.js to controls/');
  } else {
    console.warn('⚠ OrbitControls.js not found');
  }

  // 2. Copy p5.js
  const p5Path = path.join(nodeModulesPath, 'p5');
  const p5LibsPath = path.join(publicLibsPath, 'p5');
  fs.mkdirSync(p5LibsPath, { recursive: true });

  const p5MinSrc = path.join(p5Path, 'lib', 'p5.min.js');
  const p5MinDest = path.join(p5LibsPath, 'p5.min.js');
  if (fs.existsSync(p5MinSrc)) {
    fs.copyFileSync(p5MinSrc, p5MinDest);
    console.log('✓ Copied p5.min.js');
  } else {
    const p5AltSrc = path.join(p5Path, 'p5.min.js');
    if (fs.existsSync(p5AltSrc)) {
      fs.copyFileSync(p5AltSrc, p5MinDest);
      console.log('✓ Copied p5.min.js (alternate path)');
    } else {
      console.warn('⚠ p5.min.js not found');
    }
  }

  // 3. Copy Babel Standalone
  const babelPath = path.join(nodeModulesPath, '@babel', 'standalone');
  const babelLibsPath = path.join(publicLibsPath, 'babel');
  fs.mkdirSync(babelLibsPath, { recursive: true });

  const babelMinSrc = path.join(babelPath, 'babel.min.js');
  const babelMinDest = path.join(babelLibsPath, 'babel.min.js');
  if (fs.existsSync(babelMinSrc)) {
    fs.copyFileSync(babelMinSrc, babelMinDest);
    console.log('✓ Copied babel.min.js');
  } else {
    console.warn('⚠ babel.min.js not found');
  }

  // 4. Download React & ReactDOM UMD builds
  const reactLibsPath = path.join(publicLibsPath, 'react');
  fs.mkdirSync(reactLibsPath, { recursive: true });
  
  const reactUMDDest = path.join(reactLibsPath, 'react.development.js');
  const reactDomUMDDest = path.join(reactLibsPath, 'react-dom.development.js');

  await ensureReactUmd('React', reactVersion, fallbackReactVersion, reactUMDDest);
  await ensureReactUmd('ReactDOM', reactDomVersion, fallbackReactVersion, reactDomUMDDest);

  console.log('\n✅ All libraries copied to public/libs/');
})();
