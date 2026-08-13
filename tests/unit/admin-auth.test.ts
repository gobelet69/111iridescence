import { describe, expect, it } from 'vitest';
import worker from '../../src/worker.js';

const origin = 'https://111iridescence.org';

function assets404() {
  return {
    async fetch() {
      return new Response('Not found', { status: 404 });
    },
  };
}

function executionContext() {
  return {
    waitUntil(promise: Promise<unknown>) {
      void promise.catch(() => undefined);
    },
    passThroughOnException() {},
  };
}

function authDb(role: string) {
  return {
    prepare(sql: string) {
      return {
        bind() {
          return this;
        },
        async first() {
          if (sql.includes('FROM sessions')) {
            return { id: 'session-1', username: 'test-user', role };
          }
          if (sql.includes('FROM users')) return { username: 'test-user', role };
          return null;
        },
        async run() {
          return { success: true };
        },
      };
    },
  };
}

async function fetchAdmin(path: string, options: { role?: string; method?: string; headers?: HeadersInit; body?: string } = {}) {
  const headers = new Headers(options.headers);
  if (options.role && !headers.has('cookie')) headers.set('cookie', 'sess=session-1');
  return worker.fetch(new Request(`${origin}${path}`, {
    method: options.method,
    headers,
    body: options.body,
  }), {
    ASSETS: assets404(),
    AUTH_DB: authDb(options.role ?? 'viewer'),
    GITHUB_CLIENT: {},
  }, executionContext());
}

describe('private content administration access', () => {
  it('redirects anonymous visitors to the portal login', async () => {
    const response = await fetchAdmin('/admin');

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe(
      '/portail/auth/login?redirect=%2Fadmin',
    );
  });

  it.each(['viewer', 'member', 'editor'])('returns 403 for role %s', async (role) => {
    const response = await fetchAdmin('/admin', { role });

    expect(response.status).toBe(403);
    expect(await response.text()).not.toContain('GITHUB_CONTENT_TOKEN');
  });

  it.each(['admin', 'owner'])('allows role %s with no-store and a scoped CSRF cookie', async (role) => {
    const response = await fetchAdmin('/admin', { role });
    const cookie = response.headers.get('set-cookie');

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(cookie).toContain('iri_admin_csrf=');
    expect(cookie).toContain('Path=/admin');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('SameSite=Strict');
    expect(await response.text()).toContain('Administration');
  });

  it('rejects a mutation without exact origin, CSRF pair, and base SHA', async () => {
    const response = await fetchAdmin('/admin/api/unknown', {
      role: 'admin',
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(403);
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('accepts a complete CSRF pair and base SHA before route dispatch', async () => {
    const shell = await fetchAdmin('/admin', { role: 'admin' });
    const csrfCookie = shell.headers.get('set-cookie')?.split(';', 1)[0];
    const csrfToken = csrfCookie?.split('=', 2)[1];
    expect(csrfToken).toMatch(/^[a-f0-9]{64}$/);

    const response = await fetchAdmin('/admin/api/unknown', {
      role: 'admin',
      method: 'PUT',
      headers: {
        origin,
        'content-type': 'application/json',
        cookie: `sess=session-1; ${csrfCookie}`,
        'x-iridescence-csrf': csrfToken!,
      },
      body: JSON.stringify({ baseSha: 'a'.repeat(40) }),
    });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'Admin route not found' });
  });
});
