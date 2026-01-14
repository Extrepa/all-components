const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');

function checkHasFaces(svgPath) {
  try {
    const content = fs.readFileSync(svgPath, 'utf-8');
    return content.includes('face-full') || content.includes('region-face');
  } catch (err) {
    return false;
  }
}

function scanFolder(folderPath) {
  const fullPath = path.join(BASE_DIR, folderPath);
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const files = fs.readdirSync(fullPath)
    .filter(f => f.endsWith('.svg'))
    .sort();

  if (files.length === 0) {
    return null;
  }

  // Check first few files for faces
  let hasFaces = false;
  for (const file of files.slice(0, Math.min(3, files.length))) {
    if (checkHasFaces(path.join(fullPath, file))) {
      hasFaces = true;
      break;
    }
  }

  const variants = files.map(f => path.join(folderPath, f).replace(/\\/g, '/'));

  return {
    folderPath,
    variantCount: files.length,
    hasFaces,
    variants,
  };
}

const folders = [
  'svgs/Errl_AndOrbs/errl-30-dynamic-individual-transparent',
  'svgs/Errl_AndOrbs/errl-50-grid-poses-individual-transparent',
  'svgs/Errl_AndOrbs/errl-50-grid-ref-individual-transparent',
  'svgs/Errl_AndOrbs/random-dynamic-individual-transparent',
  'svgs/Errl_AndOrbs/errl-20-viscous-body-v2-individual-transparent',
  'svgs/ErrlOnly/errl-30-dynamic-individual-errl-only',
  'svgs/ErrlOnly/errl-50-grid-poses-individual-errl-only',
  'svgs/ErrlOnly/errl-50-grid-ref-individual-errl-only',
  'svgs/ErrlOnly/errl-50-random-dynamic-individual-errl-only',
];

const results = folders.map(scanFolder).filter(Boolean);

console.log(JSON.stringify(results, null, 2));

