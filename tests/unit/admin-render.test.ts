import { describe, expect, it } from 'vitest';
import * as renderModule from '../../src/admin/render.js';

describe('admin shell rendering', () => {
  it('renders the three persistent tabs without decorative metrics', () => {
    const html = (renderModule as any).renderAdminShell();

    expect(html).toContain('À propos');
    expect(html).toContain('Blog');
    expect(html).toContain('Projets');
    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-live="polite"');
    expect(html).not.toMatch(/visiteurs|performance|engagement/i);
  });

  it('contains explicit controls for Markdown, images, pins, and GitHub refresh', () => {
    const html = (renderModule as any).renderAdminShell();

    expect(html).toContain('data-markdown-editor');
    expect(html).toContain('accept="image/jpeg,image/png,image/webp"');
    expect(html).toContain('data-project-search');
    expect(html).toContain('Actualiser GitHub maintenant');
    expect(html).toContain('n/6');
  });

  it('does not expose secrets or public navigation links', () => {
    const html = (renderModule as any).renderAdminShell();

    expect(html).not.toContain('GITHUB_CONTENT_TOKEN');
    expect(html).not.toContain('CLOUDFLARE_API_TOKEN');
    expect(html).not.toContain('href="/blog"');
    expect(html).not.toContain('href="/projets"');
  });

  it('loads a standalone browser client without portal chrome or serialized functions', () => {
    const html = (renderModule as any).renderAdminShell();

    expect(html).toContain('<script src="/admin/client.js" defer></script>');
    expect(html).not.toContain('iri-sidebar');
    expect(html).not.toContain('adminClient.toString');
    expect(html).not.toMatch(/<script>\s*\(function adminClient/);
  });
});
