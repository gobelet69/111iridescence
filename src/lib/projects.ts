export type ProjectStatus = 'actif' | 'experimental' | 'en-pause' | 'archive';

export interface ProjectData {
  title: string;
  description: string;
  slug: string;
  repo: string;
  stack: string[];
  status: ProjectStatus;
  featured: boolean;
  order: number;
  caseStudy: boolean;
  demoUrl?: string;
  cover?: string;
}

export interface ProjectEntry {
  id: string;
  body?: string;
  collection?: 'projects';
  data: ProjectData;
}

export interface GitHubProject {
  repo: string;
  name: string;
  url: string;
  description: string | null;
  homepage: string | null;
  stars: number;
  language: string | null;
  updatedAt: string;
  archived: boolean;
}

export interface Project extends ProjectData {
  entry: ProjectEntry;
  github: GitHubProject;
  name: string;
  url: string;
  stars: number;
  language: string | null;
  updatedAt: string;
  archived: boolean;
}

function assertUnique<T>(items: T[], value: (item: T) => string | number, label: string) {
  const seen = new Set<string | number>();
  for (const item of items) {
    const current = value(item);
    if (seen.has(current)) throw new Error(`Duplicate ${label}: ${current}`);
    seen.add(current);
  }
}

export function mergeProjects(
  editorial: ProjectEntry[],
  githubProjects: GitHubProject[],
): Project[] {
  if (githubProjects.length === 0) throw new Error('GitHub project data is empty');

  assertUnique(editorial, (entry) => entry.data.repo, 'editorial repository');
  assertUnique(editorial, (entry) => entry.data.slug, 'editorial slug');
  assertUnique(editorial, (entry) => entry.data.order, 'editorial order');
  assertUnique(githubProjects, (project) => project.repo, 'synchronized repository');

  const githubByRepo = new Map(githubProjects.map((project) => [project.repo, project]));
  const projects = editorial.map((entry) => {
    const github = githubByRepo.get(entry.data.repo);
    if (!github) throw new Error(`Missing synchronized GitHub data for ${entry.data.repo}`);

    return {
      ...entry.data,
      entry,
      github,
      name: github.name,
      url: github.url,
      stars: github.stars,
      language: github.language,
      updatedAt: github.updatedAt,
      archived: github.archived,
    };
  });

  return projects.sort((left, right) => {
    if (left.featured !== right.featured) return left.featured ? -1 : 1;
    if (left.featured) return left.order - right.order;
    return Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
  });
}

export function featuredProjects(projects: Project[]): Project[] {
  return projects.filter((project) => project.featured);
}

export function projectUrl(project: Project): string {
  return project.caseStudy ? `/projets/${project.slug}` : project.url;
}
