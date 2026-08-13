import type { ProjectEntry, ProjectStatus } from './projects';

export interface GitHubRepository {
  repo: string;
  name: string;
  url: string;
  description: string | null;
  homepage: string | null;
  stars: number;
  language: string | null;
  updatedAt: string;
  archived: boolean;
  fork: boolean;
  topics: string[];
}

export interface ProjectSettings {
  repositories: Record<string, { visible: boolean }>;
  pinned: string[];
}

export interface CatalogProject extends GitHubRepository {
  title: string;
  displayDescription: string | null;
  stack: string[];
  status?: ProjectStatus;
  caseStudy: boolean;
  slug?: string;
  pinned: boolean;
  entry?: ProjectEntry;
}

export interface ProjectCatalog {
  pinned: CatalogProject[];
  others: CatalogProject[];
  warnings: string[];
}

interface CatalogInput {
  repositories: GitHubRepository[];
  editorial: ProjectEntry[];
  settings: ProjectSettings;
}

function duplicateValues(values: string[]) {
  const seen = new Set<string>();
  return values.filter((value) => {
    if (seen.has(value)) return true;
    seen.add(value);
    return false;
  });
}

function assertUnique(values: string[], label: string) {
  const duplicates = duplicateValues(values);
  if (duplicates.length > 0) throw new Error(`duplicate ${label}: ${duplicates[0]}`);
}

function validateRepository(repository: GitHubRepository) {
  if (!/^gobelet69\/[A-Za-z0-9._-]+$/.test(repository.repo)) {
    throw new Error(`Invalid synchronized repository: ${repository.repo}`);
  }
  if (Number.isNaN(Date.parse(repository.updatedAt))) {
    throw new Error(`Invalid synchronized repository date: ${repository.repo}`);
  }
}

export function validateProjectSettings(
  settings: ProjectSettings,
  repositories: GitHubRepository[],
): ProjectSettings {
  if (!settings || typeof settings !== 'object' || !Array.isArray(settings.pinned)) {
    throw new Error('Invalid project settings');
  }
  if (settings.pinned.length < 1) throw new Error('Project settings require at least 1 pinned repository');
  if (settings.pinned.length > 6) throw new Error('Project settings allow a maximum 6 pinned repositories');
  assertUnique(settings.pinned, 'pinned repository');

  const available = new Set(repositories.map((repository) => repository.repo));
  for (const repo of settings.pinned) {
    if (!available.has(repo)) throw new Error(`Pinned repository is unknown: ${repo}`);
  }
  if (!settings.repositories || typeof settings.repositories !== 'object' || Array.isArray(settings.repositories)) {
    throw new Error('Invalid repository visibility settings');
  }
  for (const [repo, preference] of Object.entries(settings.repositories)) {
    if (!available.has(repo)) throw new Error(`Repository visibility setting is unknown: ${repo}`);
    if (!preference || typeof preference.visible !== 'boolean') {
      throw new Error(`Invalid visibility setting for ${repo}`);
    }
  }
  return settings;
}

function enrichRepository(
  repository: GitHubRepository,
  entry: ProjectEntry | undefined,
  pinned: boolean,
): CatalogProject {
  return {
    ...repository,
    title: entry?.data.title ?? repository.name,
    displayDescription: entry?.data.description ?? repository.description,
    stack: entry?.data.stack ?? (repository.language ? [repository.language] : []),
    status: entry?.data.status,
    caseStudy: entry?.data.caseStudy ?? false,
    slug: entry?.data.slug,
    pinned,
    entry,
  };
}

export function buildProjectCatalog({
  repositories,
  editorial,
  settings,
}: CatalogInput): ProjectCatalog {
  assertUnique(repositories.map((repository) => repository.repo), 'synchronized repository');
  assertUnique(editorial.map((entry) => entry.data.repo), 'editorial repository');
  assertUnique(editorial.map((entry) => entry.data.slug), 'editorial slug');
  repositories.forEach(validateRepository);

  const warnings: string[] = [];
  const repositoriesByName = new Map(repositories.map((repository) => [repository.repo, repository]));
  const editorialByName = new Map(editorial.map((entry) => [entry.data.repo, entry]));
  const requestedPins = new Set<string>();
  const pinned: CatalogProject[] = [];

  for (const repo of settings.pinned) {
    if (requestedPins.has(repo)) {
      warnings.push(`Pinned repository is duplicated: ${repo}`);
      continue;
    }
    requestedPins.add(repo);
    const repository = repositoriesByName.get(repo);
    if (!repository) {
      warnings.push(`Pinned repository is unavailable: ${repo}`);
      continue;
    }
    pinned.push(enrichRepository(repository, editorialByName.get(repo), true));
  }

  const others = repositories
    .filter((repository) => {
      if (requestedPins.has(repository.repo)) return false;
      return settings.repositories[repository.repo]?.visible ?? !repository.fork;
    })
    .map((repository) => enrichRepository(repository, editorialByName.get(repository.repo), false))
    .sort((left, right) => {
      const dateDifference = Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
      return dateDifference || left.repo.localeCompare(right.repo);
    });

  for (const repo of Object.keys(settings.repositories)) {
    if (!repositoriesByName.has(repo)) warnings.push(`Repository visibility setting is orphaned: ${repo}`);
  }

  return { pinned, others, warnings };
}

export function projectUrl(project: CatalogProject): string {
  return project.caseStudy && project.slug ? `/projets/${project.slug}` : project.url;
}
