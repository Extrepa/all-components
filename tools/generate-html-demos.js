const fs = require('fs');
const path = require('path');

const ROOT_DIR = '/Users/extrepa/Projects/all-components';
const DEMOS_DIR = path.join(ROOT_DIR, 'errl-html-demos');
const OUTPUT_FILE = path.join(DEMOS_DIR, 'errl-html-demos.json');

function listHtmlFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    if (entry.name.startsWith('._') || entry.name === '__MACOSX') {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
      if (entry.name === 'errl-html-demos.json') {
        continue;
      }
      results.push(fullPath);
    }
  }

  return results;
}

function buildDemoName(relativePath) {
  const base = relativePath.replace(/\\/g, '/').replace(/\.html$/i, '');
  const parts = base.split('/').filter(Boolean);
  const fileName = parts[parts.length - 1] || base;
  return fileName.replace(/[-_]+/g, ' ').trim();
}

function getNameContext(relativePath) {
  const base = relativePath.replace(/\\/g, '/').replace(/\.html$/i, '');
  const parts = base.split('/').filter(Boolean);
  if (parts.length === 0) return 'root';
  if (parts.length === 1) return 'root';

  const parent = parts[parts.length - 2];
  const genericParents = new Set(['projects', 'demos', 'pages', 'examples', 'html', 'public', 'src']);

  if (genericParents.has(parent) && parts.length >= 3) {
    return parts[parts.length - 3];
  }

  return parent;
}

function main() {
  const htmlFiles = listHtmlFiles(DEMOS_DIR);
  const rawDemos = htmlFiles
    .map((filePath) => {
      const relative = path.relative(DEMOS_DIR, filePath).replace(/\\/g, '/');
      return {
        name: buildDemoName(relative),
        path: relative,
        context: getNameContext(relative),
      };
    })
    .filter((demo) => !demo.path.split('/').some((part) => part.startsWith('._')))
    .filter((demo, index, arr) => {
      const key = demo.path.toLowerCase();
      return arr.findIndex((item) => item.path.toLowerCase() === key) === index;
    });

  const nameCounts = rawDemos.reduce((acc, demo) => {
    const key = demo.name.toLowerCase();
    acc.set(key, (acc.get(key) || 0) + 1);
    return acc;
  }, new Map());

  const demos = rawDemos
    .map((demo) => {
      const key = demo.name.toLowerCase();
      if (nameCounts.get(key) > 1) {
        return {
          name: `${demo.name} - ${demo.context}`,
          path: demo.path,
        };
      }
      return {
        name: demo.name,
        path: demo.path,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const payload = {
    generatedAt: new Date().toISOString(),
    count: demos.length,
    demos,
  };

  fs.mkdirSync(DEMOS_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Wrote ${demos.length} HTML demos to ${OUTPUT_FILE}`);
}

if (require.main === module) {
  main();
}
