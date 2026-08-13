import { describe, expect, it } from 'vitest';
import { buildRssItems } from '../../src/lib/blog';

function entry(slug: string, publishedAt: string, draft = false) {
  return {
    id: slug,
    body: 'Texte',
    data: {
      format: 'article',
      title: slug === 'statique' ? 'Pourquoi ce site reste statique' : 'Ouverture',
      description: `Description publique suffisamment longue pour ${slug}.`,
      slug,
      theme: 'systemes',
      tags: ['astro', 'architecture-web'],
      publishedAt: new Date(publishedAt),
      draft,
    },
  };
}

describe('RSS items', () => {
  it('sorts public entries newest first with absolute URLs', () => {
    const items = buildRssItems([
      entry('ouverture', '2026-08-11T16:00:00Z'),
      entry('statique', '2026-08-11T16:30:00Z'),
      entry('brouillon', '2026-08-12T16:30:00Z', true),
    ] as never, new URL('https://111iridescence.org'), new Date('2026-08-13T00:00:00Z'));

    expect(items.map(({ title }) => title)).toEqual([
      'Pourquoi ce site reste statique',
      'Ouverture',
    ]);
    expect(items.map(({ link }) => link)).toEqual([
      'https://111iridescence.org/blog/statique',
      'https://111iridescence.org/blog/ouverture',
    ]);
  });
});
