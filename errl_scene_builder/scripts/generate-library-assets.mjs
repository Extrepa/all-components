import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const libraryDir = path.join(projectRoot, "svgs", "library");
const outputPath = path.join(projectRoot, "src", "assets", "library.generated.ts");

const CATEGORIES = [
  "ERRL_CREW",
  "WEARABLES",
  "PROPS",
  "STRUCTURES",
  "FLORA",
  "DECOR",
  "LIGHTING",
  "FX",
  "GOO",
  "UI",
  "BACKGROUNDS",
  "TREATS_MISC",
];

const CATEGORY_HINTS = {
  accessory: "WEARABLES",
  hat: "WEARABLES",
  prop: "PROPS",
  env: "STRUCTURES",
  fest: "DECOR",
  frame: "BACKGROUNDS",
  fx: "FX",
  goo: "GOO",
  mystery: "FX",
  panel: "BACKGROUNDS",
  screen: "LIGHTING",
  totem: "STRUCTURES",
  ui: "UI",
  weather: "FX",
  woods: "BACKGROUNDS",
  outfits: "WEARABLES",
};

const TAG_RULES = [
  { keywords: ["base_", "base", "platform", "pedestal"], category: "STRUCTURES", tags: ["structure", "building"] },
  { keywords: ["arch", "archway", "gateway", "portal", "gate"], category: "STRUCTURES", tags: ["structure", "arch"] },
  { keywords: ["tower", "pillar", "column", "post", "pole", "truss", "beam"], category: "STRUCTURES", tags: ["structure"] },
  { keywords: ["roof", "canopy", "awning"], category: "STRUCTURES", tags: ["structure", "building"] },
  { keywords: ["errl_char", "errl_head", "blob_friend", "crew"], category: "ERRL_CREW", tags: ["character", "errl"] },
  { keywords: ["wear", "hat", "cap", "scarf", "bowtie", "backpack", "badge", "lanyard", "accessory"], category: "WEARABLES", tags: ["wearable", "clothing"] },
  { keywords: ["outfit"], category: "WEARABLES", tags: ["wearable"] },
  { keywords: ["panel", "backdrop", "backwall", "stage_panel", "_bg", "_mg", "_fg", "background", "sky", "horizon", "frame"], category: "BACKGROUNDS", tags: ["background", "panel", "frame"] },
  { keywords: ["ground", "floor", "rug", "mat", "strip", "path"], category: "BACKGROUNDS", tags: ["background", "floor"] },
  { keywords: ["woods", "forest", "treewall"], category: "FLORA", tags: ["plant", "nature", "woods"] },
  { keywords: ["projector", "screen", "monitor"], category: "LIGHTING", tags: ["technology", "light"] },
  { keywords: ["lamp", "light", "beam", "spot", "neon", "led", "lantern", "glow", "stringlight"], category: "LIGHTING", tags: ["light", "technology"] },
  { keywords: ["mixer", "console", "synth", "turntable", "deck", "amp", "speaker", "guitar", "drum", "instrument", "microphone", "mic", "dj"], category: "PROPS", tags: ["music", "technology"] },
  { keywords: ["table", "couch", "sofa", "chair", "podium", "booth", "bench", "crate", "shelf", "storage"], category: "PROPS", tags: ["object", "furniture"] },
  { keywords: ["totem", "shrine", "tent", "stage", "bridge", "building", "structure", "sign"], category: "STRUCTURES", tags: ["structure", "building"] },
  { keywords: ["plant", "tree", "vine", "flower", "bush", "leaf", "grass", "fern", "wood"], category: "FLORA", tags: ["plant", "nature"] },
  { keywords: ["mushroom", "fungi"], category: "FLORA", tags: ["mushroom", "nature"] },
  { keywords: ["flag", "banner", "bunting", "pennant", "confetti", "balloon", "decor", "garland", "festival"], category: "DECOR", tags: ["decor", "festival"] },
  { keywords: ["sparkle", "orb", "halo", "burst", "particle", "fx", "vignette"], category: "FX", tags: ["fx", "orb"] },
  { keywords: ["rain", "snow", "cloud", "weather", "wind", "storm", "sun", "moon", "star", "fog", "mist"], category: "FX", tags: ["weather", "fx"] },
  { keywords: ["goo", "slime", "drip", "puddle", "splat", "blob"], category: "GOO", tags: ["goo", "blob"] },
  { keywords: ["ui", "icon", "button", "badge", "tag", "symbol", "sticker"], category: "UI", tags: ["icon", "symbol", "ui"] },
  { keywords: ["pizza", "cookie", "bottle", "cup", "mug", "drink", "snack", "plate", "food", "candy", "treat", "dessert"], category: "TREATS_MISC", tags: ["food"] },
  { keywords: ["animal", "fox", "dog", "cat", "bird", "bunny", "rabbit", "frog", "owl", "bear", "horse", "goat", "cow", "pig", "llama", "deer", "yeti"], tags: ["animal"] },
  { keywords: ["balloon"], category: "DECOR", tags: ["balloon", "festival"] },
  { keywords: ["triangle"], tags: ["triangle", "shape"] },
  { keywords: ["music", "concert"], tags: ["music"] },
  { keywords: ["mad_scientist", "scientist"], tags: ["science"] },
  { keywords: ["santa", "festive"], tags: ["holiday"] },
  { keywords: ["cloud9", "cloud_9"], tags: ["cloud", "weather"] },
  { keywords: ["teletubby"], tags: ["retro"] },
  { keywords: ["muertos", "marigold"], tags: ["holiday", "dia_de_los_muertos"] },
  { keywords: ["lunarnewyear", "lantern", "firecracker", "envelope"], tags: ["holiday", "lunar_new_year"] },
];

