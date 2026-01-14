const fs = require('fs');
const path = require('path');

const SOURCE_ROOT = '/Users/extrepa/Desktop/Android 69 - Jan 2027/ErrlProjects';
const DEST_ROOT = '/Users/extrepa/Projects/all-components/errl-html-demos';
const REPORT_PATH = path.join(DEST_ROOT, 'asset-copy-report.json');

const attributeRegex = /\b(?:src|href|poster|srcset)\s*=\s*["']([^"']+)["']/gi;
const urlRegex = /url\(\s*['"]?([^'")]+)['"]?\s*\)/gi;

function listHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
      results.push(fullPath);
    }
  }

  return results;
}

function isSkippableAsset(rawPath) {
  if (!rawPath) return true;
  const trimmed = rawPath.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith('#')) return true;
  if (trimmed.startsWith('data:')) return true;
  if (trimmed.startsWith('mailto:')) return true;
  if (trimmed.startsWith('tel:')) return true;
  if (trimmed.startsWith('javascript:')) return true;
  if (trimmed.startsWith('blob:')) return true;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('//')) return true;
  if (trimmed.includes('${') || trimmed.includes('<%')) return true;
  return false;
}

function normalizeAssetPath(rawPath) {
  let decoded = rawPath.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // keep original if decoding fails
  }

  if (decoded === 'blob' || decoded === 'url' || decoded === '...' || decoded.includes('...')) {
    return '';
  }

  const withoutQuery = decoded.split('#')[0].split('?')[0].trim();
  return withoutQuery;
}

function resolveRelativeAsset(htmlPath, rawAsset) {
  if (isSkippableAsset(rawAsset)) return null;

  const assetPath = normalizeAssetPath(rawAsset);
  if (!assetPath) return null;
  if (assetPath.startsWith('#')) return null;
  if (assetPath.toLowerCase().endsWith('.html')) return null;
  if (assetPath.endsWith('/')) return null;

  if (assetPath.startsWith('/')) {
    return assetPath.slice(1);
  }

  const htmlDir = path.dirname(htmlPath);
  const resolved = path.resolve(htmlDir, assetPath);
  return path.relative(DEST_ROOT, resolved).replace(/\\/g, '/');
}

function extractAssets(htmlPath) {
  const content = fs.readFileSync(htmlPath, 'utf8');
  const assets = new Set();

  const addAsset = (value) => {
    if (!value) return;
    if (value.includes(',')) {
      const parts = value.split(',').map((part) => part.trim().split(' ')[0]);
      parts.forEach((part) => {
        const resolved = resolveRelativeAsset(htmlPath, part);
        if (resolved) assets.add(resolved);
      });
      return;
    }
    const resolved = resolveRelativeAsset(htmlPath, value);
    if (resolved) assets.add(resolved);
  };

  let match;
  while ((match = attributeRegex.exec(content)) !== null) {
    addAsset(match[1]);
  }

  while ((match = urlRegex.exec(content)) !== null) {
    addAsset(match[1]);
  }

  return Array.from(assets);
}

function copyAsset(relativePath, report) {
  const source = path.join(SOURCE_ROOT, relativePath);
  const dest = path.join(DEST_ROOT, relativePath);

  if (fs.existsSync(dest)) {
    report.skippedExisting.push(relativePath);
    return;
  }

  if (!fs.existsSync(source)) {
    report.missing.push(relativePath);
    return;
  }

  const stat = fs.statSync(source);
  if (!stat.isFile()) {
    report.missing.push(relativePath);
    return;
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(source, dest);
  report.copied.push(relativePath);
}

function main() {
  if (!fs.existsSync(DEST_ROOT)) {
    console.error(`Destination folder not found: ${DEST_ROOT}`);
    process.exit(1);
  }

  const htmlFiles = listHtmlFiles(DEST_ROOT);
  const allAssets = new Set();

  htmlFiles.forEach((htmlPath) => {
    const assets = extractAssets(htmlPath);
    assets.forEach((asset) => allAssets.add(asset));
  });

  const report = {
    generatedAt: new Date().toISOString(),
    htmlFiles: htmlFiles.length,
    assetsFound: allAssets.size,
    copied: [],
    skippedExisting: [],
    missing: [],
  };

  allAssets.forEach((asset) => copyAsset(asset, report));

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');

  console.log(`HTML files scanned: ${report.htmlFiles}`);
  console.log(`Assets found: ${report.assetsFound}`);
  console.log(`Copied: ${report.copied.length}`);
  console.log(`Already existed: ${report.skippedExisting.length}`);
  console.log(`Missing: ${report.missing.length}`);
  console.log(`Report: ${REPORT_PATH}`);
}

if (require.main === module) {
  main();
}
