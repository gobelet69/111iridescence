import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import InstallerProduct from '../../src/components/apps/InstallerProduct.astro';
import MassPrintProduct from '../../src/components/apps/MassPrintProduct.astro';
import PdfReaderProduct from '../../src/components/apps/PdfReaderProduct.astro';
import QuickPadProduct from '../../src/components/apps/QuickPadProduct.astro';
import ResourceGuardProduct from '../../src/components/apps/ResourceGuardProduct.astro';
import { apps, getApp } from '../../src/data/apps';

describe('product page compositions', () => {
  it('renders overview, features, gallery and download for Iridescence Installer', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(InstallerProduct, {
      props: { app: getApp('iridescence-installer', 'fr'), locale: 'fr' },
    });

    expect(html.match(/<h1/g)).toHaveLength(1);
    for (const id of ['overview', 'features', 'gallery', 'discover', 'updates', 'quarantine', 'download']) {
      expect(html).toContain(`id="${id}"`);
    }
    expect(html).toContain('data-release-slug="iridescence-installer"');
    expect(html).toContain('href="/fr/apps"');
  });

  it('renders every required PDF Reader chapter from verified product data', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PdfReaderProduct, {
      props: { app: getApp('iridescence-pdf-reader', 'fr'), locale: 'fr' },
    });

    expect(html.match(/<h1/g)).toHaveLength(1);
    for (const id of ['overview', 'gallery', 'workspaces', 'reading', 'command-palette', 'ocr', 'download']) {
      expect(html).toContain(`id="${id}"`);
    }
    expect(html).toContain('Apple Vision');
    expect(html).toContain('data-release-slug="iridescence-pdf-reader"');
    expect(html).toContain('href="/fr/apps"');
  });

  it('renders ordering, Finder, privacy and download for Mass Print', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(MassPrintProduct, {
      props: { app: getApp('mass-print', 'fr'), locale: 'fr' },
    });

    expect(html.match(/<h1/g)).toHaveLength(1);
    for (const id of ['overview', 'features', 'gallery', 'ordering', 'finder', 'privacy', 'download']) {
      expect(html).toContain(`id="${id}"`);
    }
    expect(html).toContain('Ordre d’impression');
    expect(html).toContain('data-release-slug="mass-print"');
    expect(html).toContain('href="/fr/apps"');
  });

  it('renders overview, features, gallery and download for Resource Guard', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ResourceGuardProduct, {
      props: { app: getApp('resource-guard', 'fr'), locale: 'fr' },
    });

    expect(html.match(/<h1/g)).toHaveLength(1);
    for (const id of ['overview', 'features', 'gallery', 'adaptive', 'memory', 'safety', 'download']) {
      expect(html).toContain(`id="${id}"`);
    }
    expect(html).toContain('data-release-slug="resource-guard"');
    expect(html).toContain('href="/fr/apps"');
  });

  it('renders overview, features, gallery and download for QuickPad', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(QuickPadProduct, {
      props: { app: getApp('quickpad', 'fr'), locale: 'fr' },
    });

    expect(html.match(/<h1/g)).toHaveLength(1);
    for (const id of ['overview', 'features', 'gallery', 'speed', 'inspectors', 'integrity', 'download']) {
      expect(html).toContain(`id="${id}"`);
    }
    expect(html).toContain('data-release-slug="quickpad"');
    expect(html).toContain('href="/fr/apps"');
  });

  it('keeps catalog slugs unique and route-ready', () => {
    expect(apps.map((app) => app.slug)).toEqual(['iridescence-installer', 'iridescence-pdf-reader', 'mass-print', 'resource-guard', 'quickpad']);
    expect(new Set(apps.map((app) => app.slug)).size).toBe(apps.length);
  });
});
