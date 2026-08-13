import { describe, expect, it } from 'vitest';
import worker from '../../src/worker.js';

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
