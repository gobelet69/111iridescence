import { expect, test } from '@playwright/test';

const routes = [
  '/', '/apps', '/apps/iridescence-installer', '/apps/iridescence-pdf-reader', '/apps/mass-print', '/apps/resource-guard', '/apps/quickpad', '/about',
  '/fr/', '/fr/apps', '/fr/apps/iridescence-installer', '/fr/apps/iridescence-pdf-reader', '/fr/apps/mass-print', '/fr/apps/resource-guard', '/fr/apps/quickpad', '/fr/a-propos',
];

test('current public pages have landmarks, ordered headings, intrinsic images, and no runtime errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/api/releases/**', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ available: false, compatibility: 'macOS', architecture: 'Mac' }),
  }));
  for (const route of routes) {
    await page.goto(route);
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('banner')).toHaveCount(1);
    await expect(page.getByRole('contentinfo')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    const levels = await page.locator('main h1, main h2, main h3').evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));
    for (let index = 1; index < levels.length; index += 1) {
      expect(levels[index] - levels[index - 1], `${route} heading ${index}`).toBeLessThanOrEqual(1);
    }
    const invalidImages = await page.locator('main img').evaluateAll((images) => images.filter((image) => (
      !image.hasAttribute('alt')
      || Number(image.getAttribute('width')) <= 0
      || Number(image.getAttribute('height')) <= 0
      || !['lazy', 'eager'].includes(image.getAttribute('loading') ?? '')
    )).map((image) => image.getAttribute('src')));
    expect(invalidImages, route).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test('keyboard entry exposes a high-visibility skip link', async ({ page }, testInfo) => {
  await page.goto('/');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  if (testInfo.project.name === 'desktop') await page.keyboard.press('Tab');
  else await skip.focus();
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#contenu$/);
});

test('all internal links exposed by current public pages resolve', async ({ page, request }) => {
  const hrefs = new Set<string>();
  for (const route of routes) {
    await page.goto(route);
    for (const href of await page.locator('a[href^="/"]').evaluateAll((links) => links.map((link) => link.getAttribute('href')!))) hrefs.add(href);
  }
  for (const href of hrefs) {
    const response = await request.get(href);
    expect(response.status(), href).toBeLessThan(400);
  }
});

test('the personal story remains complete without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/fr/a-propos');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Curieux de nature.');
  for (const id of ['explorations', 'ai-process', 'identity', 'closing']) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.getByRole('link', { name: 'Découvrir mes applications' })).toHaveAttribute('href', '/fr/apps');
  await expect(page.getByRole('link', { name: 'Voir mes projets sur GitHub' }))
    .toHaveAttribute('href', 'https://github.com/gobelet69');
  await context.close();
});

for (const viewport of [
  { width: 2560, height: 1440 },
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 430, height: 932 },
  { width: 390, height: 844 },
  { width: 375, height: 667 },
  { width: 320, height: 568 },
]) {
  test(`public layouts stay inside ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(route);
      const widths = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
      expect(widths.scroll, `${route} at ${viewport.width}px`).toBeLessThanOrEqual(widths.client);
    }
  });
}
