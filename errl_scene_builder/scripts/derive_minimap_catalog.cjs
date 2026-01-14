#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const FEST_ICON_PATH = path.resolve("svgs/asset_catalog_fest_icons.json");
const OUT_PATH = path.resolve("svgs/asset_catalog_minimap.json");

if (!fs.existsSync(FEST_ICON_PATH)) {
  console.error("Missing", FEST_ICON_PATH);
  process.exit(1);
}

const festIcons = JSON.parse(fs.readFileSync(FEST_ICON_PATH, "utf8"));

// Minimaps are those tagged 'minimap'. Also infer kind by other tags.
const minimapEntries = (festIcons.minimap || []).map((entry) => {
  let kind = "other";
  const tags = entry.tags || [];
  if (tags.includes("gate")) kind = "gate";
  else if (tags.includes("tent")) kind = "tent";
  else if (tags.includes("stage")) kind = "stage";
  else if (tags.includes("service_food") || tags.includes("service_first_aid") || tags.includes("service_staff") || tags.includes("service_info")) {
    kind = "service";
  }

  return {
    file: entry.file,
    logicalName: entry.logicalName,
    path: entry.path,
    kind,
    tags,
  };
});

fs.writeFileSync(OUT_PATH, JSON.stringify({ minimap: minimapEntries }, null, 2));
console.log("Wrote minimap catalog to", path.relative(process.cwd(), OUT_PATH));
console.log("Minimap entries:", minimapEntries.length);