const DEFAULT_CATEGORY = "PROPS";

const humanize = (value) => {
  const name = value.replace(/^errl_?/i, "");
  return name
    .split("_")
    .map((token) => (token.match(/^\d+$/) ? token : token.charAt(0).toUpperCase() + token.slice(1)))
    .join(" ")
    .trim();
};

const enrich = (stem, folder) => {
  const lower = stem.toLowerCase();
  const tags = new Set();
  let resolvedCategory;
  const ensureTag = (condition, tag) => {
    if (condition) tags.add(tag);
  };

  for (const rule of TAG_RULES) {
    if (rule.keywords.some((token) => lower.includes(token))) {
      rule.tags?.forEach((tag) => tags.add(tag));
      if (!resolvedCategory && rule.category) {
        resolvedCategory = rule.category;
      }
    }
  }

  if (!resolvedCategory) {
    const hint = CATEGORY_HINTS[folder.toLowerCase()];
    if (hint && CATEGORIES.includes(hint)) {
      resolvedCategory = hint;
    } else {
      resolvedCategory = DEFAULT_CATEGORY;
    }
  }

  const isErrlCharacter = lower.includes("errl_char") || lower.includes("errl_head") || lower.includes("blob_friend");
  if (isErrlCharacter) tags.add("errl");
  ensureTag(lower.includes("sign"), "sign");
  ensureTag(lower.includes("festival") || lower.includes("fest"), "festival");
  ensureTag(lower.includes("flag") || lower.includes("banner"), "flag");
  ensureTag(lower.includes("light") || lower.includes("lantern"), "light");
  ensureTag(lower.includes("orb"), "orb");
  ensureTag(lower.includes("weather") || lower.includes("rain") || lower.includes("snow") || lower.includes("storm") || lower.includes("cloud"), "weather");
  ensureTag(lower.includes("wood") || lower.includes("forest") || lower.includes("woods"), "woods");
  ensureTag(lower.includes("music") || lower.includes("concert") || lower.includes("dj"), "music");
  ensureTag(lower.includes("food") || lower.includes("snack") || lower.includes("treat") || lower.includes("candy") || lower.includes("drink") || lower.includes("cocoa"), "food");
  ensureTag(lower.includes("floor") || lower.includes("ground") || lower.includes("rug") || lower.includes("strip"), "floor");
  ensureTag(lower.includes("animal") || lower.includes("fox") || lower.includes("cat") || lower.includes("dog") || lower.includes("bunny") || lower.includes("rabbit") || lower.includes("frog") || lower.includes("owl"), "animal");

  const categoryDefaultTags = {
    STRUCTURES: ["structure"],
    FLORA: ["nature"],
    BACKGROUNDS: ["background"],
    LIGHTING: ["light"],
    WEARABLES: ["wearable"],
    TREATS_MISC: ["food"],
  };
  categoryDefaultTags[resolvedCategory]?.forEach((tag) => tags.add(tag));

  return { category: resolvedCategory, tags: Array.from(tags) };
};

const entries = [];

const dirents = fs.readdirSync(libraryDir, { withFileTypes: true }).filter((d) => d.isDirectory());
dirents.sort((a, b) => a.name.localeCompare(b.name));

for (const dirent of dirents) {
  const folder = dirent.name;
  const folderPath = path.join(libraryDir, folder);
  const files = fs.readdirSync(folderPath).filter((file) => file.toLowerCase().endsWith(".svg"));
  files.sort((a, b) => a.localeCompare(b));

  for (const file of files) {
    const stem = path.parse(file).name;
    const id = stem.toUpperCase();
    const label = humanize(stem);
    const { category, tags } = enrich(stem, folder);
    const filePath = `/svgs/library/${folder}/${file}`;
    entries.push({ id, category, label, filePath, tags });
  }
}

const header = [
  "// AUTO-GENERATED by scripts/generate-library-assets.mjs",
  "// Run `npm run generate:assets` after adding or removing files under svgs/library.",
  "",
].join("\n");

const body = `export const libraryAssets = ${JSON.stringify(entries, null, 2)} as const;\n`;
fs.writeFileSync(outputPath, `${header}${body}`);

console.log(`Wrote ${entries.length} assets to ${path.relative(projectRoot, outputPath)}`);
