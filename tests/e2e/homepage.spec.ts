import { expect, test } from '@playwright/test';

test('homepage preserves the identity hero and makes the two macOS apps the focus', async ({ page }) => {
  await page.goto('/');
  const main = page.getByRole('main');
  const hero = page.locator('[data-pixel-hero]');
  const apps = main.getByRole('region', { name: 'My apps' });

  await expect(hero.getByRole('heading', { level: 1 })).toHaveText('111iridescence.');
  await expect(hero).not.toContainText('Des applications macOS pensées');
  await expect(hero).not.toContainText('le signal n’est jamais fixe.');
  await expect(apps.getByRole('article')).toHaveCount(4);

  const chapters = apps.getByRole('article');
  await expect(chapters.nth(0)).toContainText('Iridescence PDF Reader');
  await expect(chapters.nth(1)).toContainText('Mass Print');
  await expect(chapters.nth(2)).toContainText('Resource Guard');
  await expect(chapters.nth(3)).toContainText('QuickPad');
  await expect(chapters.nth(0).getByRole('img')).toHaveAttribute('src', /reader-workspace-light\.png$/);
  await expect(chapters.nth(1).getByRole('img')).toHaveAttribute('src', /mass-print-main\.png$/);
  await expect(chapters.nth(2).getByRole('img')).toHaveAttribute('src', /resource-guard-main\.png$/);
  await expect(chapters.nth(3).getByRole('img')).toHaveAttribute('src', /quickpad-main\.png$/);
  await expect(chapters.nth(0).getByRole('link', { name: 'Discover' })).toHaveAttribute('href', '/apps/iridescence-pdf-reader');
  await expect(chapters.nth(1).getByRole('link', { name: 'Discover' })).toHaveAttribute('href', '/apps/mass-print');
  await expect(chapters.nth(2).getByRole('link', { name: 'Discover' })).toHaveAttribute('href', '/apps/resource-guard');
  await expect(chapters.nth(3).getByRole('link', { name: 'Discover' })).toHaveAttribute('href', '/apps/quickpad');
  await expect(apps.getByText('Focused macOS tools that respect your data.')).toBeVisible();

  const presentation = await chapters.evaluateAll((items) => items.map((item) => {
    const iconFrame = item.querySelector<HTMLElement>('.product-chapter__icon-frame');
    const title = item.querySelector<HTMLElement>('h3');
    if (!iconFrame || !title) return null;
    const frame = iconFrame.getBoundingClientRect();
    return {
      iconWidth: frame.width,
      iconHeight: frame.height,
      titleMinBlockSize: Number.parseFloat(getComputedStyle(title).minBlockSize),
    };
  }));
  expect(presentation).toHaveLength(4);
  expect(presentation.every((item) => item && item.iconWidth === item.iconHeight && item.iconWidth >= 64)).toBe(true);
  if ((page.viewportSize()?.width ?? 0) >= 928) {
    expect(presentation.every((item) => item && item.titleMinBlockSize > 0)).toBe(true);
    expect(presentation[0]?.titleMinBlockSize).toBe(presentation[1]?.titleMinBlockSize);
  }

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
  await expect(page.getByRole('region', { name: 'My apps' }).getByRole('article')).toHaveCount(4);
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
