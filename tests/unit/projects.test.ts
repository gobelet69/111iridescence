import { describe, expect, it } from 'vitest';
import {
  featuredProjects,
  mergeProjects,
  projectUrl,
  type GitHubProject,
  type ProjectEntry,
} from '../../src/lib/projects';
import * as projectCatalog from '../../src/lib/project-catalog';

const github = (repo: string, stars = 0, updatedAt = '2026-08-11T12:00:00Z'): GitHubProject => ({
  repo,
  name: repo.split('/')[1],
  url: `https://github.com/${repo}`,
  description: null,
  homepage: null,
  stars,
  language: 'JavaScript',
  updatedAt,
  archived: false,
});

const editorial = (
  repo: string,
  order: number,
  overrides: Partial<ProjectEntry['data']> = {},
): ProjectEntry => ({
  id: `${repo.split('/')[1].toLowerCase()}.md`,
  body: '',
  collection: 'projects',
  data: {
    title: repo.split('/')[1],
    description: 'Une description éditoriale suffisamment précise pour présenter ce projet.',
    slug: repo.split('/')[1].toLowerCase(),
    repo,
    stack: ['JavaScript'],
    status: 'actif',
    featured: true,
    order,
    caseStudy: false,
    ...overrides,
  },
});

describe('project merge rules', () => {
  it('enriches automatic repositories without requiring an editorial entry', () => {
    const catalog = (projectCatalog as any).buildProjectCatalog({
      repositories: [{
        ...github('gobelet69/automatic'),
        fork: false,
        topics: [],
      }],
      editorial: [],
      settings: { repositories: {}, pinned: ['gobelet69/automatic'] },
    });

    expect(catalog.pinned[0]).toMatchObject({
      repo: 'gobelet69/automatic',
      title: 'automatic',
      pinned: true,
      caseStudy: false,
    });
  });

  it('uses editorial copy without using featured or order as pin settings', () => {
    const entry = editorial('gobelet69/vault', 99, { featured: false, caseStudy: true });
    const catalog = (projectCatalog as any).buildProjectCatalog({
      repositories: [{ ...github('gobelet69/vault'), fork: false, topics: [] }],
      editorial: [entry],
      settings: { repositories: {}, pinned: ['gobelet69/vault'] },
    });

    expect(catalog.pinned[0]).toMatchObject({
      title: 'vault',
      displayDescription: entry.data.description,
      caseStudy: true,
      slug: 'vault',
    });
  });

  it('uses editorial order instead of star count', () => {
    const projects = mergeProjects(
      [editorial('gobelet69/PwdGen', 2), editorial('gobelet69/vault', 1)],
      [github('gobelet69/PwdGen', 100), github('gobelet69/vault', 1)],
    );

    expect(projects.map((project) => project.repo)).toEqual([
      'gobelet69/vault',
      'gobelet69/PwdGen',
    ]);
  });

  it('keeps secondary projects ordered by their latest GitHub update', () => {
    const projects = mergeProjects(
      [
        editorial('gobelet69/vault', 1),
        editorial('gobelet69/PwdGen', 2, { featured: false }),
        editorial('gobelet69/Osint-Framework', 3, { featured: false }),
      ],
      [
        github('gobelet69/vault', 0, '2026-01-01T00:00:00Z'),
        github('gobelet69/PwdGen', 0, '2026-02-01T00:00:00Z'),
        github('gobelet69/Osint-Framework', 0, '2026-03-01T00:00:00Z'),
      ],
    );

    expect(projects.map((project) => project.repo)).toEqual([
      'gobelet69/vault',
      'gobelet69/Osint-Framework',
      'gobelet69/PwdGen',
    ]);
  });

  it('fails closed when generated data is empty or editorial data is missing', () => {
    expect(() => mergeProjects([editorial('gobelet69/vault', 1)], [])).toThrow(
      'GitHub project data is empty',
    );
    expect(() =>
      mergeProjects([editorial('gobelet69/vault', 1)], [github('gobelet69/PwdGen')]),
    ).toThrow('Missing synchronized GitHub data for gobelet69/vault');
  });

  it.each([
    ['repository', [editorial('gobelet69/vault', 1), editorial('gobelet69/vault', 2)]],
    [
      'slug',
      [editorial('gobelet69/vault', 1), editorial('gobelet69/PwdGen', 2, { slug: 'vault' })],
    ],
    ['order', [editorial('gobelet69/vault', 1), editorial('gobelet69/PwdGen', 1)]],
  ])('rejects duplicate %s values', (_kind, entries) => {
    expect(() =>
      mergeProjects(entries as ProjectEntry[], [
        github('gobelet69/vault'),
        github('gobelet69/PwdGen'),
      ]),
    ).toThrow('Duplicate');
  });

  it('rejects duplicate synchronized repositories', () => {
    expect(() =>
      mergeProjects(
        [editorial('gobelet69/vault', 1)],
        [github('gobelet69/vault'), github('gobelet69/vault')],
      ),
    ).toThrow('Duplicate synchronized repository');
  });

  it('exposes only featured entries and routes case studies locally', () => {
    const projects = mergeProjects(
      [
        editorial('gobelet69/vault', 1, { caseStudy: true }),
        editorial('gobelet69/PwdGen', 2, { featured: false }),
      ],
      [github('gobelet69/vault'), github('gobelet69/PwdGen')],
    );

    expect(featuredProjects(projects).map((project) => project.repo)).toEqual([
      'gobelet69/vault',
    ]);
    expect(projectUrl(projects[0])).toBe('/projets/vault');
    expect(projectUrl(projects[1])).toBe('https://github.com/gobelet69/PwdGen');
  });
});
