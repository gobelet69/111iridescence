import { describe, expect, it, vi } from 'vitest';
import * as githubModule from '../../src/admin/github-client.js';

const HEAD_SHA = 'a'.repeat(40);
const BASE_TREE_SHA = 'b'.repeat(40);
const BLOB_SHA = 'c'.repeat(40);
const TREE_SHA = 'd'.repeat(40);
const COMMIT_SHA = 'e'.repeat(40);

function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function successfulGitApi() {
  const requests: Array<{ method: string; path: string; body: any }> = [];
  const fetchImpl = vi.fn(async (input: URL | RequestInfo, init: RequestInit = {}) => {
    const url = new URL(String(input));
    const method = init.method ?? 'GET';
    const body = init.body ? JSON.parse(String(init.body)) : undefined;
    requests.push({ method, path: url.pathname + url.search, body });
    if (url.pathname.endsWith('/git/ref/heads/main')) return json({ object: { sha: HEAD_SHA } });
    if (url.pathname.endsWith(`/git/commits/${HEAD_SHA}`)) return json({ tree: { sha: BASE_TREE_SHA } });
    if (url.pathname.endsWith('/git/blobs')) return json({ sha: BLOB_SHA }, 201);
    if (url.pathname.endsWith('/git/trees')) return json({ sha: TREE_SHA }, 201);
    if (url.pathname.endsWith('/git/commits')) return json({ sha: COMMIT_SHA }, 201);
    if (url.pathname.endsWith('/git/refs/heads/main')) return json({ object: { sha: COMMIT_SHA } });
    throw new Error(`Unexpected GitHub request: ${method} ${url.pathname}`);
  });
  return { fetchImpl, requests };
}

describe('admin GitHub client', () => {
  it('creates blobs, one tree, one commit, then advances main without force', async () => {
    const { fetchImpl, requests } = successfulGitApi();
    const client = (githubModule as any).createGitHubClient({
      token: 'secret',
      repository: 'gobelet69/111iridescence',
      fetchImpl,
    });

    const result = await client.commitFiles({
      baseSha: HEAD_SHA,
      message: 'content: update about page',
      changes: [
        { path: 'src/data/pages/about.json', content: '{"title":"À propos"}\n' },
        { path: 'src/data/blog/old/index.md', delete: true },
      ],
    });

    expect(result).toEqual({ sha: COMMIT_SHA });
    expect(requests.map((request) => `${request.method} ${request.path}`)).toEqual([
      'GET /repos/gobelet69/111iridescence/git/ref/heads/main',
      `GET /repos/gobelet69/111iridescence/git/commits/${HEAD_SHA}`,
      'POST /repos/gobelet69/111iridescence/git/blobs',
      'POST /repos/gobelet69/111iridescence/git/trees',
      'POST /repos/gobelet69/111iridescence/git/commits',
      'PATCH /repos/gobelet69/111iridescence/git/refs/heads/main',
    ]);
    expect(requests.at(-1)?.body).toEqual({ sha: COMMIT_SHA, force: false });
    expect(requests[3].body).toEqual({
      base_tree: BASE_TREE_SHA,
      tree: [
        { path: 'src/data/pages/about.json', mode: '100644', type: 'blob', sha: BLOB_SHA },
        { path: 'src/data/blog/old/index.md', mode: '100644', type: 'blob', sha: null },
      ],
    });
  });

  it('returns a conflict before creating blobs when main differs from base SHA', async () => {
    const fetchImpl = vi.fn(async () => json({ object: { sha: 'f'.repeat(40) } }));
    const client = (githubModule as any).createGitHubClient({
      token: 'secret', repository: 'gobelet69/111iridescence', fetchImpl,
    });

    await expect(client.commitFiles({
      baseSha: HEAD_SHA,
      message: 'content: edit',
      changes: [{ path: 'src/data/pages/about.json', content: '{}' }],
    })).rejects.toMatchObject({ status: 409 });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('rejects writes outside the explicit content allowlist', async () => {
    const client = (githubModule as any).createGitHubClient({
      token: 'secret', repository: 'gobelet69/111iridescence', fetchImpl: vi.fn(),
    });

    await expect(client.commitFiles({
      baseSha: HEAD_SHA,
      message: 'content: unsafe',
      changes: [{ path: '.github/workflows/publish.yml', content: 'unsafe' }],
    })).rejects.toThrow('not writable');
  });

  it('maps a non-fast-forward ref update to conflict', async () => {
    const fetchImpl = vi.fn(async (input: URL | RequestInfo, init: RequestInit = {}) => {
      const url = new URL(String(input));
      if ((init?.method ?? 'GET') === 'PATCH' && url.pathname.endsWith('/git/refs/heads/main')) {
        return json({ message: 'Reference update failed' }, 422);
      }
      if (url.pathname.endsWith('/git/ref/heads/main')) return json({ object: { sha: HEAD_SHA } });
      if (url.pathname.endsWith(`/git/commits/${HEAD_SHA}`)) return json({ tree: { sha: BASE_TREE_SHA } });
      if (url.pathname.endsWith('/git/blobs')) return json({ sha: BLOB_SHA }, 201);
      if (url.pathname.endsWith('/git/trees')) return json({ sha: TREE_SHA }, 201);
      if (url.pathname.endsWith('/git/commits')) return json({ sha: COMMIT_SHA }, 201);
      throw new Error(`Unexpected GitHub request: ${init.method ?? 'GET'} ${url.pathname}`);
    });
    const client = (githubModule as any).createGitHubClient({
      token: 'secret', repository: 'gobelet69/111iridescence', fetchImpl,
    });

    await expect(client.commitFiles({
      baseSha: HEAD_SHA,
      message: 'content: edit',
      changes: [{ path: 'src/data/pages/about.json', content: '{}' }],
    })).rejects.toMatchObject({ status: 409 });
  });

  it('dispatches the publish workflow and normalizes publication state', async () => {
    const fetchImpl = vi.fn(async (_input: URL | RequestInfo, init: RequestInit = {}) => {
      if (init.method === 'POST') return new Response(null, { status: 204 });
      return json({ workflow_runs: [{
        status: 'completed',
        conclusion: 'success',
        html_url: 'https://github.com/gobelet69/111iridescence/actions/runs/123',
      }] });
    });
    const client = (githubModule as any).createGitHubClient({
      token: 'secret', repository: 'gobelet69/111iridescence', fetchImpl,
    });

    await expect(client.dispatchPublish()).resolves.toEqual({ dispatched: true });
    await expect(client.getPublication(COMMIT_SHA)).resolves.toEqual({
      status: 'success',
      htmlUrl: 'https://github.com/gobelet69/111iridescence/actions/runs/123',
    });
  });

  it('never includes the token in an HTTP error', async () => {
    const client = (githubModule as any).createGitHubClient({
      token: 'secret-value',
      repository: 'gobelet69/111iridescence',
      fetchImpl: async () => json({ message: 'secret-value' }, 500),
    });

    await expect(client.readSnapshot()).rejects.toThrow('HTTP 500');
    await expect(client.readSnapshot()).rejects.not.toThrow('secret-value');
  });
});
