import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import * as contentModule from '../../src/admin/content.js';

const post = {
  format: 'article',
  title: 'Choix Astro',
  description: 'Une description précise et suffisamment longue pour cet article.',
  slug: 'choix-astro',
  theme: 'systemes',
  tags: ['astro', 'architecture-web'],
  publishedAt: '2026-08-13T10:00:00+02:00',
  draft: true,
  body: '# Corps',
};

describe('admin content service', () => {
  it('parses every checked-in historical post before its first admin save', async () => {
    for (const slug of ['architecture-astro', 'brouillon-prive', 'ouverture']) {
      const markdown = await readFile(`src/data/blog/${slug}/index.md`, 'utf8');
      const parsed = (contentModule as any).parsePost(markdown);
      expect(parsed.tags.length).toBeGreaterThanOrEqual(2);
      expect(parsed.publishedAt).toMatch(/[+-]\d{2}:\d{2}$/);
    }
  });

  it('serializes deterministic frontmatter and Markdown', () => {
    expect((contentModule as any).serializePost(post)).toBe(`---
format: article
title: "Choix Astro"
description: "Une description précise et suffisamment longue pour cet article."
slug: choix-astro
theme: systemes
tags:
  - astro
  - architecture-web
publishedAt: "2026-08-13T10:00:00+02:00"
draft: true
---

# Corps
`);
  });

  it('renames a post folder atomically and keeps uploaded images', () => {
    const changes = (contentModule as any).buildPostChanges({
      post: { ...post, slug: 'nouveau' },
      previousSlug: 'ancien',
      existingImages: [{ name: 'schema.webp', contentBase64: 'UklGRgAAAABXRUJQ' }],
      images: [],
    });

    expect(changes).toEqual(expect.arrayContaining([
      { path: 'src/data/blog/ancien/index.md', delete: true },
      expect.objectContaining({ path: 'src/data/blog/nouveau/index.md' }),
      { path: 'src/data/blog/ancien/images/schema.webp', delete: true },
      expect.objectContaining({
        path: 'src/data/blog/nouveau/images/schema.webp',
        contentBase64: 'UklGRgAAAABXRUJQ',
      }),
    ]));
  });

  it('validates WebP signatures and rejects unsafe image paths', () => {
    const validate = (contentModule as any).validateImage;
    const webp = { name: 'schema.webp', contentBase64: 'UklGRgAAAABXRUJQ' };

    expect(validate(webp)).toMatchObject({ name: 'schema.webp' });
    for (const invalid of [
      { ...webp, name: '../secret.webp' },
      { ...webp, name: 'image.svg' },
      { ...webp, name: 'A-B.webp' },
      { ...webp, contentBase64: 'PHN2Zz4=' },
    ]) expect(() => validate(invalid)).toThrow();
  });

  it('rejects invalid post metadata and raw HTML bodies', () => {
    const serialize = (contentModule as any).serializePost;

    expect(() => serialize({ ...post, tags: ['astro'] })).toThrow('tags');
    expect(() => serialize({ ...post, body: '<script>alert(1)</script>' })).toThrow('HTML');
    expect(() => serialize({ ...post, title: 'Theo Deville' })).toThrow('anonymous');
  });
});
