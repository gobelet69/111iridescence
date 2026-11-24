import { expect, test } from '@playwright/test';

test('homepage preserves the identity hero and makes the five macOS apps the focus', async ({ page }) => {
  await page.route('**/api/releases/**', (route) => {
    const massPrint = route.request().url().endsWith('/mass-print');
    return route.fulfill({
      json: massPrint ? {
        available: true,
        version: '0.1.3',
        format: 'DMG universel',
        downloadUrl: 'https://github.com/gobelet69/Mass-Print/releases/download/v0.1.3/Mass.Print_0.1.3_universal.dmg',
        notes: '',
      } : { available: false },
    });
  });
  await page.goto('/');
  const main = page.getByRole('main');
  const hero = page.locator('[data-pixel-hero]');
  const apps = main.getByRole('region', { name: 'My apps' });

  await expect(hero.getByRole('heading', { level: 1 })).toHaveText('111iridescence.');
  await expect(hero).not.toContainText('Des applications macOS pensées');
  await expect(hero).not.toContainText('le signal n’est jamais fixe.');
  await expect(apps.getByRole('article')).toHaveCount(5);

  const shortcuts = apps.getByRole('navigation', { name: 'Direct app access' });
  await expect(shortcuts.getByRole('link')).toHaveCount(5);
  await expect(shortcuts.getByRole('link', { name: 'QuickPad' })).toHaveAttribute('href', '/apps/quickpad');
  await expect(apps.getByText('Focused macOS tools that respect your data.')).toBeVisible();

  const chapters = apps.getByRole('article');
  await expect(chapters.nth(0)).toContainText('Iridescence Installer');
  await expect(chapters.nth(1)).toContainText('Iridescence PDF Reader');
  await expect(chapters.nth(2)).toContainText('Mass Print');
  await expect(chapters.nth(3)).toContainText('Resource Guard');
  await expect(chapters.nth(4)).toContainText('QuickPad');
  await expect(chapters.nth(0).getByRole('img')).toHaveAttribute('src', /installer-main\.png$/);
  await expect(chapters.nth(1).getByRole('img')).toHaveAttribute('src', /reader-workspace-light\.png$/);
  await expect(chapters.nth(2).getByRole('img')).toHaveAttribute('src', /mass-print-main\.png$/);
  await expect(chapters.nth(3).getByRole('img')).toHaveAttribute('src', /resource-guard-main\.png$/);
  await expect(chapters.nth(4).getByRole('img')).toHaveAttribute('src', /quickpad-main\.png$/);
  const products = [
    ['Iridescence Installer', 'iridescence-installer'],
    ['Iridescence PDF Reader', 'iridescence-pdf-reader'],
    ['Mass Print', 'mass-print'],
    ['Resource Guard', 'resource-guard'],
    ['QuickPad', 'quickpad'],
  ];
  for (const [index, [name, slug]] of products.entries()) {
    const chapter = chapters.nth(index);
    await expect(chapter.getByRole('link', { name: `Discover ${name}` })).toHaveAttribute('href', `/apps/${slug}`);
    await expect(chapter.getByRole('link')).toHaveCount(2);
    await expect(chapter).not.toContainText(/macOS \d+/);
  }

  await expect(chapters.nth(2).getByRole('link', { name: 'Download for macOS' })).toHaveAttribute('href', /Mass\.Print_0\.1\.3_universal\.dmg$/);
  await expect(chapters.first().getByRole('link', { name: 'View releases on GitHub' })).toHaveAttribute('href', /github\.com\/[^/]+\/[^/]+\/releases$/);
  await expect(main).not.toContainText('À lire et à explorer');
  await expect(main).not.toContainText('PwdGen');
  await expect(main).not.toContainText('Blog');
});

test('new public navigation and secondary footer are deliberate', async ({ page }) => {
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: 'Main navigation' });
  await expect(navigation.getByRole('link', { name: 'Apps' })).toHaveAttribute('href', '/apps');
  await expect(navigation.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
  await expect(navigation).not.toContainText('Blog');
  await expect(navigation).not.toContainText('Projets');

  const footer = page.getByRole('contentinfo');
  await expect(footer.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/gobelet69');
  await expect(footer.getByRole('link', { name: 'Portal' })).toHaveAttribute('href', 'https://portail.111iridescence.org/');
  await expect(footer).not.toContainText('RSS');
});

test('custom 404 offers the current public routes', async ({ page }) => {
  const response = await page.goto('/adresse-inconnue');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
  await expect(page.getByRole('main').getByRole('link', { name: /All apps/ })).toHaveAttribute('href', '/apps');
  await expect(page.getByRole('main').getByRole('link', { name: /About/ })).toHaveAttribute('href', '/about');
  await expect(page.getByRole('link', { name: 'English' })).toHaveAttribute('href', '/404');
  await expect(page.getByRole('link', { name: 'Français' })).toHaveAttribute('href', '/fr/404');
  await expect(page.getByRole('main')).not.toContainText('Blog');
});

test('homepage product content remains available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('111iridescence.');
  await expect(page.getByRole('region', { name: 'My apps' }).getByRole('article')).toHaveCount(5);
  for (const name of ['Iridescence Installer', 'Iridescence PDF Reader', 'Mass Print', 'Resource Guard', 'QuickPad']) {
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  }
  await expect(page.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#contenu');
  await context.close();
});

test('homepage stays anonymous and free from horizontal overflow at 320 pixels', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/');
  await expect(page.locator('body')).not.toContainText(/Théo|Theo|Deville/i);
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});
