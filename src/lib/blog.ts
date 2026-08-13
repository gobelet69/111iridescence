export const THEMES = ['developpement', 'securite', 'systemes', 'projets'] as const;
export type BlogTheme = typeof THEMES[number];
export type BlogFormat = 'article' | 'note';

export interface BlogEntry {
  id: string;
  body?: string;
  data: {
    format: BlogFormat;
    title: string;
    description: string;
    slug: string;
    theme: BlogTheme;
    tags: string[];
    publishedAt: Date;
    updatedAt?: Date;
    draft: boolean;
    series?: string;
    socialImage?: string;
  };
}

export function normalizeTag(value: string) {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function formatPublishedDate(date: Date) {
  return new Intl.DateTimeFormat('fr-BE', {
    dateStyle: 'long',
    timeZone: 'Europe/Brussels',
  }).format(date);
}

export function readingMinutes(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 240));
}

export function getPublishedPosts<T extends BlogEntry>(entries: T[], now = new Date()) {
  return entries
    .filter((entry) => !entry.data.draft && entry.data.publishedAt.getTime() <= now.getTime())
    .sort((left, right) => right.data.publishedAt.getTime() - left.data.publishedAt.getTime());
}

export function getSeriesPosts<T extends BlogEntry>(entries: T[], series: string, now = new Date()) {
  return getPublishedPosts(entries, now)
    .filter((entry) => entry.data.series === series)
    .sort((left, right) => left.data.publishedAt.getTime() - right.data.publishedAt.getTime());
}

export function postUrl(entry: BlogEntry) {
  return `/blog/${entry.data.slug}`;
}

export function aggregateTags(entries: Array<{ data: { tags: string[] } }>) {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    for (const tag of entry.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(counts, ([tag, count]) => ({ tag, count }))
    .sort((left, right) => right.count - left.count || left.tag.localeCompare(right.tag));
}

export function buildRssItems<T extends BlogEntry>(entries: T[], site: URL, now = new Date()) {
  return getPublishedPosts(entries, now).map((entry) => ({
    title: entry.data.title,
    description: entry.data.description,
    pubDate: entry.data.publishedAt,
    link: new URL(postUrl(entry), site).href,
  }));
}
