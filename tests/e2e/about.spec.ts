import { expect, test } from '@playwright/test';

test('about page presents an anonymous first-person profile', async ({ page }) => {
  const response = await page.goto('/a-propos');

  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Curieux de nature.');
  await expect(page.getByRole('heading', { name: 'Tout commence par la curiosité.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'De l’idée au logiciel.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Comprendre avant de sécuriser.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Apprendre en manipulant.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Soigner ce que l’on ressent.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'L’IA fait partie du processus.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Des idées qui deviennent des applications.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Les détails comptent.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Au-delà de l’écran.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Toujours quelque chose à explorer.' })).toBeVisible();
  await expect(page.getByRole('main')).toContainText('Master en cybersécurité');
  await expect(page.getByRole('main')).toContainText('ski');
  await expect(page.getByRole('main')).toContainText('escalade');
  await expect(page.getByRole('main').getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', 'https://github.com/gobelet69');
  await expect(page.locator('body')).not.toContainText(/Théo|Theo|Deville/i);
});

test('public navigation exposes the about page', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', { name: 'À propos' }))
    .toHaveAttribute('href', '/a-propos');
});
