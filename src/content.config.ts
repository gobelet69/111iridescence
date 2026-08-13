import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { normalizeTag, THEMES } from './lib/blog';

const dateWithOffset = z.string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/,
    'Date must include an explicit UTC offset',
  )
  .transform((value) => new Date(value));

export const blogSchema = z.object({
  format: z.enum(['article', 'note']),
  title: z.string().min(4),
  description: z.string().min(20).max(180),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  theme: z.enum(THEMES),
  tags: z.array(z.string())
    .min(2)
    .max(4)
    .refine(
      (tags) => tags.every((tag) => tag === normalizeTag(tag)),
      'Tags must already be normalized',
    ),
  publishedAt: dateWithOffset,
  updatedAt: dateWithOffset.optional(),
  draft: z.boolean().default(false),
  series: z.string().min(2).optional(),
  socialImage: z.string().optional(),
});

const blog = defineCollection({
  loader: glob({ base: './src/data/blog', pattern: '**/index.md' }),
  schema: blogSchema,
});

export const projectSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(20).max(180),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  repo: z.string().regex(/^gobelet69\/[A-Za-z0-9._-]+$/),
  stack: z.array(z.string()).min(1).max(8),
  status: z.enum(['actif', 'experimental', 'en-pause', 'archive']),
  featured: z.boolean(),
  order: z.number().int().nonnegative(),
  caseStudy: z.boolean().default(false),
  demoUrl: z.url().optional(),
  cover: z.string().optional(),
});

const projects = defineCollection({
  loader: glob({ base: './src/data/projects', pattern: '**/*.md' }),
  schema: projectSchema,
});

export const collections = { blog, projects };
