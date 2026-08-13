import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE } from '../config/site';
import { buildRssItems } from '../lib/blog';

export async function GET(context: APIContext) {
  const site = context.site ?? new URL(SITE.origin);
  return rss({
    title: '111iridescence — Blog',
    description: 'Articles et notes techniques.',
    site,
    items: buildRssItems(await getCollection('blog'), site),
  });
}
