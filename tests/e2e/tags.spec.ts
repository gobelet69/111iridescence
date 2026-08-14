import { expect, test } from '@playwright/test';

test('tag index exposes only public tags', async ({ page }) => {
  await page.goto('/tags');

  await expect(
    page.getByRole('heading', { level: 1 }),
  ).toHaveText('Tags');

  // Do not hardcode publication counts:
  // adding a valid article or note must not break deployment.
  await expect(
    page.getByRole('link', { name: /#astro \d+ publications?/ }),
  ).toBeVisible();

  await expect(
    page.getByRole('link', {
      name: /#architecture-web \d+ publications?/,
    }),
  ).toBeVisible();

  // A tag that exists only in a draft must still stay private.
  await expect(
    page.getByRole('link', { name: /#publication/ }),
  ).toHaveCount(0);
});

test('tag archive lists matching public publications', async ({
  page,
}) => {
  await page.goto('/tags/astro');

  await expect(
    page.getByRole('heading', { level: 1 }),
  ).toHaveText('#astro');

  const titles = page.locator('.post-card h2 a');

  // These known public publications must remain present,
  // but additional articles or notes are allowed.
  await expect(titles.filter({
    hasText: 'Pourquoi ce site reste statique',
  })).toHaveCount(1);

  await expect(
    titles.filter({ hasText: 'Ouverture' }),
  ).toHaveCount(1);
});

test('a tag found only in a draft has no public archive', async ({
  page,
}) => {
  const response = await page.goto('/tags/publication');

  expect(response?.status()).toBe(404);
});

test('blog format controls filter progressively and update the URL', async ({
  page,
}) => {
  await page.goto('/blog');

  const notes = page.locator('[data-format="note"]');
  const articles = page.locator('[data-format="article"]');

  await page
    .getByRole('button', { name: 'Notes' })
    .click();

  // Every note must be visible.
  for (let i = 0; i < await notes.count(); i++) {
    await expect(notes.nth(i)).toBeVisible();
  }

  // Every article must be hidden.
  for (let i = 0; i < await articles.count(); i++) {
    await expect(articles.nth(i)).toBeHidden();
  }

  await expect(page).toHaveURL(/\?format=note$/);

  await expect(
    page.getByRole('button', { name: 'Notes' }),
  ).toHaveAttribute('aria-pressed', 'true');

  await page
    .getByRole('button', { name: 'Tout' })
    .click();

  // "Tout" must restore both notes and articles.
  for (let i = 0; i < await notes.count(); i++) {
    await expect(notes.nth(i)).toBeVisible();
  }

  for (let i = 0; i < await articles.count(); i++) {
    await expect(articles.nth(i)).toBeVisible();
  }

  await expect(page).not.toHaveURL(/format=/);
});

test('all publications remain visible without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
  });

  const page = await context.newPage();

  await page.goto('/blog?format=note');

  const notes = page.locator('[data-format="note"]');
  const articles = page.locator('[data-format="article"]');

  // Without JavaScript, URL filtering must not hide content.
  for (let i = 0; i < await notes.count(); i++) {
    await expect(notes.nth(i)).toBeVisible();
  }

  for (let i = 0; i < await articles.count(); i++) {
    await expect(articles.nth(i)).toBeVisible();
  }

  await context.close();
});