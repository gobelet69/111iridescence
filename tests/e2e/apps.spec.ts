import { expect, test } from '@playwright/test';

test('apps catalog presents current products and future growth', async ({ page }) => {
  await page.goto('/apps');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Apps for macOS');
  await expect(page.getByRole('article')).toHaveCount(2);
  await expect(page.getByRole('link', { name: /Iridescence PDF Reader/ })).toHaveAttribute('href', '/apps/iridescence-pdf-reader');
  await expect(page.getByRole('link', { name: /Mass Print/ })).toHaveAttribute('href', '/apps/mass-print');
  await expect(page.getByRole('main')).toContainText('More applications will follow');
});

test('PDF Reader page exposes authentic chapters, metadata, and launch fallback', async ({ page }) => {
  await page.goto('/apps/iridescence-pdf-reader');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Iridescence PDF Reader');
  for (const id of ['overview', 'gallery', 'workspaces', 'reading', 'command-palette', 'ocr', 'download']) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.getByRole('img', { name: /main window/ })).toHaveAttribute('src', /reader-workspace-light\.png$/);
  await expect(page.getByText('macOS 14 or later', { exact: true }).first()).toBeVisible();
  await expect(page.locator('[data-release-role="link"]').last()).toHaveText('Coming soon');
  const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
  expect(jsonLd).toContain('SoftwareApplication');
  await expect(page.getByRole('link', { name: /All apps/ })).toHaveAttribute('href', '/apps');
});

test('Mass Print page activates the real-shaped DMG download experience', async ({ page }) => {
  await page.route('**/api/releases/mass-print', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({
      available: true,
      version: '0.1.3',
      format: 'DMG universel',
      downloadUrl: 'https://github.com/gobelet69/Mass-Print/releases/download/v0.1.3/Mass.Print_0.1.3_universal.dmg',
      notes: 'Universal macOS build.',
    }),
  }));
  await page.goto('/apps/mass-print');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mass Print');
  for (const id of ['overview', 'features', 'gallery', 'ordering', 'finder', 'privacy', 'download']) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.getByRole('heading', { name: 'Print order', exact: true })).toBeVisible();
  const download = page.locator('[data-release-role="link"]').last();
  await expect(download).toHaveText('Download for macOS');
  await expect(download).toHaveAttribute('href', /Mass\.Print_0\.1\.3_universal\.dmg$/);
  await expect(page.getByText('Your documents stay on your Mac')).toBeVisible();
});

for (const slug of ['iridescence-pdf-reader', 'mass-print']) {
  test(`${slug} remains within the viewport and exposes one H1`, async ({ page }) => {
    await page.goto(`/apps/${slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    const widths = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(widths.scroll, slug).toBeLessThanOrEqual(widths.client);
  });
}
