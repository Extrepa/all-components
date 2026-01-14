#!/usr/bin/env node

/**
 * Generate thumbnails for all Errl variant SVG files
 * 
 * This script uses Puppeteer to render each SVG in a headless browser
 * and save a PNG thumbnail at the specified size.
 * 
 * Usage:
 *   npm install puppeteer  # First time only
 *   node scripts/generate_variant_thumbnails.cjs
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

// Configuration
const THUMBNAIL_SIZE = 256; // 256x256 pixels
const OUTPUT_DIR = 'svgs/thumbnails';
const VARIANT_FOLDERS = [
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
    // Remove existing viewBox, width, height, preserveAspectRatio to set them cleanly
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
    
    // Create HTML page with SVG - ensure proper centering with padding
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
    
    // Wait for SVG to render and calculate bounding box
    await page.evaluate(() => {
      const svg = document.querySelector('svg');
      if (svg) {
        // Force a reflow to ensure SVG is rendered
        svg.getBBox();
      }
    });
    
    // Wait a bit more for rendering
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Take screenshot with full size
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

async function processFolder(browser, folderPath) {
  const folderName = path.basename(folderPath);
  const outputFolder = path.join(OUTPUT_DIR, folderName);
  
  // Create output directory
  await mkdir(outputFolder, { recursive: true });
  
  // Get all SVG files
  const files = await readdir(folderPath);
  const svgFiles = files.filter(f => f.endsWith('.svg')).sort();
  
  console.log(`\n📁 Processing ${folderName} (${svgFiles.length} files)...`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const file of svgFiles) {
    const svgPath = path.join(folderPath, file);
    const outputPath = path.join(outputFolder, file.replace('.svg', '.png'));
    
    process.stdout.write(`  ${file}... `);
    
    const success = await generateThumbnail(browser, svgPath, outputPath);
    
    if (success) {
      successCount++;
      process.stdout.write('✓\n');
    } else {
      failCount++;
      process.stdout.write('✗\n');
    }
  }
  
  console.log(`  ✅ ${successCount} successful, ${failCount} failed`);
  
  return { successCount, failCount };
}

async function main() {
  console.log('🎨 Errl Variant Thumbnail Generator\n');
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
    let totalSuccess = 0;
    let totalFail = 0;
    
    // Process each folder
    for (const folder of VARIANT_FOLDERS) {
      if (!fs.existsSync(folder)) {
        console.warn(`⚠️  Folder not found: ${folder}`);
        continue;
      }
      
      const result = await processFolder(browser, folder);
      totalSuccess += result.successCount;
      totalFail += result.failCount;
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`✨ Complete!`);
    console.log(`   ✅ ${totalSuccess} thumbnails generated`);
    if (totalFail > 0) {
      console.log(`   ❌ ${totalFail} failed`);
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

