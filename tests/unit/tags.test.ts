import { describe, expect, it } from 'vitest';
import { aggregateTags } from '../../src/lib/blog';

describe('tag aggregation', () => {
  it('counts by frequency and then sorts ties alphabetically', () => {
    expect(aggregateTags([
      { data: { tags: ['astro', 'web'] } },
      { data: { tags: ['astro', 'securite-web'] } },
    ] as never)).toEqual([
      { tag: 'astro', count: 2 },
      { tag: 'securite-web', count: 1 },
      { tag: 'web', count: 1 },
    ]);
  });

  it('does not mutate the publication tags it reads', () => {
    const tags = ['systemes', 'astro'];
    aggregateTags([{ data: { tags } }] as never);
    expect(tags).toEqual(['systemes', 'astro']);
  });
});
