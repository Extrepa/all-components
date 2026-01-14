const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'thumbnails');
const viewport = { width: 1200, height: 900 };

const htmlFiles = fs.readdirSync(root)
  .filter((name) => name.endsWith('.html'))
  .filter((name) => name !== 'index.html');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport });

  for (const file of htmlFiles) {
    const filePath = path.join(root, file);
    const fileUrl = `file://${filePath}`;
    console.log(`Capturing ${file}...`);
    await page.goto(fileUrl, { waitUntil: 'load' });
    await page.waitForTimeout(800);

    const target = path.join(outDir, `${path.basename(file, '.html')}.png`);
    await page.screenshot({ path: target, fullPage: false });
  }

  await browser.close();
})();
