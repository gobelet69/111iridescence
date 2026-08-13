import { expect, test } from '@playwright/test';

test('about page presents an anonymous first-person profile', async ({ page }) => {
  const response = await page.goto('/a-propos');

  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('À propos');
  await expect(page.getByRole('heading', { name: 'Ce que je fais' })).toBeVisible();
  await expect(page.getByRole('heading', { name: "Ce qui m'intéresse" })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Pourquoi ce site' })).toBeVisible();
  await expect(page.getByRole('main').getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/gobelet69');
  await expect(page.locator('body')).not.toContainText(/Théo|Theo|Deville/i);
});

test('public navigation exposes the about page', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', { name: 'À propos' }))
    .toHaveAttribute('href', '/a-propos');
});
