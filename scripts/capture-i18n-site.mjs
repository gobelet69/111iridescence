import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const baseUrl = process.env.QA_BASE_URL ?? 'http://127.0.0.1:4321';
const outputDir = process.env.QA_OUTPUT_DIR
  ?? path.resolve(process.cwd(), '../../outputs/qa/i18n');

const routes = [
  ['home-en', '/'],
  ['apps-en', '/apps'],
  ['about-en', '/about'],
  ['pdf-reader-en', '/apps/iridescence-pdf-reader'],
  ['mass-print-en', '/apps/mass-print'],
  ['home-fr', '/fr/'],
  ['apps-fr', '/fr/apps'],
  ['about-fr', '/fr/a-propos'],
  ['pdf-reader-fr', '/fr/apps/iridescence-pdf-reader'],
  ['mass-print-fr', '/fr/apps/mass-print'],
];

const viewports = [
  ['1440x900', { width: 1440, height: 900 }],
  ['1280x800', { width: 1280, height: 800 }],
  ['768x1024', { width: 768, height: 1024 }],
  ['390x844', { width: 390, height: 844 }],
];

await mkdir(outputDir, { recursive: true });
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
      const massPrint = route.request().url().endsWith('/mass-print');
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(massPrint ? {
          available: true,
          version: '0.1.3',
          format: 'DMG universel',
          downloadUrl: 'https://github.com/gobelet69/Mass-Print/releases/download/v0.1.3/Mass.Print_0.1.3_universal.dmg',
          notes: 'Universal macOS build.',
        } : {
          available: false,
          compatibility: 'macOS 14 or later',
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

      const lazyImages = page.locator('main img[loading="lazy"]');
      for (let index = 0; index < await lazyImages.count(); index += 1) {
        await lazyImages.nth(index).scrollIntoViewIfNeeded();
      }
      await page.waitForFunction(() => [...document.querySelectorAll('main img')]
        .every((image) => image.complete && image.naturalWidth > 0));
      await page.evaluate(() => window.scrollTo(0, 0));

      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        lang: document.documentElement.lang,
        title: document.title,
      }));
      if (dimensions.scrollWidth > dimensions.clientWidth) {
        throw new Error(`${route} overflows at ${viewportName}: ${dimensions.scrollWidth}px > ${dimensions.clientWidth}px`);
      }
      if (runtimeErrors.length) throw new Error(`${route} emitted runtime errors: ${runtimeErrors.join(' | ')}`);

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
console.log(`Captured ${results.length} localized pages in ${outputDir}`);
