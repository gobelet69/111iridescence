import { expect, test } from '@playwright/test';

test('blog lists public entries and hides the private draft', async ({ page }) => {
  await page.goto('/blog');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blog');
  await expect(page.getByRole('link', { name: 'Ouverture' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Pourquoi ce site reste statique' })).toBeVisible();
  await expect(page.getByText('Brouillon privé')).toHaveCount(0);
});

test('article and note links share the blog namespace', async ({ page }) => {
  await page.goto('/blog/ouverture');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ouverture');
  await expect(page.locator('a[href^="/tags/"]')).toHaveCount(2);
  await expect(page.getByText('La racine de 111iridescence change de rôle.')).toBeVisible();
});

test('drafts do not generate public routes', async ({ page }) => {
  const response = await page.goto('/blog/brouillon-prive');

  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page introuvable');
});

test('RSS publishes absolute public links newest first', async ({ request }) => {
  const response = await request.get('/rss.xml');
  const xml = await response.text();

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('xml');
  expect(xml).not.toContain('Brouillon privé');
  expect(xml).toContain('https://111iridescence.org/blog/pourquoi-ce-site-reste-statique');
  expect(xml.indexOf('Pourquoi ce site reste statique')).toBeLessThan(xml.indexOf('Ouverture'));
});
