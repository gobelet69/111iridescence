import { expect, test, type Page } from '@playwright/test';
import { renderAdminShell } from '../../src/admin/render.js';

const bootstrap = {
  headSha: 'a'.repeat(40),
  csrfToken: 'c'.repeat(64),
  about: {
    eyebrow: 'Derrière le site', title: 'À propos', description: 'Une description publique suffisamment longue.',
    intro: 'Une introduction publique.', sections: [{ id: 'site', title: 'Pourquoi ce site', body: 'Un texte public.' }],
    contact: { label: 'Code public', text: 'GitHub', href: 'https://github.com/gobelet69' },
  },
  posts: [{
    format: 'note', title: 'Ouverture', description: 'Une description publique suffisamment longue.', slug: 'ouverture',
    theme: 'projets', tags: ['astro', 'architecture-web'], publishedAt: '2026-08-11T18:00:00+02:00',
    draft: false, body: '# Ouverture', images: [],
  }],
  projectSettings: { repositories: {}, pinned: ['gobelet69/vault'] },
  repositories: [
    { repo: 'gobelet69/vault', name: 'vault', description: 'Fichiers personnels', fork: false, archived: false },
    { repo: 'gobelet69/fork', name: 'fork', description: 'Un fork', fork: true, archived: false },
    { repo: 'gobelet69/source', name: 'source', description: 'Un projet source', fork: false, archived: false },
  ],
};

async function openAdmin(page: Page) {
  const mutations: Array<{ url: string; method: string; body: any }> = [];
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.route('**/admin/api/**', async (route: any) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname.endsWith('/bootstrap')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(bootstrap) });
    }
    if (url.pathname.includes('/publications/')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', htmlUrl: null }) });
    }
    mutations.push({ url: url.pathname, method: request.method(), body: request.postDataJSON() });
    return route.fulfill({ status: url.pathname.endsWith('/github/sync') ? 202 : 201, contentType: 'application/json', body: JSON.stringify(url.pathname.endsWith('/github/sync') ? { status: 'queued' } : { sha: 'b'.repeat(40), status: 'queued' }) });
  });
  await page.goto('/404');
  await page.setContent(renderAdminShell());
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');
  expect(pageErrors).toEqual([]);
  return mutations;
}

test('admin edits about content and sends a protected versioned mutation', async ({ page }) => {
  const mutations = await openAdmin(page);
  await page.getByLabel('Introduction').fill('Une introduction mise à jour.');
  await page.getByRole('button', { name: 'Enregistrer À propos' }).click();

  await expect.poll(() => mutations.length).toBe(1);
  expect(mutations[0]).toMatchObject({ url: '/admin/api/about', method: 'PUT' });
  expect(mutations[0].body.baseSha).toBe('a'.repeat(40));
  expect(mutations[0].body.about.intro).toBe('Une introduction mise à jour.');
});

test('admin exposes Markdown editing and project visibility defaults', async ({ page }) => {
  await openAdmin(page);
  await page.getByRole('tab', { name: 'Blog' }).click();
  await page.getByRole('button', { name: /Ouverture/ }).click();
  await expect(page.locator('[data-markdown-editor]')).toHaveValue('# Ouverture');
  await expect(page.getByText('Ouverture', { exact: true }).last()).toBeVisible();

  await page.getByRole('tab', { name: 'Projets' }).click();
  const fork = page.locator('.project-row').filter({ hasText: 'Un fork' });
  const source = page.locator('.project-row').filter({ hasText: 'Un projet source' });
  await expect(fork.getByLabel('Visible')).not.toBeChecked();
  await expect(source.getByLabel('Visible')).toBeChecked();
  await expect(page.locator('#pin-count')).toHaveText('1/6');
});

test('admin stays usable at 320 pixels without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await openAdmin(page);
  await page.getByRole('tab', { name: 'Projets' }).click();
  const width = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(width.scroll).toBeLessThanOrEqual(width.client);
});

test('admin creates, updates, and deletes Markdown articles', async ({ page }) => {
  const mutations = await openAdmin(page);
  await page.getByRole('tab', { name: 'Blog' }).click();

  await page.getByRole('button', { name: 'Nouvel article' }).click();
  await page.getByLabel('Titre').last().fill('Nouvel article');
  await page.getByLabel('Description').last().fill('Une description suffisamment longue pour ce nouvel article.');
  await page.getByLabel('Slug').fill('nouvel-article');
  await page.getByLabel('Markdown').fill('# Nouveau\n\nContenu.');
  await page.getByRole('button', { name: 'Enregistrer l’article' }).click();

  await expect.poll(() => mutations.length).toBe(1);
  expect(mutations[0]).toMatchObject({ url: '/admin/api/posts', method: 'POST' });
  expect(mutations[0].body.post).toMatchObject({ slug: 'nouvel-article', body: '# Nouveau\n\nContenu.' });

  await page.getByRole('button', { name: /Ouverture/ }).click();
  await page.getByLabel('Titre').last().fill('Ouverture mise à jour');
  await page.getByRole('button', { name: 'Enregistrer l’article' }).click();
  await expect.poll(() => mutations.length).toBe(2);
  expect(mutations[1]).toMatchObject({ url: '/admin/api/posts/ouverture', method: 'PUT' });

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Supprimer' }).click();
  await expect.poll(() => mutations.length).toBe(3);
  expect(mutations[2]).toMatchObject({ url: '/admin/api/posts/ouverture', method: 'DELETE' });
});

test('admin saves project visibility and launches GitHub synchronization', async ({ page }) => {
  const mutations = await openAdmin(page);
  await page.getByRole('tab', { name: 'Projets' }).click();

  const fork = page.locator('.project-row').filter({ hasText: 'Un fork' });
  await fork.getByLabel('Visible').check();
  const source = page.locator('.project-row').filter({ hasText: 'Un projet source' });
  await source.getByLabel('Épinglé').check();
  await page.getByRole('button', { name: 'Enregistrer les projets' }).click();

  await expect.poll(() => mutations.length).toBe(1);
  expect(mutations[0]).toMatchObject({ url: '/admin/api/projects', method: 'PUT' });
  expect(mutations[0].body.projectSettings.repositories['gobelet69/fork']).toEqual({ visible: true });
  expect(mutations[0].body.projectSettings.pinned).toEqual(['gobelet69/vault', 'gobelet69/source']);

  await page.getByRole('button', { name: 'Actualiser GitHub maintenant' }).click();
  await expect.poll(() => mutations.length).toBe(2);
  expect(mutations[1]).toMatchObject({ url: '/admin/api/github/sync', method: 'POST' });
});
