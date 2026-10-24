import { expect, test } from '@playwright/test';

const routes = ['/', '/apps', '/apps/iridescence-pdf-reader', '/apps/mass-print', '/a-propos'];

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
  const skip = page.getByRole('link', { name: 'Aller au contenu' });
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

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
]) {
  test(`public layouts stay inside ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(route);
      const widths = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
      expect(widths.scroll, route).toBeLessThanOrEqual(widths.client);
    }
  });
}
