import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

const publicRoutes = [
  '/', '/apps', '/apps/iridescence-installer', '/apps/iridescence-pdf-reader', '/apps/mass-print', '/apps/resource-guard', '/apps/quickpad', '/about',
  '/fr/', '/fr/apps', '/fr/apps/iridescence-installer', '/fr/apps/iridescence-pdf-reader', '/fr/apps/mass-print', '/fr/apps/resource-guard', '/fr/apps/quickpad', '/fr/a-propos',
];

test('public release surfaces stay coherent, canonical, and anonymous', async ({ page, request }) => {
  for (const path of publicRoutes) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()['set-cookie'], path).toBeUndefined();
  }
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toContainText('Apps');
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).not.toContainText('Blog');
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Portal' })).toHaveAttribute('href', 'https://portail.111iridescence.org/');
  await expect(page.locator('body')).not.toContainText(/Théo|Theo|Deville/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://111iridescence.org/');
  await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveCount(0);
});

test('homepage keeps its app content and navigation without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '111iridescence.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Apps', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Iridescence Installer' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Iridescence PDF Reader' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mass Print' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Resource Guard' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'QuickPad' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Portal' })).toBeVisible();
  await context.close();
});

test('generated sitemap contains only current public page routes', async () => {
  const index = await readFile('dist/sitemap-index.xml', 'utf8');
  expect(index).toContain('sitemap-0.xml');
  const sitemap = await readFile('dist/sitemap-0.xml', 'utf8');
  for (const path of publicRoutes) {
    const suffix = path.endsWith('/') ? path : `${path}/`;
    expect(sitemap).toContain(`https://111iridescence.org${suffix}`);
  }
  expect(sitemap).not.toContain('/blog');
  expect(sitemap).not.toContain('/projets');
  expect(sitemap).not.toContain('/tags');
  expect(sitemap).not.toContain('https://111iridescence.org/a-propos/');
  expect(sitemap).not.toContain('/404');

  const robots = await readFile('dist/robots.txt', 'utf8');
  expect(robots).toContain('Allow: /');
  expect(robots).toContain('Sitemap: https://111iridescence.org/sitemap-index.xml');
});

test('reviewed release pages match responsive screenshots', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'One deterministic screenshot set is sufficient.');
  test.skip(process.platform !== 'darwin', 'The reviewed screenshot baseline is generated on macOS.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/releases/**', (route) => {
    const massPrint = route.request().url().endsWith('/mass-print');
    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(massPrint ? {
        available: true,
        version: '0.1.3',
        format: 'DMG universel',
        downloadUrl: 'https://github.com/gobelet69/Mass-Print/releases/download/v0.1.3/Mass.Print_0.1.3_universal.dmg',
        notes: 'Universal macOS build.',
      } : { available: false, compatibility: 'macOS 14 ou version ultérieure', architecture: 'Apple Silicon' }),
    });
  });
  for (const shot of [
    { name: 'homepage-desktop.png', path: '/', width: 1440, height: 900 },
    { name: 'homepage-mobile.png', path: '/', width: 390, height: 844 },
    { name: 'apps-catalog.png', path: '/apps', width: 1440, height: 900 },
    { name: 'pdf-reader-product.png', path: '/apps/iridescence-pdf-reader', width: 1440, height: 900 },
    { name: 'mass-print-product-mobile.png', path: '/apps/mass-print', width: 390, height: 844 },
  ]) {
    await page.setViewportSize({ width: shot.width, height: shot.height });
    await page.goto(shot.path);
    if (shot.path === '/') {
      await expect(page.locator('[data-pixel-canvas]')).toHaveAttribute('data-render-state', 'ready');
      await page.waitForTimeout(200);
    }
    const lazyImages = page.locator('main img[loading="lazy"]');
    for (let index = 0; index < await lazyImages.count(); index += 1) await lazyImages.nth(index).scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll<HTMLImageElement>('main img')].every((image) => image.complete && image.naturalWidth > 0));
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page).toHaveScreenshot(shot.name, {
      // Full-page capture temporarily resizes the viewport and legitimately
      // rebuilds the responsive pixel canvas. Hero snapshots stay viewport-sized;
      // dedicated catalog/product snapshots cover the remaining long pages.
      fullPage: shot.path !== '/',
      animations: 'disabled',
      // Font/image antialiasing can vary by a few hundred pixels when the full
      // browser suite is saturated; this remains far below 0.01% of each image.
      maxDiffPixels: 512,
      timeout: 15_000,
    });
  }
});
