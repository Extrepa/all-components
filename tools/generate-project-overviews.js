const fs = require('fs');
const path = require('path');

const ROOT_DIR = '/Users/extrepa/Projects/all-components';
const COMPONENTS_FILE = path.join(ROOT_DIR, 'components-data.json');
const DEMOS_DIR = path.join(ROOT_DIR, 'errl-html-demos');
const TEMPLATE_FILE = path.join(DEMOS_DIR, 'project-overview.html');
const OUTPUT_DIR = path.join(DEMOS_DIR, 'project-overviews');

function sanitizeName(name) {
  return name.replace(/[^a-z0-9-_]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function main() {
  if (!fs.existsSync(COMPONENTS_FILE)) {
    console.error(`components-data.json not found at ${COMPONENTS_FILE}`);
    process.exit(1);
  }
  if (!fs.existsSync(TEMPLATE_FILE)) {
    console.error(`Template not found at ${TEMPLATE_FILE}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(COMPONENTS_FILE, 'utf8'));
  const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const projects = Object.keys(data).sort((a, b) => a.localeCompare(b));
  const results = [];

  for (const projectName of projects) {
    const safeName = sanitizeName(projectName);
    const outputFile = path.join(OUTPUT_DIR, `${safeName}-overview.html`);
    const replaced = template.replace(
      /const projectName = urlParams\.get\('project'\) \|\| '[^']*';/,
      `const projectName = urlParams.get('project') || '${projectName}';`
    );
    fs.writeFileSync(outputFile, replaced, 'utf8');
    results.push(outputFile);
  }

  console.log(`Generated ${results.length} project overview files in ${OUTPUT_DIR}`);
}

if (require.main === module) {
  main();
}
