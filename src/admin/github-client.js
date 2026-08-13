const WRITABLE_PATHS = [
  /^src\/data\/pages\/about\.json$/,
  /^src\/data\/project-settings\.json$/,
  /^src\/data\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*\/(?:index\.md|images\/[a-z0-9]+(?:-[a-z0-9]+)*\.webp)$/,
];

export class GitHubAdminError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.name = 'GitHubAdminError';
    this.status = status;
  }
}

function validateClientOptions(token, repository) {
  if (typeof token !== 'string' || token.length === 0) throw new GitHubAdminError('GitHub content token is missing', 503);
  if (!/^gobelet69\/[A-Za-z0-9._-]+$/.test(repository)) {
    throw new GitHubAdminError('GitHub repository is invalid', 500);
  }
}

function validateSha(value, label) {
  if (typeof value !== 'string' || !/^[a-f0-9]{40}$/i.test(value)) {
    throw new GitHubAdminError(`${label} is invalid`, 422);
  }
  return value;
}

function validateChange(change) {
  if (!change || typeof change !== 'object' || !WRITABLE_PATHS.some((pattern) => pattern.test(change.path))) {
    throw new GitHubAdminError(`Content path is not writable: ${change?.path ?? 'unknown'}`, 422);
  }
  if (change.delete === true) return;
  const hasText = typeof change.content === 'string';
  const hasBase64 = typeof change.contentBase64 === 'string' && /^[A-Za-z0-9+/]*={0,2}$/.test(change.contentBase64);
  if (hasText === hasBase64) throw new GitHubAdminError(`Content change is invalid: ${change.path}`, 422);
}

function textToBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

function normalizePublication(run) {
  if (!run) return { status: 'missing', htmlUrl: null };
  let status = run.status;
  if (run.status === 'completed') {
    status = ['success', 'failure', 'cancelled'].includes(run.conclusion)
      ? run.conclusion
      : 'failure';
  } else if (!['queued', 'in_progress'].includes(run.status)) {
    status = 'missing';
  }
  const htmlUrl = typeof run.html_url === 'string'
    && /^https:\/\/github\.com\/gobelet69\/111iridescence\/actions\/runs\/\d+$/.test(run.html_url)
    ? run.html_url
    : null;
  return { status, htmlUrl };
}

export function createGitHubClient({
  token,
  repository = 'gobelet69/111iridescence',
  fetchImpl = fetch,
} = {}) {
  validateClientOptions(token, repository);
  const apiRoot = `https://api.github.com/repos/${repository}`;

  async function request(path, { method = 'GET', body } = {}) {
    const response = await fetchImpl(`${apiRoot}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': '111iridescence-admin',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok) {
      throw new GitHubAdminError(`GitHub request failed with HTTP ${response.status}`, response.status);
    }
    if (response.status === 204) return null;
    try {
      return await response.json();
    } catch {
      throw new GitHubAdminError('GitHub response was not valid JSON');
    }
  }

  async function headSha() {
    const reference = await request('/git/ref/heads/main');
    return validateSha(reference?.object?.sha, 'GitHub main SHA');
  }

  return {
    async readSnapshot() {
      const currentHead = await headSha();
      const commit = await request(`/git/commits/${currentHead}`);
      const treeSha = validateSha(commit?.tree?.sha, 'GitHub tree SHA');
      const tree = await request(`/git/trees/${treeSha}?recursive=1`);
      if (!Array.isArray(tree?.tree)) throw new GitHubAdminError('GitHub tree response is invalid');
      return { headSha: currentHead, treeSha, entries: tree.tree };
    },

    async readBlob(sha) {
      const blob = await request(`/git/blobs/${validateSha(sha, 'GitHub blob SHA')}`);
      if (blob?.encoding !== 'base64' || typeof blob.content !== 'string') {
        throw new GitHubAdminError('GitHub blob response is invalid');
      }
      return blob.content.replace(/\s/g, '');
    },

    async commitFiles({ baseSha, message, changes }) {
      validateSha(baseSha, 'Base SHA');
      if (typeof message !== 'string' || message.trim().length === 0 || message.length > 200) {
        throw new GitHubAdminError('Commit message is invalid', 422);
      }
      if (!Array.isArray(changes) || changes.length === 0 || changes.length > 64) {
        throw new GitHubAdminError('Content changes must contain between 1 and 64 entries', 422);
      }
      changes.forEach(validateChange);
      const paths = changes.map((change) => change.path);
      if (new Set(paths).size !== paths.length) throw new GitHubAdminError('Content changes contain duplicate paths', 422);

      const currentHead = await headSha();
      if (currentHead !== baseSha) throw new GitHubAdminError('GitHub main changed since content was loaded', 409);
      const baseCommit = await request(`/git/commits/${currentHead}`);
      const baseTree = validateSha(baseCommit?.tree?.sha, 'GitHub tree SHA');
      const tree = [];
      for (const change of changes) {
        if (change.delete === true) {
          tree.push({ path: change.path, mode: '100644', type: 'blob', sha: null });
          continue;
        }
        const content = change.contentBase64 ?? textToBase64(change.content);
        const blob = await request('/git/blobs', {
          method: 'POST',
          body: { content, encoding: 'base64' },
        });
        tree.push({
          path: change.path,
          mode: '100644',
          type: 'blob',
          sha: validateSha(blob?.sha, 'GitHub blob SHA'),
        });
      }
      const nextTree = await request('/git/trees', {
        method: 'POST',
        body: { base_tree: baseTree, tree },
      });
      const commit = await request('/git/commits', {
        method: 'POST',
        body: {
          message: message.trim(),
          tree: validateSha(nextTree?.sha, 'GitHub tree SHA'),
          parents: [currentHead],
        },
      });
      const sha = validateSha(commit?.sha, 'GitHub commit SHA');
      try {
        await request('/git/refs/heads/main', {
          method: 'PATCH',
          body: { sha, force: false },
        });
      } catch (error) {
        if (error instanceof GitHubAdminError && error.status === 422) {
          throw new GitHubAdminError('GitHub main changed while saving content', 409);
        }
        throw error;
      }
      return { sha };
    },

    async dispatchPublish() {
      await request('/actions/workflows/publish.yml/dispatches', {
        method: 'POST',
        body: { ref: 'main' },
      });
      return { dispatched: true };
    },

    async getPublication(sha) {
      validateSha(sha, 'Publication SHA');
      const result = await request(`/actions/workflows/publish.yml/runs?head_sha=${sha}&per_page=1`);
      return normalizePublication(Array.isArray(result?.workflow_runs) ? result.workflow_runs[0] : null);
    },
  };
}
