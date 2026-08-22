import { expect, test } from '@playwright/test';

const profileSentence =
  "Je développe mes propres outils et je documente ce que j'apprends sur le web et la sécurité.";

test('homepage prioritizes identity, content, and then portal', async ({ page }) => {
  await page.goto('/');

  const main = page.getByRole('main');
  const heroHeading = main.getByRole('heading', { level: 1 });
  const contentHeading = main.getByRole('heading', {
    name: 'À lire et à explorer',
  });
  const footer = page.getByRole('contentinfo');

  await expect(heroHeading).toHaveText('111iridescence.');
  await expect(contentHeading).toBeVisible();
  await expect(main).toContainText(profileSentence);
  await expect(
    footer.getByRole('link', { name: 'Portail' }),
  ).toBeVisible();

  const [heroBox, contentBox, footerBox] = await Promise.all([
    heroHeading.boundingBox(),
    contentHeading.boundingBox(),
    footer.boundingBox(),
  ]);

  expect(heroBox).not.toBeNull();
  expect(contentBox).not.toBeNull();
  expect(footerBox).not.toBeNull();

  expect(heroBox!.y).toBeLessThan(contentBox!.y);
  expect(contentBox!.y).toBeLessThan(footerBox!.y);
});

test('homepage previews only factual blog and project destinations', async ({
  page,
}) => {
  await page.goto('/');

  const section = page.getByRole('region', {
    name: 'À lire et à explorer',
  });
  const previews = section.getByRole('article');

  await expect(previews).toHaveCount(2);

  // The latest blog publication can legitimately be either an article or a note.
  await expect(previews.nth(0)).toContainText(/Article|Note/);

  await expect(
    previews.nth(0).getByRole('link'),
  ).toHaveAttribute('href', /^\/blog\/[^/]+$/);

  await expect(previews.nth(1)).toContainText('Projet');
  await expect(previews.nth(1)).toContainText('PwdGen');

  await expect(
    previews.nth(1).getByRole('link'),
  ).toHaveAttribute('href', 'https://github.com/gobelet69/PwdGen');
});

test('homepage advertises the RSS feed in document metadata', async ({
  page,
}) => {
  await page.goto('/');

  await expect(
    page.locator(
      'link[rel="alternate"][type="application/rss+xml"]',
    ),
  ).toHaveAttribute('href', '/rss.xml');
});

test('custom 404 keeps the missing address and offers public routes', async ({
  page,
}) => {
  const response = await page.goto('/adresse-inconnue');

  expect(response?.status()).toBe(404);

  await expect(page).toHaveURL(/\/adresse-inconnue$/);

  await expect(
    page.getByRole('heading', { level: 1 }),
  ).toHaveText('Page introuvable');

  await expect(page.getByRole('main')).toContainText(
    "Cette adresse n'existe pas.",
  );

  await expect(
    page.getByRole('main').getByRole('link', { name: 'Accueil' }),
  ).toHaveAttribute('href', '/');

  await expect(
    page.getByRole('main').getByRole('link', { name: 'Blog' }),
  ).toHaveAttribute('href', '/blog');

  await expect(
    page.getByRole('main').getByRole('link', { name: 'Projets' }),
  ).toHaveAttribute('href', '/projets');

  await expect(
    page.getByRole('main').getByRole('link', { name: 'À propos' }),
  ).toHaveAttribute('href', '/a-propos');
});

test('homepage content and navigation remain accessible without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
  });

  const page = await context.newPage();

  await page.goto('/');

  await expect(
    page.getByRole('heading', { level: 1 }),
  ).toBeVisible();

  await expect(
    page.getByRole('heading', { level: 1 }),
  ).toHaveText('111iridescence.');

  await expect(
    page
      .getByRole('region', { name: 'À lire et à explorer' })
      .getByRole('article'),
  ).toHaveCount(2);

  await expect(
    page.getByText(profileSentence, { exact: true }),
  ).toBeVisible();

  await expect(
    page.getByRole('link', { name: 'Aller au contenu' }),
  ).toHaveAttribute('href', '#contenu');

  await context.close();
});

test('public homepage stays anonymous', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('body')).not.toContainText(
    /Théo|Theo|Deville/i,
  );
});

test('homepage stays readable without horizontal overflow at 320 pixels', async ({
  page,
}) => {
  await page.setViewportSize({
    width: 320,
    height: 700,
  });

  await page.goto('/');

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(
    dimensions.clientWidth,
  );

  const profile = page.getByText(profileSentence, {
    exact: true,
  });

  await expect(profile).toBeVisible();

  const typography = await profile.evaluate((element) => {
    const styles = getComputedStyle(element);

    return {
      fontSize: Number.parseFloat(styles.fontSize),
      lineHeight: Number.parseFloat(styles.lineHeight),
    };
  });

  expect(typography.fontSize).toBeGreaterThanOrEqual(16);
  expect(
    typography.lineHeight / typography.fontSize,
  ).toBeGreaterThanOrEqual(1.5);
});
