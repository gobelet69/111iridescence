import { getAuthIdentity, isPrivilegedRole } from '../auth/session.js';
import {
  buildCsrfCookie,
  issueCsrfToken,
  noStoreResponse,
  verifyAdminMutation,
  readCsrfToken,
} from '../admin/security.js';
import { createGitHubClient, GitHubAdminError } from '../admin/github-client.js';
import {
  buildPostChanges,
  deletionChanges,
  readAdminContent,
} from '../admin/content.js';
import { validateAboutPage } from '../lib/about.ts';
import { validateProjectSettings } from '../lib/project-catalog.ts';
import { renderAdminShell } from '../admin/render.js';

function redirect(location) {
  return noStoreResponse(null, { status: 302, headers: { Location: location } });
}

function json(value, status = 200) {
  return noStoreResponse(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function clientFor(env) {
  return env.GITHUB_CLIENT ?? createGitHubClient({
    token: env.GITHUB_CONTENT_TOKEN,
    repository: env.GITHUB_REPOSITORY || 'gobelet69/111iridescence',
    fetchImpl: env.GITHUB_FETCH || fetch,
  });
}

async function loadContent(client) {
  return typeof client.readAdminContent === 'function'
    ? client.readAdminContent()
    : readAdminContent(client);
}

function routeSlug(pathname) {
  const match = pathname.match(/^\/admin\/api\/posts\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);
  return match?.[1] ?? null;
}

function errorResponse(error) {
  if (error instanceof GitHubAdminError) return json({ error: error.message }, error.status);
  const message = error instanceof Error ? error.message : 'Admin request failed';
  return json({ error: message }, /invalid|must|required|maximum|duplicate|unknown|exist|HTML|anonymous/i.test(message) ? 422 : 502);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const identity = await getAuthIdentity(request, env);
    if (!identity) {
      if (url.pathname.startsWith('/admin/api/')) return json({ error: 'Authentication required' }, 401);
      const login = new URL('https://portail.111iridescence.org/auth/login');
      login.search = new URLSearchParams({ redirect: 'https://111iridescence.org/admin' }).toString();
      return redirect(login.href);
    }
    if (!isPrivilegedRole(identity.role)) {
      return noStoreResponse('Accès interdit', {
        status: 403,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    if (request.method === 'GET' && (url.pathname === '/admin' || url.pathname === '/admin/')) {
      const csrfToken = issueCsrfToken();
      return noStoreResponse(renderAdminShell(), {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Set-Cookie': buildCsrfCookie(csrfToken),
        },
      });
    }

    if (request.method === 'GET' && url.pathname === '/admin/api/bootstrap') {
      const csrfToken = readCsrfToken(request);
      if (!csrfToken) return json({ error: 'CSRF cookie is missing' }, 403);
      try {
        const client = clientFor(env);
        return json({ ...(await loadContent(client)), csrfToken });
      } catch (error) {
        return errorResponse(error);
      }
    }

    if (request.method === 'GET' && url.pathname.startsWith('/admin/api/publications/')) {
      const sha = url.pathname.slice('/admin/api/publications/'.length);
      try {
        const client = clientFor(env);
        return json(await client.getPublication(sha));
      } catch (error) {
        return errorResponse(error);
      }
    }

    let mutationBody;
    if (request.method !== 'GET' && url.pathname.startsWith('/admin/api/')) {
      try {
        mutationBody = await request.json();
      } catch {
        return json({ error: 'Expected JSON body' }, 400);
      }
      if (!verifyAdminMutation(request, mutationBody)) return json({ error: 'Mutation protection failed' }, 403);
    }

    try {
      const client = clientFor(env);
      if (request.method === 'PUT' && url.pathname === '/admin/api/about') {
        const about = validateAboutPage(mutationBody.about);
        const result = await client.commitFiles({
          baseSha: mutationBody.baseSha,
          message: 'content: update about page',
          changes: [{ path: 'src/data/pages/about.json', content: `${JSON.stringify(about, null, 2)}\n` }],
        });
        return json({ sha: result.sha, status: 'queued' }, 201);
      }

      if (request.method === 'PUT' && url.pathname === '/admin/api/projects') {
        const current = await loadContent(client);
        const settings = validateProjectSettings(mutationBody.projectSettings, current.repositories);
        const result = await client.commitFiles({
          baseSha: mutationBody.baseSha,
          message: 'content: update project settings',
          changes: [{ path: 'src/data/project-settings.json', content: `${JSON.stringify(settings, null, 2)}\n` }],
        });
        return json({ sha: result.sha, status: 'queued' }, 201);
      }

      if (request.method === 'POST' && url.pathname === '/admin/api/posts') {
        const changes = buildPostChanges({ post: mutationBody.post, images: mutationBody.images || [] });
        const result = await client.commitFiles({
          baseSha: mutationBody.baseSha,
          message: `content: create post ${mutationBody.post.slug}`,
          changes,
        });
        return json({ sha: result.sha, status: 'queued' }, 201);
      }

      const slug = routeSlug(url.pathname);
      if (slug && request.method === 'PUT') {
        const current = await loadContent(client);
        const existing = current.posts.find((post) => post.slug === slug);
        if (!existing) return json({ error: `Post does not exist: ${slug}` }, 404);
        const changes = buildPostChanges({
          post: mutationBody.post,
          previousSlug: slug,
          existingImages: existing.images || [],
          images: mutationBody.images || [],
          deletedImages: mutationBody.deletedImages || [],
        });
        const result = await client.commitFiles({
          baseSha: mutationBody.baseSha,
          message: `content: update post ${mutationBody.post.slug}`,
          changes,
        });
        return json({ sha: result.sha, status: 'queued' }, 201);
      }

      if (slug && request.method === 'DELETE') {
        const changes = await deletionChanges(client, slug);
        const result = await client.commitFiles({
          baseSha: mutationBody.baseSha,
          message: `content: delete post ${slug}`,
          changes,
        });
        return json({ sha: result.sha, status: 'queued' }, 201);
      }

      if (request.method === 'POST' && url.pathname === '/admin/api/github/sync') {
        await client.dispatchPublish();
        return json({ status: 'queued' }, 202);
      }
    } catch (error) {
      return errorResponse(error);
    }

    return json({ error: 'Admin route not found' }, 404);
  },
};
