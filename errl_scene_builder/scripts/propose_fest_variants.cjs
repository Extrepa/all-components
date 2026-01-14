#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const FEST_DIR = path.resolve("svgs/library/fest");
const OUT_PATH = path.resolve("svgs/fest_variant_families.json");

function baseFamily(name) {
  // Strip numeric suffixes like _1, _2, etc. but keep _01 style asset numbers.
  const withoutExt = name.replace(/\.svg$/i, "");
  return withoutExt.replace(/_(\d+)$/, "");
}

const families = {};

for (const file of fs.readdirSync(FEST_DIR)) {
  if (!file.endsWith(".svg")) continue;
  const fam = baseFamily(file);
  if (!families[fam]) families[fam] = [];
  families[fam].push(file);
}

// Build proposal: for each family with multiple entries, mark canonical and variants.
const proposal = {};

for (const [fam, files] of Object.entries(families)) {
  if (files.length === 1) continue;
  const sorted = files.slice().sort();
  const canonical = sorted.find((f) => !/_\d+\.svg$/i.test(f)) || sorted[0];
  const variants = sorted.filter((f) => f !== canonical);
  proposal[fam] = {
    canonical,
    variants,
  };
}

fs.writeFileSync(OUT_PATH, JSON.stringify(proposal, null, 2));
console.log("Wrote fest variant proposal to", path.relative(process.cwd(), OUT_PATH));
console.log("Families with variants:", Object.keys(proposal).length);
