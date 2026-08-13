import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const defaultRepositoriesPath = resolve(repositoryRoot, 'src/generated/github-projects.json');
const defaultContributionsPath = resolve(repositoryRoot, 'src/generated/github-contributions.json');
const CONTRIBUTION_LEVELS = new Map([
  ['NONE', 0],
  ['FIRST_QUARTILE', 1],
  ['SECOND_QUARTILE', 2],
  ['THIRD_QUARTILE', 3],
  ['FOURTH_QUARTILE', 4],
]);

function requireToken(token) {
  if (typeof token !== 'string' || token.length === 0) throw new Error('GITHUB_TOKEN is required');
  return token;
}

function requireString(value, field, repository) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Invalid GitHub field ${field} for ${repository}`);
  }
  return value;
}

function githubHeaders(token) {
  return {
    Authorization: `Bearer ${requireToken(token)}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': '111iridescence-build',
  };
}

async function readJsonResponse(response, label) {
  if (!response.ok) throw new Error(`${label} failed with HTTP ${response.status}`);
  try {
    return await response.json();
  } catch {
    throw new Error(`${label} response was not valid JSON`);
  }
}

function normalizeRepository(item, owner) {
  if (!item || typeof item !== 'object') throw new Error('Invalid GitHub repository payload');
  const repository = requireString(item.full_name, 'full_name', 'unknown repository');
  const login = requireString(item.owner?.login, 'owner.login', repository);
  if (login.toLowerCase() !== owner.toLowerCase()) {
    throw new Error(`Unexpected GitHub owner for ${repository}`);
  }
  if (item.private !== false) throw new Error(`Private repository returned by GitHub: ${repository}`);
  if (typeof item.fork !== 'boolean') throw new Error(`Invalid fork flag for ${repository}`);
  if (typeof item.archived !== 'boolean') throw new Error(`Invalid archived flag for ${repository}`);
  if (!Number.isInteger(item.stargazers_count) || item.stargazers_count < 0) {
    throw new Error(`Invalid stargazers_count for ${repository}`);
  }
  const updatedAt = requireString(item.pushed_at, 'pushed_at', repository);
  if (Number.isNaN(Date.parse(updatedAt))) throw new Error(`Invalid pushed_at for ${repository}`);
  if (!Array.isArray(item.topics) || item.topics.some((topic) => typeof topic !== 'string')) {
    throw new Error(`Invalid topics for ${repository}`);
  }

  return {
    repo: repository,
    name: requireString(item.name, 'name', repository),
    url: requireString(item.html_url, 'html_url', repository),
    description: item.description === null ? null : requireString(item.description, 'description', repository),
    homepage: item.homepage ? requireString(item.homepage, 'homepage', repository) : null,
    stars: item.stargazers_count,
    language: item.language === null ? null : requireString(item.language, 'language', repository),
    updatedAt,
    archived: item.archived,
    fork: item.fork,
    topics: [...item.topics].sort((left, right) => left.localeCompare(right)),
  };
}

function hasNextPage(response) {
  const link = response.headers.get('link') || '';
  return link.split(',').some((part) => /;\s*rel="next"\s*$/.test(part.trim()));
}

/**
 * @param {{ fetchImpl?: typeof fetch, token?: string, owner?: string }} options
 */
export async function fetchPublicRepositories({
  fetchImpl = fetch,
  token,
  owner = 'gobelet69',
} = {}) {
  const repositories = [];
  for (let page = 1; ; page += 1) {
    const url = new URL(`https://api.github.com/users/${encodeURIComponent(owner)}/repos`);
    url.searchParams.set('type', 'public');
    url.searchParams.set('sort', 'full_name');
    url.searchParams.set('direction', 'asc');
    url.searchParams.set('per_page', '100');
    url.searchParams.set('page', String(page));
    const response = await fetchImpl(url, { headers: githubHeaders(token) });
    const payload = await readJsonResponse(response, 'GitHub repositories request');
    if (!Array.isArray(payload)) throw new Error('GitHub repositories response was not an array');
    repositories.push(...payload.map((item) => normalizeRepository(item, owner)));
    if (!hasNextPage(response)) break;
  }
  return repositories.sort((left, right) => left.repo.localeCompare(right.repo));
}

function isoDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid contribution date: ${value}`);
  return date.toISOString().slice(0, 10);
}

function normalizeContributionCalendar(payload, owner) {
  const calendar = payload?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar || !Number.isInteger(calendar.totalContributions) || !Array.isArray(calendar.weeks)) {
    throw new Error('Invalid GitHub contribution calendar payload');
  }
  const weeks = calendar.weeks.slice(-53).map((week) => {
    if (!Array.isArray(week.contributionDays) || week.contributionDays.length === 0) {
      throw new Error('Invalid GitHub contribution week');
    }
    const days = week.contributionDays.map((day) => {
      const level = CONTRIBUTION_LEVELS.get(day.contributionLevel);
      if (!Number.isInteger(day.contributionCount) || day.contributionCount < 0 || level === undefined) {
        throw new Error(`Invalid GitHub contribution day: ${day.date}`);
      }
      return { date: isoDate(day.date), count: day.contributionCount, level };
    });
    return { firstDay: days[0].date, days };
  });
  if (weeks.length === 0) throw new Error('GitHub contribution calendar is empty');
  const days = weeks.flatMap((week) => week.days);
  return {
    owner,
    totalContributions: calendar.totalContributions,
    startsAt: days[0].date,
    endsAt: days.at(-1).date,
    weeks,
  };
}

/**
 * @param {{ fetchImpl?: typeof fetch, token?: string, owner?: string, now?: Date }} options
 */
export async function fetchContributionCalendar({
  fetchImpl = fetch,
  token,
  owner = 'gobelet69',
  now = new Date(),
} = {}) {
  const to = new Date(now);
  const from = new Date(now);
  from.setUTCDate(from.getUTCDate() - 368);
  const response = await fetchImpl('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      ...githubHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      operationName: 'ContributionCalendar',
      query: `query ContributionCalendar($owner: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $owner) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays { contributionCount contributionLevel date weekday }
              }
            }
          }
        }
      }`,
      variables: { owner, from: from.toISOString(), to: to.toISOString() },
    }),
  });
  const payload = await readJsonResponse(response, 'GitHub contributions request');
  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    throw new Error('GitHub contributions request returned GraphQL errors');
  }
  return normalizeContributionCalendar(payload, owner);
}

async function readGenerated(path) {
  try {
    const text = await readFile(path, 'utf8');
    return { text, value: JSON.parse(text) };
  } catch {
    return null;
  }
}

async function writeStableJson(path, value) {
  const next = `${JSON.stringify(value, null, 2)}\n`;
  const current = await readGenerated(path);
  if (current?.text === next) return false;
  const temporaryPath = `${path}.tmp`;
  await mkdir(dirname(path), { recursive: true });
  try {
    await writeFile(temporaryPath, next, 'utf8');
    await rename(temporaryPath, path);
  } catch (error) {
    await rm(temporaryPath, { force: true });
    throw error;
  }
  return true;
}

async function fetchWithLastKnown(fetcher, path, label) {
  try {
    return await fetcher();
  } catch (error) {
    const current = await readGenerated(path);
    if (!current) throw error;
    const reason = error instanceof Error ? error.message : `${label} unavailable`;
    console.warn(`${label} unavailable; keeping last known generated data (${reason}).`);
    return current.value;
  }
}

/**
 * @param {{
 *   fetchImpl?: typeof fetch,
 *   token?: string,
 *   owner?: string,
 *   now?: Date,
 *   repositoriesPath?: string,
 *   contributionsPath?: string,
 * }} options
 */
export async function synchronizeGitHub({
  fetchImpl = fetch,
  token,
  owner = 'gobelet69',
  now = new Date(),
  repositoriesPath = defaultRepositoriesPath,
  contributionsPath = defaultContributionsPath,
} = {}) {
  const [repositories, contributions] = await Promise.all([
    fetchWithLastKnown(
      () => fetchPublicRepositories({ fetchImpl, token, owner }),
      repositoriesPath,
      'GitHub repositories',
    ),
    fetchWithLastKnown(
      () => fetchContributionCalendar({ fetchImpl, token, owner, now }),
      contributionsPath,
      'GitHub contributions',
    ),
  ]);
  const [repositoriesChanged, contributionsChanged] = await Promise.all([
    writeStableJson(repositoriesPath, repositories),
    writeStableJson(contributionsPath, contributions),
  ]);
  return { repositoriesChanged, contributionsChanged };
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  synchronizeGitHub({ token: process.env.GITHUB_TOKEN })
    .then(({ repositoriesChanged, contributionsChanged }) => {
      const changed = [repositoriesChanged && 'repositories', contributionsChanged && 'contributions']
        .filter(Boolean)
        .join(' and ');
      console.log(changed ? `Synchronized GitHub ${changed}.` : 'GitHub data is already current.');
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : 'GitHub synchronization failed');
      process.exitCode = 1;
    });
}
