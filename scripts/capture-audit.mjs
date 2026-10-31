import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const stage = process.argv.includes('--after') ? 'after' : 'before';
const baseUrl = process.env.QA_BASE_URL ?? 'http://127.0.0.1:4321';
const outputDir = path.resolve(process.cwd(), 'screenshots', stage);

const routes = [
  ['home-en', '/'],
  ['apps-en', '/apps'],
  ['about-en', '/about'],
  ['pdf-reader-en', '/apps/iridescence-pdf-reader'],
  ['mass-print-en', '/apps/mass-print'],
  ['resource-guard-en', '/apps/resource-guard'],
  ['home-fr', '/fr/'],
  ['apps-fr', '/fr/apps'],
  ['about-fr', '/fr/a-propos'],
  ['pdf-reader-fr', '/fr/apps/iridescence-pdf-reader'],
  ['mass-print-fr', '/fr/apps/mass-print'],
  ['resource-guard-fr', '/fr/apps/resource-guard'],
];

const viewports = [
  ['1920x1080', { width: 1920, height: 1080 }],
  ['1440x900', { width: 1440, height: 900 }],
  ['768x1024', { width: 768, height: 1024 }],
  ['390x844', { width: 390, height: 844 }],
];

await mkdir(outputDir, { recursive: true });

async function isServerRunning(url) {
  try {
    const res = await fetch(url);
    return res.ok;
  } catch {
    return false;
  }
}

let serverProcess = null;
if (!await isServerRunning(baseUrl)) {
  console.log('Starting dev server on http://127.0.0.1:4321...');
  serverProcess = spawn('npx', ['astro', 'dev', '--host', '127.0.0.1', '--port', '4321'], {
    stdio: 'ignore',
    detached: true,
  });
  serverProcess.unref();

  let retries = 30;
  while (retries > 0) {
    await new Promise((r) => setTimeout(r, 1000));
    if (await isServerRunning(baseUrl)) break;
    retries--;
  }
  if (retries === 0) {
    throw new Error('Failed to start dev server');
  }
  console.log('Dev server started.');
}

const browser = await chromium.launch();
const results = [];

try {
  for (const [viewportName, viewport] of viewports) {
    const context = await browser.newContext({
      viewport,
      reducedMotion: 'reduce',
      colorScheme: 'light',
    });

    await context.route('**/api/releases/**', (route) => {
      const url = route.request().url();
      const isMassPrint = url.includes('/mass-print');
      const isPdfReader = url.includes('/iridescence-pdf-reader');
      const isResourceGuard = url.includes('/resource-guard');

      if (isMassPrint) {
        return route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            available: true,
            version: '0.1.3',
            format: 'DMG universel',
            downloadUrl: 'https://github.com/gobelet69/Mass-Print/releases/download/v0.1.3/Mass.Print_0.1.3_universal.dmg',
            notes: 'Universal macOS build.',
          }),
        });
      }

      if (isPdfReader) {
        return route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            available: true,
            version: '0.1.0',
            format: 'DMG Apple Silicon',
            downloadUrl: 'https://github.com/gobelet69/iridecence-pdf-reader/releases/download/v0.1.0/Iridescence-PDF-Reader_0.1.0_aarch64.dmg',
            notes: 'Apple Silicon build.',
          }),
        });
      }

      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          available: false,
          compatibility: 'macOS 13 or later',
          architecture: 'Apple Silicon',
        }),
      });
    });

    for (const [name, route] of routes) {
      const page = await context.newPage();
      const runtimeErrors = [];
      page.on('console', (message) => {
        if (message.type() === 'error') runtimeErrors.push(message.text());
      });
      page.on('pageerror', (error) => runtimeErrors.push(error.message));

      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
      if (!response?.ok()) throw new Error(`${route} returned ${response?.status() ?? 'no response'}`);

      const pixelCanvas = page.locator('[data-pixel-canvas]');
      if (await pixelCanvas.count()) {
        await pixelCanvas.waitFor({ state: 'visible' });
        await page.waitForFunction(() => document.querySelector('[data-pixel-canvas]')?.getAttribute('data-render-state') === 'ready');
      }

      const lazyImages = page.locator('img[loading="lazy"]');
      for (let index = 0; index < await lazyImages.count(); index += 1) {
        await lazyImages.nth(index).scrollIntoViewIfNeeded();
      }
      await page.waitForFunction(async () => {
        const imgs = [...document.querySelectorAll('img')];
        await Promise.all(imgs.map((img) => img.decode?.().catch(() => {})));
        return imgs.every((image) => image.complete && image.naturalWidth > 0);
      });
      await page.waitForTimeout(300);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(200);

      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        lang: document.documentElement.lang,
        title: document.title,
      }));

      if (dimensions.scrollWidth > dimensions.clientWidth) {
        console.warn(`Warning: ${route} overflows at ${viewportName}: ${dimensions.scrollWidth}px > ${dimensions.clientWidth}px`);
      }
      if (runtimeErrors.length) console.warn(`Warning: ${route} emitted runtime errors: ${runtimeErrors.join(' | ')}`);

      const file = `${name}-${viewportName}.png`;
      await page.screenshot({ path: path.join(outputDir, file), fullPage: true, animations: 'disabled' });
      results.push({ route, viewport: viewportName, file, ...dimensions });
      await page.close();
    }

    await context.close();
  }
} finally {
  await browser.close();
}

await writeFile(path.join(outputDir, 'manifest.json'), `${JSON.stringify(results, null, 2)}\n`);
console.log(`Captured ${results.length} pages in ${outputDir}`);
