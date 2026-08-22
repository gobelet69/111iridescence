import { describe, expect, it } from 'vitest';
import worker from '../../src/worker.js';

const origin = 'https://111iridescence.org';
const headSha = 'a'.repeat(40);

function authDb() {
  return {
    prepare(sql: string) {
      return {
        bind() { return this; },
        async first() {
          if (sql.includes('FROM sessions')) return { id: 'session-1', username: 'admin-user', role: 'admin' };
          if (sql.includes('FROM users')) return { username: 'admin-user', role: 'admin' };
          return null;
        },
        async run() { return { success: true }; },
      };
    },
  };
}

function fakeClient() {
  const commits: any[] = [];
  return {
    commits,
    async readSnapshot() {
      return { headSha, entries: [] };
    },
    async readAdminContent() {
      return {
        headSha,
        about: { title: 'À propos', sections: [] },
        posts: [],
        projectSettings: { repositories: {}, pinned: ['gobelet69/vault'] },
        repositories: [{ repo: 'gobelet69/vault', fork: false }],
      };
    },
    async commitFiles(input: unknown) {
      commits.push(input);
      return { sha: 'b'.repeat(40) };
    },
    async dispatchPublish() { return { dispatched: true }; },
    async getPublication() { return { status: 'success', htmlUrl: 'https://github.com/gobelet69/111iridescence/actions/runs/1' }; },
  };
}

async function adminRequest(path: string, client: ReturnType<typeof fakeClient>, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set('cookie', headers.get('cookie') ?? '__Secure-iri_session=session-1');
  return worker.fetch(new Request(`${origin}${path}`, { ...options, headers }), {
    ASSETS: { async fetch() { return new Response('missing', { status: 404 }); } },
    AUTH_DB: authDb(),
    GITHUB_CLIENT: client,
  }, { waitUntil() {}, passThroughOnException() {} });
}

async function mutation(path: string, client: ReturnType<typeof fakeClient>, body: Record<string, unknown>) {
  const shell = await adminRequest('/admin', client);
  const csrfCookie = shell.headers.get('set-cookie')!.split(';', 1)[0];
  const csrf = csrfCookie.split('=', 2)[1];
  return adminRequest(path, client, {
    method: 'PUT',
    headers: {
      origin,
      cookie: `__Secure-iri_session=session-1; ${csrfCookie}`,
      'content-type': 'application/json',
      'x-iridescence-csrf': csrf,
    },
    body: JSON.stringify({ baseSha: headSha, ...body }),
  });
}

describe('admin content API', () => {
  it('returns a private bootstrap bound to the current SHA and CSRF token', async () => {
    const client = fakeClient();
    const shell = await adminRequest('/admin', client);
    const csrfCookie = shell.headers.get('set-cookie')!.split(';', 1)[0];
    const response = await adminRequest('/admin/api/bootstrap', client, {
      headers: { cookie: `__Secure-iri_session=session-1; ${csrfCookie}` },
    });
    const body = await response.json() as any;

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(body.headSha).toBe(headSha);
    expect(body.csrfToken).toMatch(/^[a-f0-9]{64}$/);
    expect(body.repositories).toHaveLength(1);
  });

  it('commits a validated about page and queues publication', async () => {
    const client = fakeClient();
    const about = {
      eyebrow: 'Derrière le site', title: 'À propos', description: 'Une description publique suffisamment longue.',
      intro: 'Une introduction publique.', sections: [{ id: 'site', title: 'Le site', body: 'Une section publique.' }],
      contact: { label: 'Code', text: 'GitHub', href: 'https://github.com/gobelet69' },
    };
    const response = await mutation('/admin/api/about', client, { about });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ sha: 'b'.repeat(40), status: 'queued' });
    expect(client.commits[0]).toMatchObject({
      baseSha: headSha,
      message: 'content: update about page',
      changes: [{ path: 'src/data/pages/about.json' }],
    });
  });

  it('updates project settings, triggers sync, and reads publication state', async () => {
    const client = fakeClient();
    const projectResponse = await mutation('/admin/api/projects', client, {
      projectSettings: { repositories: {}, pinned: ['gobelet69/vault'] },
      repositories: [{ repo: 'gobelet69/vault', fork: false, updatedAt: '2026-01-01T00:00:00Z' }],
    });
    expect(projectResponse.status).toBe(201);

    const shell = await adminRequest('/admin', client);
    const csrfCookie = shell.headers.get('set-cookie')!.split(';', 1)[0];
    const csrf = csrfCookie.split('=', 2)[1];
    const sync = await adminRequest('/admin/api/github/sync', client, {
      method: 'POST',
      headers: { origin, cookie: `__Secure-iri_session=session-1; ${csrfCookie}`, 'x-iridescence-csrf': csrf, 'content-type': 'application/json' },
      body: JSON.stringify({ baseSha: headSha }),
    });
    expect(sync.status).toBe(202);

    const publication = await adminRequest(`/admin/api/publications/${'b'.repeat(40)}`, client);
    expect(await publication.json()).toMatchObject({ status: 'success' });
  });
});
