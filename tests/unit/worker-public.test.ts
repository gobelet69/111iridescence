import { describe, expect, it, vi } from 'vitest';
import worker, { handleReleaseRequest } from '../../src/worker.js';

const origin = 'https://111iridescence.org';

function executionContext() {
  return {
    waitUntil(promise: Promise<unknown>) {
      void promise.catch(() => undefined);
    },
    passThroughOnException() {},
  };
}

describe('public asset delegation', () => {
  it.each([
    ['/blog', '/apps'],
    ['/blog/ancienne-note?source=archive', '/apps?source=archive'],
    ['/tags/rust', '/apps'],
    ['/projets/mass-print?from=old', '/apps?from=old'],
    ['/rss.xml?reader=legacy', '/apps?reader=legacy'],
  ])('redirects retired editorial routes permanently: %s', async (path, location) => {
    const response = await worker.fetch(new Request(`${origin}${path}`), {
      ASSETS: { fetch: async () => new Response('must not reach assets') },
    }, executionContext());

    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe(`${origin}${location}`);
  });

  it.each(['/blogue', '/tags-old', '/projets-archive', '/rss.xml.bak'])('delegates near-prefix editorial paths: %s', async (path) => {
    const response = await worker.fetch(new Request(`${origin}${path}`), {
      ASSETS: { fetch: async () => new Response('Astro route') },
    }, executionContext());

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('Astro route');
  });

  it.each([
    ['/portail', 'https://portail.111iridescence.org/'],
    ['/portail/vault/file?id=7', 'https://portail.111iridescence.org/vault/file?id=7'],
    ['/portail//evil.example', 'https://portail.111iridescence.org//evil.example'],
  ])('redirects the exact legacy portal family permanently: %s', async (path, location) => {
    const response = await worker.fetch(new Request(`${origin}${path}`), {
      ASSETS: { fetch: async () => new Response('must not reach assets') },
    }, executionContext());

    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe(location);
    expect(response.headers.get('set-cookie')).toContain('sess=');
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0');
  });

  it('does not redirect a near-prefix portal path', async () => {
    const response = await worker.fetch(new Request(`${origin}/portail-old`), {
      ASSETS: { fetch: async () => new Response('Astro route', { status: 200 }) },
    }, executionContext());

    expect(response.status).toBe(200);
  });

  it('serves the Astro homepage through ASSETS without mutating its response', async () => {
    const homepage = '<!doctype html><html><body><h1>Astro</h1></body></html>';
    const request = new Request(`${origin}/`);
    const response = await worker.fetch(request, {
      ASSETS: {
        fetch: async (assetRequest: Request) => new Response(
          assetRequest === request ? homepage : 'Wrong request',
          {
            status: assetRequest === request ? 200 : 400,
            headers: {
              'content-type': 'text/html; charset=utf-8',
              'x-asset-source': 'astro',
            },
          },
        ),
      },
    }, executionContext());

    expect(response.status).toBe(200);
    expect(response.headers.get('x-asset-source')).toBe('astro');
    expect(await response.text()).toBe(homepage);
  });

  it('preserves an asset 404 instead of rendering the old hub', async () => {
    const response = await worker.fetch(new Request(`${origin}/missing`), {
      ASSETS: {
        fetch: async () => new Response('Not found', {
          status: 404,
          headers: { 'content-type': 'text/html; charset=utf-8' },
        }),
      },
    }, executionContext());

    expect(response.status).toBe(404);
    expect(await response.text()).toBe('Not found');
  });

  it.each([
    ['missing', {}],
    ['malformed', { ASSETS: {} }],
  ])('does not fall back to the old hub when the ASSETS binding is %s', async (_label, env) => {
    await expect(worker.fetch(
      new Request(`${origin}/`),
      env,
      executionContext(),
    )).rejects.toBeInstanceOf(TypeError);
  });

  it('keeps near-prefix public paths out of legacy app handlers', async () => {
    const response = await worker.fetch(new Request(`${origin}/todo-not-an-app`), {
      ASSETS: {
        fetch: async () => new Response('Astro public route', {
          status: 200,
          headers: { 'content-type': 'text/plain; charset=utf-8' },
        }),
      },
    }, executionContext());

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('Astro public route');
  });
});

describe('public GitHub release endpoint', () => {
  const massPrintRelease = {
    tag_name: 'v0.1.3',
    name: 'Mass Print v0.1.3',
    html_url: 'https://github.com/gobelet69/Mass-Print/releases/tag/v0.1.3',
    published_at: '2026-10-24T12:56:16Z',
    body: 'Universal macOS build.',
    draft: false,
    prerelease: false,
    assets: [{
      name: 'Mass.Print_0.1.3_universal.dmg',
      browser_download_url: 'https://github.com/gobelet69/Mass-Print/releases/download/v0.1.3/Mass.Print_0.1.3_universal.dmg',
      state: 'uploaded',
      size: 7_633_472,
      content_type: 'application/octet-stream',
    }],
  };

  it('fetches only the allow-listed Mass Print repository and returns normalized JSON', async () => {
    const githubFetch = vi.fn(async () => Response.json(massPrintRelease));

    const response = await handleReleaseRequest(
      new Request(`${origin}/api/releases/mass-print`),
      githubFetch,
    );

    expect(githubFetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/gobelet69/Mass-Print/releases/latest',
      expect.objectContaining({ headers: expect.any(Headers) }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('public, max-age=300, s-maxage=300');
    expect(await response.json()).toMatchObject({
      available: true,
      version: '0.1.3',
      format: 'DMG universel',
      compatibility: 'macOS 12.3 ou version ultérieure',
    });
  });

  it('returns an unavailable launch-ready payload when PDF Reader is still private', async () => {
    const githubFetch = vi.fn(async () => Response.json({ message: 'Not Found' }, { status: 404 }));
    const response = await handleReleaseRequest(
      new Request(`${origin}/api/releases/iridescence-pdf-reader`),
      githubFetch,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      available: false,
      compatibility: 'macOS 14 ou version ultérieure',
      architecture: 'Apple Silicon',
    });
  });

  it('uses the same headers for HEAD without sending a body', async () => {
    const response = await handleReleaseRequest(
      new Request(`${origin}/api/releases/mass-print`, { method: 'HEAD' }),
      async () => Response.json(massPrintRelease),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(await response.text()).toBe('');
  });

  it('rejects unknown slugs without contacting GitHub', async () => {
    const githubFetch = vi.fn();
    const response = await handleReleaseRequest(
      new Request(`${origin}/api/releases/other-owner`),
      githubFetch,
    );

    expect(response.status).toBe(404);
    expect(githubFetch).not.toHaveBeenCalled();
  });
});
