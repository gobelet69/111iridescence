import { describe, expect, it } from 'vitest';
import * as projectCatalog from '../../src/lib/project-catalog';

function repository(name: string, overrides: Record<string, unknown> = {}) {
  return {
    repo: `gobelet69/${name}`,
    name,
    url: `https://github.com/gobelet69/${name}`,
    description: `${name} repository`,
    homepage: null,
    stars: 0,
    language: 'TypeScript',
    updatedAt: '2026-08-11T12:00:00Z',
    archived: false,
    fork: false,
    topics: [],
    ...overrides,
  };
}

const repositories = Array.from({ length: 7 }, (_, index) => repository(`repo-${index + 1}`));

describe('project settings', () => {
  it('shows sources, hides forks, and honors explicit overrides', () => {
    const catalog = (projectCatalog as any).buildProjectCatalog({
      repositories: [
        repository('source'),
        repository('fork', { fork: true }),
        repository('hidden'),
      ],
      editorial: [],
      settings: {
        repositories: {
          'gobelet69/fork': { visible: true },
          'gobelet69/hidden': { visible: false },
        },
        pinned: ['gobelet69/fork'],
      },
    });

    expect(catalog.pinned.map((item: { repo: string }) => item.repo)).toEqual(['gobelet69/fork']);
    expect(catalog.others.map((item: { repo: string }) => item.repo)).toEqual(['gobelet69/source']);
  });

  it.each([1, 2, 3, 4, 5, 6])('preserves configured order for %s pins', (count) => {
    const pinned = repositories.slice(0, count).map((item) => item.repo).reverse();
    const catalog = (projectCatalog as any).buildProjectCatalog({
      repositories,
      editorial: [],
      settings: { repositories: {}, pinned },
    });

    expect(catalog.pinned.map((item: { repo: string }) => item.repo)).toEqual(pinned);
  });

  it('sorts other visible repositories by activity then repository name', () => {
    const catalog = (projectCatalog as any).buildProjectCatalog({
      repositories: [
        repository('older', { updatedAt: '2026-01-01T00:00:00Z' }),
        repository('z-latest', { updatedAt: '2026-02-01T00:00:00Z' }),
        repository('a-latest', { updatedAt: '2026-02-01T00:00:00Z' }),
      ],
      editorial: [],
      settings: { repositories: {}, pinned: ['gobelet69/older'] },
    });

    expect(catalog.others.map((item: { repo: string }) => item.repo)).toEqual([
      'gobelet69/a-latest',
      'gobelet69/z-latest',
    ]);
  });

  it('rejects a seventh pin, duplicates, unknown repositories, and an empty pin list', () => {
    const validate = (projectCatalog as any).validateProjectSettings;

    expect(() => validate({ repositories: {}, pinned: repositories.map((item) => item.repo) }, repositories))
      .toThrow('maximum 6');
    expect(() => validate({ repositories: {}, pinned: [repositories[0].repo, repositories[0].repo] }, repositories))
      .toThrow('duplicate');
    expect(() => validate({ repositories: {}, pinned: ['gobelet69/unknown'] }, repositories))
      .toThrow('unknown');
    expect(() => validate({ repositories: {}, pinned: [] }, repositories))
      .toThrow('at least 1');
  });

  it('keeps rendering when an externally deleted pin becomes orphaned', () => {
    const catalog = (projectCatalog as any).buildProjectCatalog({
      repositories: [repository('source')],
      editorial: [],
      settings: { repositories: {}, pinned: ['gobelet69/deleted'] },
    });

    expect(catalog.pinned).toEqual([]);
    expect(catalog.others.map((item: { repo: string }) => item.repo)).toEqual(['gobelet69/source']);
    expect(catalog.warnings).toEqual(['Pinned repository is unavailable: gobelet69/deleted']);
  });
});
