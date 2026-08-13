import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as githubSync from '../../scripts/sync-github-projects.mjs';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

function repository(name: string, overrides: Record<string, unknown> = {}) {
  return {
    full_name: `gobelet69/${name}`,
    name,
    html_url: `https://github.com/gobelet69/${name}`,
    description: `${name} repository`,
    homepage: null,
    stargazers_count: 3,
    language: 'JavaScript',
    topics: [],
    pushed_at: '2026-08-11T12:00:00Z',
    archived: false,
    fork: false,
    private: false,
    owner: { login: 'gobelet69' },
    ...overrides,
  };
}

function jsonResponse(value: unknown, init: ResponseInit & { link?: string } = {}) {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json');
  if (init.link) headers.set('link', init.link);
  return new Response(JSON.stringify(value), { ...init, headers });
}

function contributionCalendar() {
  const start = new Date('2025-08-10T00:00:00Z');
  let dayOffset = 0;
  const weeks = Array.from({ length: 53 }, (_, weekIndex) => {
    const dayCount = weekIndex < 51 ? 7 : 6;
    const contributionDays = Array.from({ length: dayCount }, (_, dayIndex) => {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + dayOffset);
      dayOffset += 1;
      return {
        contributionCount: dayIndex % 3,
        contributionLevel: ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE'][dayIndex % 3],
        date: date.toISOString().slice(0, 10),
        weekday: dayIndex,
      };
    });
    return { firstDay: contributionDays[0].date, contributionDays };
  });
  return { totalContributions: 461, weeks };
}

describe('GitHub synchronization', () => {
  it('keeps both generated snapshots eligible for version control', async () => {
    const ignoreRules = await readFile('.gitignore', 'utf8');

    expect(ignoreRules).not.toMatch(/^src\/generated\/github-(?:projects|contributions)\.json$/m);
  });

  it('paginates every public repository without filtering forks or topics', async () => {
    const fetchImpl = vi.fn(async (input: URL | RequestInfo) => {
      const page = new URL(String(input)).searchParams.get('page');
      if (page === '1') {
        return jsonResponse(
          [repository('source'), repository('fork', { fork: true })],
          { link: '<https://api.github.com/users/gobelet69/repos?page=2>; rel="next"' },
        );
      }
      return jsonResponse([repository('no-topic')]);
    });

    const repositories = await (githubSync as any).fetchPublicRepositories({
      fetchImpl,
      token: 'secret',
      owner: 'gobelet69',
    });

    expect(repositories.map((item: { repo: string }) => item.repo)).toEqual([
      'gobelet69/fork',
      'gobelet69/no-topic',
      'gobelet69/source',
    ]);
    expect(repositories.find((item: { repo: string }) => item.repo.endsWith('/fork')).fork).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(String(fetchImpl.mock.calls[0][0])).toContain('/users/gobelet69/repos');
    expect(String(fetchImpl.mock.calls[0][0])).not.toContain('111-showcase');
  });

  it('normalizes 53 contribution weeks and 369 days', async () => {
    const calendar = contributionCalendar();
    const fetchImpl = vi.fn(async (_input: URL | RequestInfo, _init?: RequestInit) => jsonResponse({
      data: {
        user: {
          contributionsCollection: { contributionCalendar: calendar },
        },
      },
    }));

    const normalized = await (githubSync as any).fetchContributionCalendar({
      fetchImpl,
      token: 'secret',
      owner: 'gobelet69',
      now: new Date('2026-08-13T12:00:00Z'),
    });

    expect(normalized.weeks).toHaveLength(53);
    expect(normalized.weeks.flatMap((week: { days: unknown[] }) => week.days)).toHaveLength(369);
    expect(normalized.totalContributions).toBe(461);
    expect(normalized.weeks[0].days[1]).toMatchObject({ count: 1, level: 1 });
    const request = fetchImpl.mock.calls[0][1] as RequestInit;
    expect(request.method).toBe('POST');
    expect(new Headers(request.headers).get('Authorization')).toBe('Bearer secret');
  });

  it.each([401, 403, 500])('fails on HTTP %s without exposing the token', async (status) => {
    const operation = (githubSync as any).fetchPublicRepositories({
      fetchImpl: async () => new Response('{}', { status }),
      token: 'do-not-print-this',
      owner: 'gobelet69',
    });

    await expect(operation).rejects.toThrow(`HTTP ${status}`);
    await expect(operation).rejects.not.toThrow('do-not-print-this');
  });

  it('does not rewrite stable generated files', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'iridescence-github-sync-'));
    temporaryDirectories.push(directory);
    const repositoriesPath = join(directory, 'github-projects.json');
    const contributionsPath = join(directory, 'github-contributions.json');
    const normalizedRepository = {
      repo: 'gobelet69/source',
      name: 'source',
      url: 'https://github.com/gobelet69/source',
      description: 'source repository',
      homepage: null,
      stars: 3,
      language: 'JavaScript',
      updatedAt: '2026-08-11T12:00:00Z',
      archived: false,
      fork: false,
      topics: [],
    };
    const normalizedCalendar = {
      owner: 'gobelet69',
      totalContributions: 461,
      startsAt: '2025-08-10',
      endsAt: '2026-08-13',
      weeks: contributionCalendar().weeks.map((week) => ({
        firstDay: week.firstDay,
        days: week.contributionDays.map((day) => ({
          date: day.date,
          count: day.contributionCount,
          level: ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE'].indexOf(day.contributionLevel),
        })),
      })),
    };
    await writeFile(repositoriesPath, `${JSON.stringify([normalizedRepository], null, 2)}\n`);
    await writeFile(contributionsPath, `${JSON.stringify(normalizedCalendar, null, 2)}\n`);

    const result = await (githubSync as any).synchronizeGitHub({
      token: 'secret',
      owner: 'gobelet69',
      repositoriesPath,
      contributionsPath,
      now: new Date('2026-08-13T12:00:00Z'),
      fetchImpl: async (input: URL | RequestInfo) => {
        if (String(input).includes('graphql')) {
          return jsonResponse({ data: { user: { contributionsCollection: { contributionCalendar: contributionCalendar() } } } });
        }
        return jsonResponse([repository('source')]);
      },
    });

    expect(result).toEqual({ repositoriesChanged: false, contributionsChanged: false });
    expect(await readFile(repositoriesPath, 'utf8')).toBe(`${JSON.stringify([normalizedRepository], null, 2)}\n`);
  });
});
