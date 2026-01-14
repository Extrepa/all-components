# Thumbnail Generation Guide

## Quick Start

The easiest way to generate thumbnails for all 380 variant SVG files:

```bash
# 1. Install Puppeteer (one-time setup)
npm install --save-dev puppeteer

# 2. Generate all thumbnails
npm run generate:thumbnails
```

This will:
- Process all 9 variant folders
- Generate 256x256px PNG thumbnails
- Save them to `svgs/thumbnails/` directory
- Preserve folder structure (e.g., `svgs/thumbnails/errl-30-dynamic-individual-transparent/errl-01.png`)

## How It Works

The script (`scripts/generate_variant_thumbnails.cjs`) uses **Puppeteer** to:
1. Load each SVG in a headless Chrome browser
2. Render it at 256x256 pixels
3. Take a screenshot with transparent background
4. Save as PNG

This ensures thumbnails match exactly how SVGs appear in the browser.

## Output Structure

```
svgs/thumbnails/
├── errl-30-dynamic-individual-transparent/
│   ├── errl-01.png
│   ├── errl-02.png
│   └── ...
├── errl-50-grid-poses-individual-transparent/
│   └── ...
└── ...
```

## Alternative Methods

If you prefer not to use Puppeteer, here are other options:

### Option 1: ImageMagick (Command Line)

```bash
# Install ImageMagick first
brew install imagemagick  # macOS
# or apt-get install imagemagick  # Linux

# Convert all SVGs to thumbnails
find svgs/Errl_AndOrbs svgs/ErrlOnly -name "*.svg" | while read svg; do
  output="${svg%.svg}.png"
  convert -background transparent -resize 256x256 "$svg" "$output"
done
```

### Option 2: Sharp (Node.js - Faster, but may need resvg)

```bash
npm install sharp @resvg/resvg-js
```

Then modify the script to use Sharp instead of Puppeteer.

### Option 3: Online Batch Converter

1. Use [iSVGtoPNG](https://isvgtopng.com/batch-converter/)
2. Upload all 380 SVG files
3. Set size to 256x256
4. Download ZIP and extract

## Configuration

Edit `scripts/generate_variant_thumbnails.cjs` to change:
- `THUMBNAIL_SIZE`: Default is 256
- `OUTPUT_DIR`: Default is `svgs/thumbnails`
- `VARIANT_FOLDERS`: List of folders to process

## Performance

- **Puppeteer**: ~2-5 seconds per thumbnail (380 files ≈ 15-30 minutes)
- **ImageMagick**: ~0.5-1 second per thumbnail (380 files ≈ 5-10 minutes)
- **Sharp**: ~0.1-0.5 seconds per thumbnail (380 files ≈ 1-3 minutes)

Puppeteer is recommended for accuracy (matches browser rendering exactly).

