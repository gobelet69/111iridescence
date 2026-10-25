import { expect, test } from '@playwright/test';

test('about page presents an anonymous first-person profile', async ({ page }) => {
  const response = await page.goto('/a-propos');

  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Curieux de nature.');
  await expect(page.getByRole('heading', { name: 'Développement macOS.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Cybersécurité.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Systèmes et homelab.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'L’IA fait partie du processus.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mes applications.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'La suite.' })).toBeVisible();
  await expect(page.getByRole('main')).toContainText('Master en cybersécurité');
  await expect(page.getByRole('main')).not.toContainText(/ski|escalade/i);
  await expect(page.getByRole('main').getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', 'https://github.com/gobelet69');
  await expect(page.locator('body')).not.toContainText(/Théo|Theo|Deville/i);
});

test('public navigation exposes the about page', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', { name: 'À propos' }))
    .toHaveAttribute('href', '/a-propos');
});

test('about page follows an editorial journey with a transparent creation process', async ({ page }) => {
  await page.goto('/a-propos');

  for (const id of ['explorations', 'ai-process', 'identity', 'closing']) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }

  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  const headingLevels = await page.locator('main :is(h1, h2, h3)').evaluateAll((headings) => (
    headings.map((heading) => Number(heading.tagName.slice(1)))
  ));
  for (let index = 1; index < headingLevels.length; index += 1) {
    expect(headingLevels[index] - headingLevels[index - 1]).toBeLessThanOrEqual(1);
  }

  const process = page.getByRole('list', { name: 'Processus de création' });
  await expect(process.getByRole('listitem')).toHaveCount(5);
  for (const step of ['Idée', 'Expérimentation', 'Prototype', 'Tests', 'Améliorations']) {
    await expect(process.getByText(step, { exact: true })).toBeVisible();
  }

  await expect(page.getByRole('link', { name: 'Découvrir Iridescence PDF Reader' }))
    .toHaveAttribute('href', '/apps/iridescence-pdf-reader');
  await expect(page.getByRole('link', { name: 'Découvrir Mass Print' }))
    .toHaveAttribute('href', '/apps/mass-print');
  await expect(page.getByRole('link', { name: 'Découvrir mes applications' }))
    .toHaveAttribute('href', '/apps');
  await expect(page.locator('[data-about-signal]')).toHaveAttribute('aria-hidden', 'true');
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 320, height: 700 },
]) {
  test(`about page remains readable without horizontal overflow at ${viewport.width} px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/a-propos');
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    await expect(page.locator('#closing')).toBeVisible();
  });
}

test('about page keeps all content visible with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/a-propos');
  await expect(page.locator('#ai-process')).toContainText('L’IA fait partie du processus.');
  await expect(page.locator('#closing')).toContainText('La suite.');
});

test('creation process labels never overlap at tablet width', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/a-propos');

  const labels = await page.locator('.process-label').evaluateAll((elements) => elements.map((element) => {
    const { left, right, top, bottom } = element.getBoundingClientRect();
    return { left, right, top, bottom };
  }));

  for (let first = 0; first < labels.length; first += 1) {
    for (let second = first + 1; second < labels.length; second += 1) {
      const a = labels[first];
      const b = labels[second];
      const overlapWidth = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const overlapHeight = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      expect(overlapWidth > 0 && overlapHeight > 0).toBe(false);
    }
  }
});
