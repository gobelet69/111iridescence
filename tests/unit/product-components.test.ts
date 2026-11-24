import { readFile } from 'node:fs/promises';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import AppScreenshot from '../../src/components/apps/AppScreenshot.astro';
import ProductJsonLd from '../../src/components/apps/ProductJsonLd.astro';
import ReleaseDownload from '../../src/components/apps/ReleaseDownload.astro';
import { getApp } from '../../src/data/apps';

describe('product presentation primitives', () => {
  it('renders intrinsic, lazy authentic screenshots by default', async () => {
    const app = getApp('mass-print');
    const container = await AstroContainer.create();
    const html = await container.renderToString(AppScreenshot, {
      props: { screenshot: app.primaryScreenshot },
    });

    expect(html).toContain('src="/apps/mass-print/mass-print-main.png"');
    expect(html).toContain('width="2080"');
    expect(html).toContain('height="1440"');
    const png = await readFile(new URL('../../public/apps/mass-print/mass-print-main.png', import.meta.url));
    expect(png.readUInt32BE(16)).toBe(app.primaryScreenshot.width);
    expect(png.readUInt32BE(20)).toBe(app.primaryScreenshot.height);
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
    expect(html).toContain(app.primaryScreenshot.alt);
  });

  it('provides a real releases-page fallback before discovery', async () => {
    const app = getApp('iridescence-pdf-reader');
    const container = await AstroContainer.create();
    const html = await container.renderToString(ReleaseDownload, { props: { app, locale: 'fr' } });

    expect(html).toContain('Voir les releases sur GitHub');
    expect(html).toContain('href="https://github.com/gobelet69/iridecence-pdf-reader/releases"');
    expect(html).toContain('data-release-role="status"');
    expect(html).toContain('data-release-role="retry"');
    expect(html).toContain('data-release-slug="iridescence-pdf-reader"');
    expect(html).toContain('data-release-role="link"');
    expect(html).toContain('Version détectée automatiquement');
    expect(html).not.toContain('aria-disabled="true"');
  });

  it('keeps release details and omits notes in the compact product control', async () => {
    const app = getApp('mass-print');
    const container = await AstroContainer.create();
    const html = await container.renderToString(ReleaseDownload, {
      props: { app, locale: 'en', variant: 'compact' },
    });

    expect(html).toContain('release-download--compact');
    expect(html).toContain('data-release-role="version"');
    expect(html).not.toContain('data-release-role="notes"');
  });

  it('emits SoftwareApplication JSON-LD from the catalog', async () => {
    const app = getApp('mass-print');
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProductJsonLd, { props: { app, locale: 'fr' } });
    const script = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1];

    expect(script).toBeTruthy();
    const data = JSON.parse(script!);
    expect(data).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Mass Print',
      operatingSystem: 'macOS 13 ou version ultérieure',
      applicationCategory: 'UtilitiesApplication',
    });
    expect(data.url).toBe('https://111iridescence.org/fr/apps/mass-print');
  });
});
