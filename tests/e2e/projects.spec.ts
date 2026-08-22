import { expect, test } from '@playwright/test';

test('projects page presents the approved repositories in editorial order', async ({ page }) => {
  await page.goto('/projets');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projets');
  const cards = page.locator('[data-project-card]');
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0).getByRole('heading', { level: 2 })).toHaveText('PwdGen');
  await expect(cards.nth(1).getByRole('heading', { level: 2 })).toHaveText('OSINT Framework');

  for (const card of await cards.all()) {
    await expect(card.getByText('Actif', { exact: true })).toBeVisible();
    await expect(card.getByRole('link', { name: 'Voir sur GitHub' })).toHaveAttribute(
      'href',
      /^https:\/\/github\.com\/gobelet69\//,
    );
    await expect(card.locator('time')).toBeVisible();
  }

  for (const removedTool of ['editor', 'pdf', 'converter']) {
    await expect(page.locator(`a[href^="/portail/${removedTool}"]`)).toHaveCount(0);
  }
});

test('projects page exposes real contribution activity and all other visible repositories', async ({ page }) => {
  await page.goto('/projets');

  await expect(page.getByRole('img', { name: /\d+ contributions GitHub/i })).toBeVisible();
  await expect(page.locator('[data-contribution-day]')).toHaveCount(369);
  await expect(page.locator('[data-contribution-day][tabindex="0"]')).toHaveCount(0);
  await expect(page.locator('[data-pinned-project]')).toHaveCount(2);
  expect(await page.locator('[data-repository-row]').count()).toBeGreaterThan(20);
  await expect(page.getByText(/111-showcase/i)).toHaveCount(0);
});

test('the complete project catalog remains present without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/projets');

  await expect(page.locator('[data-pinned-project]')).toHaveCount(2);
  expect(await page.locator('[data-repository-row]').count()).toBeGreaterThan(20);
  await context.close();
});

test('GitHub popularity stays secondary to editorial project information', async ({ page }) => {
  await page.goto('/projets');

  const pwdgen = page.locator('[data-project-card]').filter({ hasText: 'PwdGen' });
  await expect(pwdgen).toContainText('Générateur terminal');
  await expect(pwdgen).toContainText('C');
  await expect(pwdgen).toContainText('ncurses');
  await expect(pwdgen.locator('[data-github-meta]')).toContainText(/mis à jour/i);
  await expect(pwdgen.locator('[data-github-meta]')).toContainText(/étoile/i);
});

test('only approved case studies generate local project routes', async ({ page }) => {
  for (const slug of ['vault', 'pwdgen', 'osint-framework', 'editor']) {
    const response = await page.goto(`/projets/${slug}`);
    expect(response?.status()).toBe(404);
  }
});

test('homepage highlights the first curated project case study', async ({ page }) => {
  await page.goto('/');

  const section = page.getByRole('region', { name: 'À lire et à explorer' });
  const project = section.getByRole('article').nth(1);
  await expect(project).toContainText('PwdGen');
  await expect(project.getByRole('link')).toHaveAttribute('href', 'https://github.com/gobelet69/PwdGen');
});

test('project cards remain single-column without horizontal overflow on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/projets');

  const cards = page.locator('[data-project-card]');
  const first = await cards.nth(0).boundingBox();
  const second = await cards.nth(1).boundingBox();
  expect(first).not.toBeNull();
  expect(second).not.toBeNull();
  expect(second!.y).toBeGreaterThan(first!.y + first!.height - 1);

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test('contribution activity scrolls inside its own frame on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/projets');

  const metrics = await page.locator('[data-contribution-scroll]').evaluate((node) => ({
    clientWidth: node.clientWidth,
    scrollWidth: node.scrollWidth,
    scrollLeft: node.scrollLeft,
    pageWidth: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(metrics.scrollWidth).toBeGreaterThan(metrics.clientWidth);
  expect(metrics.scrollLeft).toBeGreaterThan(0);
  expect(metrics.pageWidth).toBeLessThanOrEqual(metrics.viewport);
});
