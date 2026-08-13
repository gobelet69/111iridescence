import { describe, expect, it } from 'vitest';
import {
  formatPublishedDate,
  getPublishedPosts,
  getSeriesPosts,
  normalizeTag,
  postUrl,
  readingMinutes,
} from '../../src/lib/blog';

function entry(overrides: Record<string, unknown> = {}) {
  return {
    id: String(overrides.slug ?? 'post'),
    body: 'texte',
    data: {
      format: 'article',
      title: 'Titre technique',
      description: 'Une description assez longue pour représenter un contenu public.',
      slug: 'post',
      theme: 'systemes',
      tags: ['astro', 'architecture-web'],
      publishedAt: new Date('2026-08-11T18:00:00+02:00'),
      draft: false,
      ...overrides,
    },
  };
}

describe('blog helpers', () => {
  it('normalizes tags into stable URL keys', () => {
    expect(normalizeTag('Sécurité Web')).toBe('securite-web');
    expect(normalizeTag('  Astro  ')).toBe('astro');
  });

  it('uses Belgian dates without UTC day drift', () => {
    expect(formatPublishedDate(new Date('2026-08-10T22:30:00Z'))).toBe('11 août 2026');
  });

  it('rounds reading time up with a minimum of one minute', () => {
    expect(readingMinutes('court')).toBe(1);
    expect(readingMinutes(Array(401).fill('mot').join(' '))).toBe(2);
  });

  it('excludes drafts and future publications before sorting newest first', () => {
    const posts = getPublishedPosts([
      entry({ slug: 'ancien', publishedAt: new Date('2026-08-10T10:00:00Z') }),
      entry({ slug: 'recent', publishedAt: new Date('2026-08-12T10:00:00Z') }),
      entry({ slug: 'brouillon', draft: true, publishedAt: new Date('2026-08-11T10:00:00Z') }),
      entry({ slug: 'futur', publishedAt: new Date('2026-08-14T10:00:00Z') }),
    ] as never, new Date('2026-08-13T10:00:00Z'));

    expect(posts.map((post) => post.data.slug)).toEqual(['recent', 'ancien']);
  });

  it('filters a public series before ordering it oldest first', () => {
    const posts = getSeriesPosts([
      entry({ slug: 'deux', series: 'astro-interne', publishedAt: new Date('2026-08-12T10:00:00Z') }),
      entry({ slug: 'brouillon', series: 'astro-interne', draft: true }),
      entry({ slug: 'ailleurs', series: 'autre-serie' }),
      entry({ slug: 'un', series: 'astro-interne', publishedAt: new Date('2026-08-10T10:00:00Z') }),
    ] as never, 'astro-interne', new Date('2026-08-13T10:00:00Z'));

    expect(posts.map((post) => post.data.slug)).toEqual(['un', 'deux']);
  });

  it('builds the canonical publication URL from frontmatter', () => {
    expect(postUrl(entry({ slug: 'route-stable' }) as never)).toBe('/blog/route-stable');
  });
});
