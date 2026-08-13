import { describe, expect, it } from 'vitest';
import { blogSchema, projectSchema } from '../../src/content.config';

const validEntry = {
  format: 'article',
  title: 'Choix Astro',
  description: 'Une description précise et suffisamment longue pour le schéma.',
  slug: 'choix-astro',
  theme: 'systemes',
  tags: ['astro', 'architecture-web'],
  publishedAt: '2026-08-11T18:00:00+02:00',
};

describe('blog content schema', () => {
  it('accepts a complete normalized publication', () => {
    const result = blogSchema.safeParse(validEntry);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.publishedAt).toEqual(new Date('2026-08-11T16:00:00Z'));
      expect(result.data.draft).toBe(false);
    }
  });

  it('requires between two and four normalized tags', () => {
    expect(blogSchema.safeParse({ ...validEntry, tags: ['astro'] }).success).toBe(false);
    expect(blogSchema.safeParse({ ...validEntry, tags: ['astro', 'Sécurité'] }).success).toBe(false);
  });

  it('accepts only the four editorial themes', () => {
    expect(blogSchema.safeParse({ ...validEntry, theme: 'actualites' }).success).toBe(false);
  });

  it('requires an explicit UTC offset on publication dates', () => {
    expect(blogSchema.safeParse({ ...validEntry, publishedAt: '2026-08-11T18:00:00' }).success).toBe(false);
    expect(blogSchema.safeParse({ ...validEntry, publishedAt: '2026-08-11T16:00:00Z' }).success).toBe(true);
    expect(blogSchema.safeParse({ ...validEntry, publishedAt: '2026-08-11T18:00:00+02:00' }).success).toBe(true);
  });
});

describe('project content schema', () => {
  const validProject = {
    title: 'Vault',
    description: 'Interface personnelle de fichiers et de notes, avec métadonnées D1 et stockage R2.',
    slug: 'vault',
    repo: 'gobelet69/portail-vault',
    stack: ['JavaScript', 'Cloudflare Workers', 'D1', 'R2'],
    status: 'actif',
    featured: true,
    order: 1,
  };

  it('accepts a complete project and defaults case studies to false', () => {
    const result = projectSchema.safeParse(validProject);

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.caseStudy).toBe(false);
  });

  it('rejects unapproved owners and unknown statuses', () => {
    expect(projectSchema.safeParse({ ...validProject, repo: 'someone/vault' }).success).toBe(false);
    expect(projectSchema.safeParse({ ...validProject, status: 'maintenu' }).success).toBe(false);
  });
});
