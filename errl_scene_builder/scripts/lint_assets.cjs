#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve("svgs/library");

function getLogicalName(svg) {
  const mAttr = svg.match(/data-name\s*=\s*"([^"]+)"/);
  if (mAttr) return mAttr[1].trim();
  const mComment = svg.match(/<!--\s*([^\u2013-]+?)\s*[\u2013-]/);
  if (mComment) return mComment[1].trim();
  return null;
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

const allowedPrefixes = [
  "errl_bg_",
  "errl_woods_",
  "errl_fest_",
  "errl_weather_",
  "errl_env_",
  "errl_fx_",
  "errl_goo_",
  "errl_accessory_",
  "errl_hat_",
  "errl_frame_",
  "errl_ui_icon_",
  "errl_char_",
  "errl_depth_",
];

const problems = [];

function checkFile(full) {
  const rel = path.relative(process.cwd(), full).replace(/\\/g, "/");
  const file = path.basename(full);

  if (file.includes(" ")) {
    problems.push({ rel, type: "space-in-filename", message: "Filename contains spaces" });
  }

  if (!file.endsWith(".svg")) return;

  const base = file.slice(0, -4);
  const lower = base.toLowerCase();
  if (!allowedPrefixes.some((p) => lower.startsWith(p))) {
    problems.push({ rel, type: "prefix", message: `Filename does not start with known prefix (got '${base}')` });
  }

  const raw = fs.readFileSync(full, "utf8");
  const logical = getLogicalName(raw);
  if (!logical) {
    problems.push({ rel, type: "logical-name", message: "Missing data-name or leading logical-name comment" });
    return;
  }

  const want = slugify(logical);
  if (want !== lower) {
    problems.push({
      rel,
      type: "name-mismatch",
      message: `Logical name '${logical}' slugs to '${want}' but filename is '${base}'`,
    });
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile()) {
      checkFile(full);
    }
  }
}

walk(ROOT);

if (problems.length) {
  console.error("Asset lint FAILED with", problems.length, "issue(s):");
  for (const p of problems) {
    console.error(`- [${p.type}] ${p.rel}: ${p.message}`);
  }
  process.exit(1);
} else {
  console.log("Asset lint passed: no issues found.");
}
