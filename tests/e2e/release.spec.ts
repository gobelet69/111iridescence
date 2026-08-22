import { expect, test } from '@playwright/test';

test('public release surfaces stay coherent and anonymous', async ({ page, request }) => {
  for (const path of [
    '/',
    '/blog',
    '/blog/pourquoi-ce-site-reste-statique',
    '/tags',
    '/projets',
    '/projets/vault',
    '/a-propos',
    '/rss.xml',
  ]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()['set-cookie'], path).toBeUndefined();
  }

  await page.goto('/');
  await expect(page.getByRole('link', { name: '111iridescence.' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toContainText('Blog');
  await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toContainText('Projets');
  await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toContainText('À propos');
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Portail' })).toHaveAttribute('href', 'https://portail.111iridescence.org/');
  await expect(page.locator('body')).not.toContainText(/Théo|Theo|Deville/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://111iridescence.org/');
  await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute('href', '/rss.xml');
});

test('homepage keeps its content and navigation without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');

  await expect(page.getByRole('heading', { name: '111iridescence.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Blog' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Projets' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'À propos' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Portail' })).toBeVisible();
  await context.close();
});

test('focus and reduced-motion preferences remain visible and respected', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const skipLink = page.getByRole('link', { name: 'Aller au contenu' });
  if (testInfo.project.name === 'desktop') await page.keyboard.press('Tab');
  else await skipLink.focus();
  await expect(skipLink).toBeFocused();
  const motion = await page.locator('body').evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      animationDuration: styles.animationDuration,
      transitionDuration: styles.transitionDuration,
    };
  });
  expect(['0.01ms', '1e-05s', '0.00001s']).toContain(motion.animationDuration);
  expect(['0.01ms', '1e-05s', '0.00001s']).toContain(motion.transitionDuration);
});

test('release pages match reviewed responsive screenshots', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'One deterministic screenshot set is sufficient.');
  test.skip(process.platform !== 'darwin', 'The reviewed screenshot baseline is generated on macOS.');
  await page.emulateMedia({ reducedMotion: 'reduce' });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage-desktop.png', { fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage-mobile.png', { fullPage: true });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/blog');
  await expect(page).toHaveScreenshot('blog-index.png', { fullPage: true });

  await page.goto('/blog/pourquoi-ce-site-reste-statique');
  await expect(page).toHaveScreenshot('article.png', { fullPage: true });

  await page.goto('/projets');
  await expect(page).toHaveScreenshot('projects.png', { fullPage: true });
});
