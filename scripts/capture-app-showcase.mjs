import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = process.env.QA_OUTPUT_DIR ?? path.resolve(root, '..', '..', 'outputs', 'qa', 'after');
const baseURL = process.env.QA_BASE_URL ?? 'http://127.0.0.1:4321';
const viewports = [
  { label: '1440x900', width: 1440, height: 900 },
  { label: '1280x800', width: 1280, height: 800 },
  { label: '768x1024', width: 768, height: 1024 },
  { label: '390x844', width: 390, height: 844 },
];
const routes = [
  { label: 'home', path: '/' },
  { label: 'apps', path: '/apps' },
  { label: 'pdf-reader', path: '/apps/iridescence-pdf-reader' },
  { label: 'mass-print', path: '/apps/mass-print' },
];

async function primeLazyImages(page) {
  const images = page.locator('main img[loading="lazy"]');
  for (let index = 0; index < await images.count(); index += 1) {
    await images.nth(index).scrollIntoViewIfNeeded();
  }
  await page.waitForFunction(() => [...document.querySelectorAll('main img')].every((image) => image.complete && image.naturalWidth > 0));
  await page.locator('main img').evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
  await page.waitForTimeout(100);
  await page.evaluate(() => window.scrollTo(0, 0));
}

function releasePayload(slug) {
  if (slug === 'mass-print') return {
    available: true,
    version: '0.1.3',
    format: 'DMG universel',
    downloadUrl: 'https://github.com/gobelet69/Mass-Print/releases/download/v0.1.3/Mass.Print_0.1.3_universal.dmg',
    notes: 'Universal macOS build.',
  };
  return { available: false, compatibility: 'macOS 14 ou version ultérieure', architecture: 'Apple Silicon' };
}

await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const captured = [];

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/releases/**', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify(releasePayload(route.request().url().split('/').pop())),
  }));
  for (const route of routes) {
    await page.goto(`${baseURL}${route.path}`, { waitUntil: 'networkidle' });
    if (route.path === '/') await page.locator('[data-pixel-canvas][data-render-state="ready"]').waitFor();
    await primeLazyImages(page);
    const file = path.join(output, `${route.label}-${viewport.label}-full.png`);
    await page.screenshot({ path: file, fullPage: true, animations: 'disabled' });
    captured.push({ file, label: `${route.label} · ${viewport.label}` });
    if (route.path === '/') {
      for (const [part, selector] of [['hero', '[data-pixel-hero]'], ['apps-section', '#apps'], ['header', '.site-header'], ['footer', '.site-footer']]) {
        const partFile = path.join(output, `home-${part}-${viewport.label}.png`);
        await page.locator(selector).screenshot({ path: partFile, animations: 'disabled' });
        captured.push({ file: partFile, label: `home ${part} · ${viewport.label}` });
      }
    }
  }
  await context.close();
}

const contactPage = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const cards = [];
for (const item of captured.filter(({ label }) => label.includes('1440x900') || label.includes('390x844'))) {
  const encoded = (await readFile(item.file)).toString('base64');
  cards.push(`<figure><img src="data:image/png;base64,${encoded}" alt=""><figcaption>${item.label}</figcaption></figure>`);
}
await contactPage.setContent(`<!doctype html><style>body{margin:0;padding:28px;background:#21182b;color:#faf8fa;font:16px system-ui}h1{font:700 30px monospace}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;align-items:start}figure{margin:0;padding:12px;background:#f3eff4;border-radius:16px}img{width:100%;height:auto;display:block;border-radius:8px}figcaption{padding:10px 4px 0;color:#21182b;font:700 14px monospace}</style><h1>111iridescence · QA après refonte</h1><div class="grid">${cards.join('')}</div>`);
await contactPage.screenshot({ path: path.join(output, 'contact-sheet.png'), fullPage: true });

const comparisonItems = [
  { file: path.resolve(output, '..', 'before', 'hero-1440x900.png'), label: 'Avant · hero · 1440×900' },
  { file: path.join(output, 'home-hero-1440x900.png'), label: 'Après · hero · 1440×900' },
  { file: path.resolve(output, '..', 'before', 'hero-390x844.png'), label: 'Avant · hero · 390×844' },
  { file: path.join(output, 'home-hero-390x844.png'), label: 'Après · hero · 390×844' },
];
const comparisons = [];
for (const item of comparisonItems) {
  const encoded = (await readFile(item.file)).toString('base64');
  comparisons.push(`<figure><img src="data:image/png;base64,${encoded}" alt=""><figcaption>${item.label}</figcaption></figure>`);
}
await contactPage.setContent(`<!doctype html><style>body{margin:0;padding:28px;background:#21182b;color:#faf8fa;font:16px system-ui}h1{font:700 30px monospace}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;align-items:start}figure{margin:0;padding:12px;background:#f3eff4;border-radius:16px}img{width:100%;height:auto;display:block;border-radius:8px}figcaption{padding:10px 4px 0;color:#21182b;font:700 14px monospace}</style><h1>111iridescence · hero avant / après</h1><div class="grid">${comparisons.join('')}</div>`);
await contactPage.screenshot({ path: path.join(output, 'before-after-hero.png'), fullPage: true });
await writeFile(path.join(output, 'manifest.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), baseURL, files: captured.map((item) => path.basename(item.file)) }, null, 2)}\n`);
await browser.close();

console.log(`Captured ${captured.length} views in ${output}`);
