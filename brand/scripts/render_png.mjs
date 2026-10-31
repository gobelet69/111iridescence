import pkg from '../../111iridescence-website/node_modules/@playwright/test/index.js';
const { chromium } = pkg;
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

let browserInstance = null;

export async function getBrowser() {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await chromium.launch();
  }
  return browserInstance;
}

export async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * Render SVG file to transparent PNG at specified resolution
 */
export async function renderSvgToPng(svgPath, pngPath, width = 1024, height = 1024, options = {}) {
  const browser = await getBrowser();
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: options.deviceScaleFactor || 1
  });

  const svgContent = fs.readFileSync(svgPath, 'utf8');
  const bgStyle = options.background ? `background: ${options.background};` : 'background: transparent;';
  const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; ${bgStyle} overflow: hidden; display: flex; align-items: center; justify-content: center; }
    svg { width: 100%; height: 100%; }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;

  await page.setContent(html);
  // Wait a frame for layout
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  
  fs.mkdirSync(path.dirname(pngPath), { recursive: true });
  await page.screenshot({ path: pngPath, omitBackground: !options.background });
  await page.close();
}

/**
 * Render an HTML file directly to PNG
 */
export async function renderHtmlToPng(htmlPath, pngPath, width = 1920, height = 1080) {
  const browser = await getBrowser();
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 2
  });

  await page.goto(`file://${path.resolve(htmlPath)}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  fs.mkdirSync(path.dirname(pngPath), { recursive: true });
  await page.screenshot({ path: pngPath, fullPage: true });
  await page.close();
}

/**
 * Build Apple ICNS file from an SVG master
 */
export async function buildAppleIconsetAndIcns(svgPath, outputDir, baseName = 'AppIcon') {
  const iconsetDir = path.join(outputDir, `${baseName}.iconset`);
  fs.mkdirSync(iconsetDir, { recursive: true });

  const sizes = [
    { name: 'icon_16x16.png', size: 16 },
    { name: 'icon_16x16@2x.png', size: 32 },
    { name: 'icon_32x32.png', size: 32 },
    { name: 'icon_32x32@2x.png', size: 64 },
    { name: 'icon_128x128.png', size: 128 },
    { name: 'icon_128x128@2x.png', size: 256 },
    { name: 'icon_256x256.png', size: 256 },
    { name: 'icon_256x256@2x.png', size: 512 },
    { name: 'icon_512x512.png', size: 512 },
    { name: 'icon_512x512@2x.png', size: 1024 }
  ];

  for (const { name, size } of sizes) {
    const pngPath = path.join(iconsetDir, name);
    await renderSvgToPng(svgPath, pngPath, size, size);
  }

  const icnsPath = path.join(outputDir, `${baseName}.icns`);
  try {
    execSync(`/usr/bin/iconutil -c icns "${iconsetDir}" -o "${icnsPath}"`);
    console.log(`Compiled ICNS: ${icnsPath}`);
  } catch (err) {
    console.error(`Failed to compile ICNS: ${err.message}`);
  }
}

// CLI execution
if (process.argv[1] === import.meta.filename) {
  const args = process.argv.slice(2);
  if (args.length >= 2) {
    const [input, output, w, h] = args;
    const width = parseInt(w || '1024', 10);
    const height = parseInt(h || w || '1024', 10);
    if (input.endsWith('.html')) {
      await renderHtmlToPng(input, output, width, height);
    } else {
      await renderSvgToPng(input, output, width, height);
    }
    await closeBrowser();
    console.log(`Rendered: ${output} (${width}x${height})`);
  }
}
