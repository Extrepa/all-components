#!/usr/bin/env node

/**
 * Generate thumbnails for variant group buttons only (9 files)
 * 
 * This script generates thumbnails for the last numbered file from each variant group,
 * which are used as the thumbnails for the variant group buttons in the AssetPanel.
 * 
 * Usage:
 *   node scripts/generate_variant_group_thumbnails.cjs
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

// Configuration
const THUMBNAIL_SIZE = 256; // 256x256 pixels
const OUTPUT_DIR = 'svgs/thumbnails';

// Variant groups with their last file numbers (matching folder item count)
const VARIANT_GROUPS = [
  { folder: 'svgs/Errl_AndOrbs/errl-30-dynamic-individual-transparent', fileNum: 30, filename: 'errl-30.svg' },
  { folder: 'svgs/Errl_AndOrbs/errl-50-grid-poses-individual-transparent', fileNum: 50, filename: 'errl-50.svg' },
  { folder: 'svgs/Errl_AndOrbs/errl-50-grid-ref-individual-transparent', fileNum: 50, filename: 'errl-50.svg' },
  { folder: 'svgs/Errl_AndOrbs/random-dynamic-individual-transparent', fileNum: 50, filename: 'errl-50.svg' },
  { folder: 'svgs/Errl_AndOrbs/errl-20-viscous-body-v2-individual-transparent', fileNum: 20, filename: 'visc2-body-20-crest-tuck.svg' },
  { folder: 'svgs/ErrlOnly/errl-30-dynamic-individual-errl-only', fileNum: 30, filename: 'errl-30.svg' },
  { folder: 'svgs/ErrlOnly/errl-50-grid-poses-individual-errl-only', fileNum: 50, filename: 'errl-50.svg' },
  { folder: 'svgs/ErrlOnly/errl-50-grid-ref-individual-errl-only', fileNum: 50, filename: 'errl-50.svg' },
  { folder: 'svgs/ErrlOnly/errl-50-random-dynamic-individual-errl-only', fileNum: 50, filename: 'errl-50.svg' },
];

async function checkPuppeteer() {
  try {
    require.resolve('puppeteer');
    return require('puppeteer');
  } catch (e) {
    console.error('❌ Puppeteer is not installed.');
    console.error('   Please run: npm install --save-dev puppeteer');
    process.exit(1);
  }
}

async function generateThumbnail(browser, svgPath, outputPath) {
  const page = await browser.newPage();
  
  try {
    // Read SVG content
    const svgContent = await readFile(svgPath, 'utf-8');
    
    // Parse and normalize SVG for consistent centering
    let processedSvg = svgContent;
    
    // Extract or set viewBox - ensure it exists
    let viewBox = null;
    const viewBoxMatch = processedSvg.match(/viewBox=["']([^"']+)["']/);
    if (viewBoxMatch) {
      viewBox = viewBoxMatch[1];
    } else {
      // Try to extract width/height or default to 1024
      const widthMatch = processedSvg.match(/width=["'](\d+)["']/);
      const heightMatch = processedSvg.match(/height=["'](\d+)["']/);
      const width = widthMatch ? widthMatch[1] : '1024';
      const height = heightMatch ? heightMatch[1] : '1024';
      viewBox = `0 0 ${width} ${height}`;
    }
    
    // Normalize the SVG tag to ensure proper attributes
    processedSvg = processedSvg.replace(
      /<svg([^>]*)>/,
      (match, attrs) => {
        // Remove conflicting attributes
        attrs = attrs
          .replace(/\s+viewBox=["'][^"']*["']/g, '')
          .replace(/\s+width=["'][^"']*["']/g, '')
          .replace(/\s+height=["'][^"']*["']/g, '')
          .replace(/\s+preserveAspectRatio=["'][^"']*["']/g, '');
        
        // Add normalized attributes with explicit centering
        return `<svg${attrs} viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet" width="${THUMBNAIL_SIZE}" height="${THUMBNAIL_SIZE}">`;
      }
    );
    
    // Create HTML page with SVG - ensure proper centering
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            html, body {
              width: ${THUMBNAIL_SIZE}px;
              height: ${THUMBNAIL_SIZE}px;
              overflow: hidden;
            }
            body {
              display: flex;
              align-items: center;
              justify-content: center;
              background: transparent;
              padding: 0;
            }
            svg {
              display: block;
              width: ${THUMBNAIL_SIZE}px;
              height: ${THUMBNAIL_SIZE}px;
              margin: 0 auto;
              padding: 0;
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          ${processedSvg}
        </body>
      </html>
    `;
    
    // Set viewport
    await page.setViewport({
      width: THUMBNAIL_SIZE,
      height: THUMBNAIL_SIZE,
      deviceScaleFactor: 2, // Higher DPI for better quality
    });
    
    // Load HTML
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Wait for SVG to render and get bounding box to center it
    const centered = await page.evaluate(() => {
      const svg = document.querySelector('svg');
      if (!svg) return false;
      
      try {
        // Get the bounding box of all content
        const bbox = svg.getBBox();
        const viewBox = svg.viewBox.baseVal;
        const svgWidth = viewBox.width || 1024;
        const svgHeight = viewBox.height || 1024;
        
        // Calculate how much the content is offset from center
        const contentCenterX = bbox.x + bbox.width / 2;
        const contentCenterY = bbox.y + bbox.height / 2;
        const viewBoxCenterX = svgWidth / 2;
        const viewBoxCenterY = svgHeight / 2;
        
        const offsetX = viewBoxCenterX - contentCenterX;
        const offsetY = viewBoxCenterY - contentCenterY;
        
        // Only adjust if there's a significant offset (more than 1px)
        if (Math.abs(offsetX) > 1 || Math.abs(offsetY) > 1) {
          // Wrap all content in a group with transform to center it
          const content = svg.innerHTML;
          svg.innerHTML = `<g transform="translate(${offsetX}, ${offsetY})">${content}</g>`;
          return true;
        }
        return false;
      } catch (e) {
        console.error('BBox error:', e);
        return false;
      }
    });
    
    // Wait for any transforms to apply
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Take screenshot
    await page.screenshot({
      path: outputPath,
      type: 'png',
      clip: {
        x: 0,
        y: 0,
        width: THUMBNAIL_SIZE,
        height: THUMBNAIL_SIZE,
      },
      omitBackground: true, // Transparent background
    });
    
    return true;
  } catch (error) {
    console.error(`  ⚠️  Failed to generate thumbnail for ${svgPath}:`, error.message);
    return false;
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('🎨 Errl Variant Group Thumbnail Generator (9 files only)\n');
  console.log(`📐 Thumbnail size: ${THUMBNAIL_SIZE}x${THUMBNAIL_SIZE}px`);
  console.log(`📂 Output directory: ${OUTPUT_DIR}\n`);
  
  // Check for Puppeteer
  const puppeteer = await checkPuppeteer();
  
  // Launch browser
  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  try {
    let successCount = 0;
    let failCount = 0;
    
    // Process each variant group's last file
    for (const group of VARIANT_GROUPS) {
      const folderName = path.basename(group.folder);
      const svgPath = path.join(group.folder, group.filename);
      const outputFolder = path.join(OUTPUT_DIR, folderName);
      const pngFilename = group.filename.replace('.svg', '.png');
      const outputPath = path.join(outputFolder, pngFilename);
      
      // Create output directory
      await mkdir(outputFolder, { recursive: true });
      
      // Check if source file exists
      if (!fs.existsSync(svgPath)) {
        console.warn(`⚠️  Source file not found: ${svgPath}`);
        failCount++;
        continue;
      }
      
      process.stdout.write(`  ${group.filename} (${folderName})... `);
      
      const success = await generateThumbnail(browser, svgPath, outputPath);
      
      if (success) {
        successCount++;
        process.stdout.write('✓\n');
      } else {
        failCount++;
        process.stdout.write('✗\n');
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`✨ Complete!`);
    console.log(`   ✅ ${successCount} thumbnails generated`);
    if (failCount > 0) {
      console.log(`   ❌ ${failCount} failed`);
    }
    console.log(`   📂 Output: ${OUTPUT_DIR}`);
    console.log('='.repeat(50));
  } finally {
    await browser.close();
  }
}

// Run the script
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

