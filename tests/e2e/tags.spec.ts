import { expect, test } from '@playwright/test';

test('tag index exposes only public tag counts', async ({ page }) => {
  await page.goto('/tags');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tags');
  await expect(page.getByRole('link', { name: '#astro 2 publications' })).toBeVisible();
  await expect(page.getByRole('link', { name: '#architecture-web 2 publications' })).toBeVisible();
  await expect(page.getByRole('link', { name: /#publication/ })).toHaveCount(0);
});

test('tag archive lists matching publications newest first', async ({ page }) => {
  await page.goto('/tags/astro');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('#astro');
  const titles = page.locator('.post-card h2 a');
  await expect(titles).toHaveText([
    'Pourquoi ce site reste statique',
    'Ouverture',
  ]);
});

test('a tag found only in a draft has no public archive', async ({ page }) => {
  const response = await page.goto('/tags/publication');
  expect(response?.status()).toBe(404);
});

test('blog format controls filter progressively and update the URL', async ({ page }) => {
  await page.goto('/blog');

  await page.getByRole('button', { name: 'Notes' }).click();
  await expect(page.locator('[data-format="note"]')).toBeVisible();
  await expect(page.locator('[data-format="article"]')).toBeHidden();
  await expect(page).toHaveURL(/\?format=note$/);
  await expect(page.getByRole('button', { name: 'Notes' })).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: 'Tout' }).click();
  await expect(page.locator('[data-format="article"]')).toBeVisible();
  await expect(page).not.toHaveURL(/format=/);
});

test('all publications remain visible without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto('/blog?format=note');
  await expect(page.locator('[data-format="note"]')).toBeVisible();
  await expect(page.locator('[data-format="article"]')).toBeVisible();

  await context.close();
});
