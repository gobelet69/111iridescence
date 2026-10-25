import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = process.env.QA_OUTPUT_DIR ?? path.resolve(root, '..', '..', 'outputs', 'qa', 'about');
const baseURL = process.env.QA_BASE_URL ?? 'http://127.0.0.1:4321';
const viewports = [
  { label: '1440x900', width: 1440, height: 900 },
  { label: '1280x800', width: 1280, height: 800 },
  { label: '768x1024', width: 768, height: 1024 },
  { label: '390x844', width: 390, height: 844 },
];

async function encode(file) {
  return (await readFile(file)).toString('base64');
}

await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const captured = [];

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto(`${baseURL}/a-propos/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const fullFile = path.join(output, `about-${viewport.label}-full.png`);
  await page.screenshot({ path: fullFile, fullPage: true, animations: 'disabled' });
  captured.push({ file: fullFile, label: `Page complète · ${viewport.label}` });
  // Element screenshots can relocate fixed off-canvas UI into the clip. The
  // complete-page capture above remains the source of truth for the skip link.
  await page.locator('.skip-link').evaluate((element) => { element.style.display = 'none'; });

  for (const [part, selector] of [
    ['hero', '.about-hero'],
    ['ai', '#ai-process'],
    ['closing', '#closing'],
    ['footer', '.site-footer'],
  ]) {
    await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
    const partFile = path.join(output, `about-${part}-${viewport.label}.png`);
    await page.locator(selector).screenshot({ path: partFile, animations: 'disabled' });
    captured.push({ file: partFile, label: `${part} · ${viewport.label}` });
  }

  await context.close();
}

const contactPage = await browser.newPage({ viewport: { width: 1800, height: 1000 } });
const cards = [];
for (const item of captured.filter(({ label }) => label.includes('1440x900') || label.includes('390x844'))) {
  cards.push(`<figure><img src="data:image/png;base64,${await encode(item.file)}" alt=""><figcaption>${item.label}</figcaption></figure>`);
}
await contactPage.setContent(`<!doctype html><style>
  body{margin:0;padding:28px;background:#21182b;color:#faf8fa;font:16px system-ui}
  h1{font:700 30px ui-monospace,monospace}
  .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;align-items:start}
  figure{margin:0;padding:12px;background:#f3eff4;border-radius:16px}
  img{width:100%;height:auto;display:block;border-radius:8px}
  figcaption{padding:10px 4px 0;color:#21182b;font:700 14px ui-monospace,monospace}
</style><h1>111iridescence · QA de la page À propos</h1><div class="grid">${cards.join('')}</div>`);
await contactPage.screenshot({ path: path.join(output, 'contact-sheet.png'), fullPage: true });

await writeFile(
  path.join(output, 'manifest.json'),
  `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    baseURL,
    route: '/a-propos/',
    reducedMotion: true,
    files: captured.map((item) => path.basename(item.file)),
  }, null, 2)}\n`,
);

await browser.close();
console.log(`Captured ${captured.length} views in ${output}`);
