#!/usr/bin/env node

// Simple utility to split a concatenated multi-<svg> file into separate SVG files.
// Usage:
//   node scripts/extract_multi_svg.cjs <sourceSvgPath> <destRootDir>
//
// Example:
//   node scripts/extract_multi_svg.cjs "./svgs/source/backg.svg" "./svgs/archive/raw_sources_20251123_072937"
//
// This will create: <destRootDir>/<basename>_extracted/<assetName>.svg
// Where <assetName> is taken from the data-name="..." attribute when present.

const fs = require("fs");
const path = require("path");

function main() {
  const [srcPath, destRoot] = process.argv.slice(2);
  if (!srcPath || !destRoot) {
    console.error("Usage: node scripts/extract_multi_svg.cjs <sourceSvgPath> <destRootDir>");
    process.exit(1);
  }

  const absSrc = path.resolve(srcPath);
  const absDestRoot = path.resolve(destRoot);

  if (!fs.existsSync(absSrc)) {
    console.error("Source file does not exist:", absSrc);
    process.exit(1);
  }

  if (!fs.existsSync(absDestRoot)) {
    fs.mkdirSync(absDestRoot, { recursive: true });
  }

  const base = path.basename(absSrc, path.extname(absSrc));
  const outDir = path.join(absDestRoot, base + "_extracted");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const raw = fs.readFileSync(absSrc, "utf8");

  // Split on closing </svg> tags, but keep the tag in each chunk.
  const parts = raw
    .split(/<\/svg>/i)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => (chunk.endsWith("</svg>") ? chunk : chunk + "\n</svg>"));

  if (parts.length === 0) {
    console.error("No <svg> blocks found in", absSrc);
    process.exit(1);
  }

  console.log(`Found ${parts.length} <svg> block(s) in ${absSrc}`);

  const usedNames = new Set();

  parts.forEach((svg, index) => {
    // Try to extract data-name attribute for a nice file name.
    let nameMatch = svg.match(/data-name\s*=\s*"([^"]+)"/);
    let rawName = nameMatch ? nameMatch[1] : null;

    if (!rawName) {
      // Fallback: try comment pattern "<!-- name – description -->" at start.
      const commentMatch = svg.match(/<!--\s*([^\u2013-]+?)\s*[\u2013-]/); // before en dash/ hyphen
      if (commentMatch && commentMatch[1]) {
        rawName = commentMatch[1].trim();
      }
    }

    let fileNameBase;
    if (rawName) {
      // Normalize to a filesystem-friendly name.
      fileNameBase = rawName
        .replace(/[^a-zA-Z0-9_\-]+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "");
    } else {
      fileNameBase = `${base}_part_${index + 1}`;
    }

    // Ensure uniqueness.
    let fileName = fileNameBase || `${base}_part_${index + 1}`;
    let counter = 1;
    while (usedNames.has(fileName)) {
      fileName = `${fileNameBase}_${counter++}`;
    }
    usedNames.add(fileName);

    const outPath = path.join(outDir, fileName + ".svg");
    fs.writeFileSync(outPath, svg.trim() + "\n", "utf8");
    console.log("Wrote", outPath);
  });
}

main();
