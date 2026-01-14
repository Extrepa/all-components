#!/usr/bin/env node

/**
 * Component Catalog Generator
 * Scans the all-components directory and generates components-data.json
 */

const fs = require('fs');
const path = require('path');

const COMPONENT_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', '.npm-cache', '.DS_Store'];
const IGNORE_PROJECT_DIRS = new Set([
  ...IGNORE_DIRS,
  '_archive',
  '_Resources',
  '05-Logs',
  'preview',
  'docs',
  'tools'
]);

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
  'inspector', 'ruler', 'rulers',
  'list', 'grid', 'table', 'toast', 'tooltip', 'dropdown', 'select',
  'checkbox', 'radio', 'switch', 'slider', 'pagination', 'breadcrumb',
  'avatar', 'badge', 'chip', 'pill', 'tag', 'drawer', 'sheet', 'popover',
  'overlay', 'banner', 'carousel', 'dock', 'tray'
];

function shouldIgnoreDir(dirName) {
  return IGNORE_DIRS.includes(dirName) || dirName.startsWith('.');
}

function shouldIgnoreProjectDir(dirName) {
  return IGNORE_PROJECT_DIRS.has(dirName) || dirName.startsWith('.');
}

function isComponentFile(fileName) {
  if (fileName.startsWith('._')) {
    return false;
  }
  return COMPONENT_EXTENSIONS.some(ext => fileName.endsWith(ext));
}

function getFileType(fileName) {
  if (fileName.endsWith('.tsx')) return 'tsx';
  if (fileName.endsWith('.ts')) return 'ts';
  if (fileName.endsWith('.jsx')) return 'jsx';
  if (fileName.endsWith('.js')) return 'js';
  return 'unknown';
}

function isPreviewableComponent(relativePath, componentName) {
  const normalized = `/${relativePath.replace(/\\/g, '/').toLowerCase()}`;
  const name = componentName.toLowerCase();

  if (normalized.includes('/tests/') || normalized.includes('/__tests__/') || normalized.includes('/spec/')) {
    return false;
  }

  if (name.endsWith('.spec') || name.endsWith('.test')) {
    return false;
  }

  if (UI_PATH_KEYWORDS.some(keyword => normalized.includes(keyword))) {
    return true;
  }

  return UI_NAME_KEYWORDS.some(keyword => name.includes(keyword));
}

function getProjectDirs(rootDir) {
  return fs.readdirSync(rootDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && !shouldIgnoreProjectDir(entry.name))
    .map(entry => entry.name);
}

function scanDirectory(dirPath, basePath) {
  const components = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(basePath, fullPath);

    if (entry.isDirectory()) {
      if (!shouldIgnoreDir(entry.name)) {
        components.push(...scanDirectory(fullPath, basePath));
      }
    } else if (entry.isFile() && isComponentFile(entry.name)) {
      const componentName = path.basename(entry.name, path.extname(entry.name));
      const previewable = isPreviewableComponent(relativePath, componentName);
      components.push({
        name: componentName,
        path: relativePath.replace(/\\/g, '/'),
        type: getFileType(entry.name),
        previewable
      });
    }
  }

  return components;
}

function generateCatalog(rootDir) {
  const catalog = {};
  const projectDirs = getProjectDirs(rootDir);

  for (const projectDir of projectDirs) {
    const projectPath = path.join(rootDir, projectDir);
    
    if (!fs.existsSync(projectPath)) {
      console.warn(`Project directory not found: ${projectDir}`);
      continue;
    }

    const components = scanDirectory(projectPath, projectPath);
    
    if (components.length > 0) {
      catalog[projectDir] = {
        path: projectDir,
        components: components.sort((a, b) => a.name.localeCompare(b.name))
      };
      console.log(`Found ${components.length} components in ${projectDir}`);
    }
  }

  return catalog;
}

function main() {
  const rootDir = process.cwd();
  const outputFile = path.join(rootDir, 'components-data.json');

  console.log('Scanning for components...');
  const catalog = generateCatalog(rootDir);

  const totalComponents = Object.values(catalog).reduce(
    (sum, project) => sum + project.components.length,
    0
  );

  console.log(`\nTotal: ${totalComponents} components across ${Object.keys(catalog).length} projects`);

  fs.writeFileSync(
    outputFile,
    JSON.stringify(catalog, null, 2),
    'utf8'
  );

  console.log(`\nCatalog written to: ${outputFile}`);
}

if (require.main === module) {
  main();
}

module.exports = { generateCatalog, scanDirectory };
