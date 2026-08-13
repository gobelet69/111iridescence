import { expect, test } from '@playwright/test';

test('a note stays compact without article-only navigation', async ({ page }) => {
  await page.goto('/blog/ouverture');

  await expect(page.getByRole('navigation', { name: 'Sur cette page' })).toHaveCount(0);
  await expect(page.getByText(/min de lecture/)).toHaveCount(0);
  await expect(page.getByText('Dans cette série')).toHaveCount(0);
});

test('a technical article exposes stable reading landmarks', async ({ page }) => {
  await page.goto('/blog/pourquoi-ce-site-reste-statique');

  const toc = page.getByRole('navigation', { name: 'Sur cette page' });
  await expect(toc).toBeVisible();
  await expect(toc.getByRole('link')).toHaveCount(3);
  await expect(page.getByText('1 min de lecture')).toBeVisible();
  await expect(page.locator('#deux-surfaces-un-domaine')).toBeVisible();
  await expect(page.locator('#ce-qui-reste-dynamique')).toBeVisible();
  await expect(page.locator('#pourquoi-garder-cette-séparation')).toBeVisible();
  await expect(page.locator('pre.astro-code code')).toContainText('matchPortalRoute');
  await expect(page.getByRole('button', { name: 'Copier' })).toBeVisible();
  await expect(page.getByText('Dans cette série')).toHaveCount(0);
});

test('reading remains complete when JavaScript is disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto('/blog/pourquoi-ce-site-reste-statique');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pourquoi ce site reste statique');
  await expect(page.locator('pre code')).toContainText('matchPortalRoute');
  await expect(page.getByRole('button', { name: 'Copier' })).toHaveCount(0);

  await context.close();
});

test('draft route remains absent from the generated publication set', async ({ page }) => {
  const response = await page.goto('/blog/brouillon-prive');
  expect(response?.status()).toBe(404);
});
