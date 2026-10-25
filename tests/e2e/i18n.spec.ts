import { expect, test } from '@playwright/test';

const routes = [
  ['/', 'en', 'My apps'],
  ['/apps', 'en', 'Apps for macOS'],
  ['/about', 'en', 'Curious by nature.'],
  ['/fr/', 'fr', 'Mes apps'],
  ['/fr/apps', 'fr', 'Apps pour macOS'],
  ['/fr/a-propos', 'fr', 'Curieux de nature.'],
] as const;

for (const [path, locale, heading] of routes) {
  test(`${path} renders directly in ${locale}`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  });
}

test('language selector preserves home, catalog, about and product pages', async ({ page }) => {
  for (const [english, french] of [
    ['/', '/fr/'],
    ['/apps', '/fr/apps'],
    ['/about', '/fr/a-propos'],
    ['/apps/mass-print', '/fr/apps/mass-print'],
  ]) {
    await page.goto(`${english}?source=switch`);
    const frenchLink = page.getByRole('link', { name: 'Français' });
    await expect(frenchLink).toHaveAttribute('href', `${french}?source=switch`);
    await frenchLink.click();
    await expect(page).toHaveURL(new RegExp(`${french.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\?source=switch$`));
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.getByRole('link', { name: 'English' })).toHaveAttribute('href', `${english}?source=switch`);
  }
});

test('product content and assistive labels are translated', async ({ page }) => {
  await page.goto('/apps/iridescence-pdf-reader');
  await expect(page.getByText('A native PDF reader for macOS, designed for fast, fluid, distraction-free reading.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#contenu');
  await expect(page.getByRole('img', { name: /main window with a workspace/ })).toBeVisible();

  await page.goto('/fr/apps/iridescence-pdf-reader');
  await expect(page.getByText('Un lecteur PDF natif pour macOS, conçu pour une lecture rapide, fluide et sans distraction.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Aller au contenu' })).toHaveAttribute('href', '#contenu');
  await expect(page.getByRole('img', { name: /Fenêtre principale/ })).toBeVisible();
});

test('both language trees remain complete without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const path of ['/', '/about', '/apps/mass-print', '/fr/', '/fr/a-propos', '/fr/apps/mass-print']) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('link', { name: path.startsWith('/fr') ? 'English' : 'Français' })).toBeVisible();
  }
  await context.close();
});
