import { expect, test } from '@playwright/test';

test('site worker keeps admin standalone and legacy roots removed', async ({ request }) => {
  const admin = await request.get('/admin', { maxRedirects: 0 });
  expect(admin.status()).toBe(302);
  expect(admin.headers().location).toBe('https://portail.111iridescence.org/auth/login?redirect=https%3A%2F%2F111iridescence.org%2Fadmin');

  const client = await request.get('/admin/client.js');
  expect(client.status()).toBe(200);
  expect(await client.text()).toContain('/admin/api');

  for (const path of ['/todo', '/vault', '/auth', '/editor', '/pdf', '/converter', '/_portal/vault/static/app.js']) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(404);
    expect(response.headers().location, path).toBeUndefined();
  }

  const moved = await request.get('/portail/vault?folder=work', { maxRedirects: 0 });
  expect(moved.status()).toBe(308);
  expect(moved.headers().location).toBe('https://portail.111iridescence.org/vault?folder=work');
});

test('site worker exposes the current public Mass Print DMG release', async ({ request }) => {
  const response = await request.get('/api/releases/mass-print');
  const release = await response.json();

  expect(response.status()).toBe(200);
  expect(response.headers()['cache-control']).toBe('public, max-age=300, s-maxage=300');
  expect(release).toMatchObject({
    available: true,
    format: 'DMG universel',
    architecture: 'Apple Silicon et Intel',
    compatibility: 'macOS 12.3 ou version ultérieure',
  });
  expect(release.version).toMatch(/^\d+\.\d+\.\d+/);
  expect(release.downloadUrl).toMatch(/^https:\/\/github\.com\/gobelet69\/Mass-Print\/releases\/download\//);
});

test('site worker keeps PDF Reader launch-ready while no public release exists', async ({ request }) => {
  const response = await request.get('/api/releases/iridescence-pdf-reader');

  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({
    available: false,
    compatibility: 'macOS 14 ou version ultérieure',
    architecture: 'Apple Silicon',
  });
});
