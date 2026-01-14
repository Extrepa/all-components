#!/usr/bin/env node

/*
 * Collect UI components from in-progress projects and copy into all-components.
 */

const fs = require('fs');
const path = require('path');

const ROOTS = [
  '/Users/extrepa/Projects',
  '/Users/extrepa/Desktop/Android 69 - Jan 2027/ErrlProjects'
];

const DEST_ROOT = process.cwd();

const EXCLUDED_PROJECTS = new Set([
  'all-components',
  'errl-portal',
  'errl-portal-shared'
]);

const EXCLUDED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '.cache',
  '.npm-cache'
]);

const COMPONENT_EXTENSIONS = new Set(['.tsx', '.jsx', '.ts', '.js']);

const UI_PATH_KEYWORDS = [
  '/components/',
  '/component/',
  '/ui/',
  '/screens/',
  '/screen/',
  '/views/',
  '/view/',
  '/panels/',
  '/panel/',
  '/widgets/',
  '/widget/',
  '/layouts/',
  '/layout/',
  '/modals/',
  '/modal/',
  '/dialogs/',
  '/dialog/',
  '/overlays/',
  '/overlay/',
  '/controls/',
  '/control/',
  '/forms/',
  '/form/',
  '/inputs/',
  '/input/',
  '/buttons/',
  '/button/',
  '/menus/',
  '/menu/',
  '/nav/',
  '/navbar/',
  '/sidebar/',
  '/header/',
  '/footer/',
  '/toolbar/',
  '/dock/',
  '/tray/'
];

const UI_NAME_KEYWORDS = [
  'button', 'card', 'input', 'field', 'form', 'modal', 'dialog', 'panel', 'menu',
  'toolbar', 'header', 'footer', 'sidebar', 'nav', 'navbar', 'tabs', 'tab',
  'list', 'grid', 'table', 'toast', 'tooltip', 'dropdown', 'select',
  'checkbox', 'radio', 'switch', 'slider', 'pagination', 'breadcrumb',
  'avatar', 'badge', 'chip', 'pill', 'tag', 'drawer', 'sheet', 'popover',
  'overlay', 'banner', 'carousel', 'dock', 'tray'
];

function shouldIgnoreDir(name) {
  if (name.startsWith('.')) return true;
  return EXCLUDED_DIRS.has(name);
}

function isComponentFile(filePath) {
  return COMPONENT_EXTENSIONS.has(path.extname(filePath));
}

function isUiComponent(filePath) {
  const normalized = filePath.replace(/\\/g, '/').toLowerCase();
  const baseName = path.basename(normalized, path.extname(normalized));

  if (UI_PATH_KEYWORDS.some(keyword => normalized.includes(keyword))) {
    return true;
  }

  return UI_NAME_KEYWORDS.some(keyword => baseName.includes(keyword));
}

function scanForUiComponents(projectRoot) {
  const results = [];

  function walk(currentDir) {
    let entries = [];
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch (error) {
      return;
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (shouldIgnoreDir(entry.name)) continue;
        walk(path.join(currentDir, entry.name));
      } else if (entry.isFile()) {
        const fullPath = path.join(currentDir, entry.name);
        if (!isComponentFile(fullPath)) continue;

        const relPath = path.relative(projectRoot, fullPath);
        if (isUiComponent(relPath)) {
          results.push({ fullPath, relPath });
        }
      }
    }
  }

  walk(projectRoot);
  return results;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyFile(source, destination) {
  ensureDir(path.dirname(destination));

  if (fs.existsSync(destination)) {
    const srcContent = fs.readFileSync(source);
    const destContent = fs.readFileSync(destination);
    if (srcContent.equals(destContent)) {
      return 'skipped';
    }
  }

  fs.copyFileSync(source, destination);
  return fs.existsSync(destination) ? 'copied' : 'failed';
}

function collectFromRoot(root) {
  const stats = {
    projects: 0,
    filesCopied: 0,
    filesSkipped: 0,
    filesFailed: 0,
    filesFound: 0
  };

  let entries = [];
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch (error) {
    console.warn(`Skipping root (cannot read): ${root}`);
    return stats;
  }

  entries
    .filter(entry => entry.isDirectory())
    .forEach(entry => {
      const projectName = entry.name;
      if (EXCLUDED_PROJECTS.has(projectName) || projectName.startsWith('.')) {
        return;
      }

      const projectRoot = path.join(root, projectName);
      const uiComponents = scanForUiComponents(projectRoot);

      if (uiComponents.length === 0) {
        return;
      }

      stats.projects += 1;
      stats.filesFound += uiComponents.length;

      const destProjectRoot = path.join(DEST_ROOT, projectName);

      uiComponents.forEach(({ fullPath, relPath }) => {
        const destPath = path.join(destProjectRoot, relPath);
        const result = copyFile(fullPath, destPath);

        if (result === 'copied') stats.filesCopied += 1;
        else if (result === 'skipped') stats.filesSkipped += 1;
        else stats.filesFailed += 1;
      });
    });

  return stats;
}

function main() {
  const overall = {
    projects: 0,
    filesCopied: 0,
    filesSkipped: 0,
    filesFailed: 0,
    filesFound: 0
  };

  ROOTS.forEach(root => {
    const stats = collectFromRoot(root);
    overall.projects += stats.projects;
    overall.filesCopied += stats.filesCopied;
    overall.filesSkipped += stats.filesSkipped;
    overall.filesFailed += stats.filesFailed;
    overall.filesFound += stats.filesFound;

    console.log(`\nRoot: ${root}`);
    console.log(`  Projects with UI components: ${stats.projects}`);
    console.log(`  UI component files found: ${stats.filesFound}`);
    console.log(`  Files copied: ${stats.filesCopied}`);
    console.log(`  Files skipped (already same): ${stats.filesSkipped}`);
    console.log(`  Files failed: ${stats.filesFailed}`);
  });

  console.log('\nOverall:');
  console.log(`  Projects with UI components: ${overall.projects}`);
  console.log(`  UI component files found: ${overall.filesFound}`);
  console.log(`  Files copied: ${overall.filesCopied}`);
  console.log(`  Files skipped (already same): ${overall.filesSkipped}`);
  console.log(`  Files failed: ${overall.filesFailed}`);
}

if (require.main === module) {
  main();
}
