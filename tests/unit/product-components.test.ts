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
    expect(html).toContain('width="1180"');
    expect(html).toContain('height="760"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
    expect(html).toContain(app.primaryScreenshot.alt);
  });

  it('keeps an unavailable release semantic until runtime discovery succeeds', async () => {
    const app = getApp('iridescence-pdf-reader');
    const container = await AstroContainer.create();
    const html = await container.renderToString(ReleaseDownload, { props: { app, locale: 'fr' } });

    expect(html).toContain('Bientôt disponible');
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain('data-release-slug="iridescence-pdf-reader"');
    expect(html).toContain('data-release-role="link"');
    expect(html).toContain('Version détectée automatiquement');
    expect(html).not.toMatch(/data-release-role="link"[^>]+href=/);
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
      operatingSystem: 'macOS 12.3 ou version ultérieure',
      applicationCategory: 'UtilitiesApplication',
    });
    expect(data.url).toBe('https://111iridescence.org/fr/apps/mass-print');
  });
});
