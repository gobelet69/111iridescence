import { describe, expect, it, vi } from 'vitest';
import { mountReleaseDownloads } from '../../src/scripts/release-download';

type TestElement = {
  dataset: Record<string, string>;
  textContent: string;
  attributes: Map<string, string>;
  hidden: boolean;
  setAttribute(name: string, value: string): void;
};

function element(slug: string, role: string, text = ''): TestElement {
  return {
    dataset: { releaseSlug: slug, releaseRole: role },
    textContent: text,
    attributes: new Map(),
    hidden: role === 'notes',
    setAttribute(name, value) {
      this.attributes.set(name, value);
    },
  };
}

function fixture(elements: TestElement[]) {
  return {
    querySelectorAll(selector: string) {
      const slug = selector.match(/data-release-slug="([^"]+)"/)?.[1];
      const role = selector.match(/data-release-role="([^"]+)"/)?.[1];
      return elements.filter((candidate) => (
        (!slug || candidate.dataset.releaseSlug === slug)
        && (!role || candidate.dataset.releaseRole === role)
      ));
    },
  };
}

const availableRelease = {
  available: true,
  version: '0.1.3',
  format: 'DMG universel',
  architecture: 'Apple Silicon et Intel',
  compatibility: 'macOS 12.3 ou version ultérieure',
  downloadUrl: 'https://github.com/gobelet69/Mass-Print/releases/download/v0.1.3/Mass.Print_0.1.3_universal.dmg',
  releaseUrl: 'https://github.com/gobelet69/Mass-Print/releases/tag/v0.1.3',
  publishedAt: '2026-10-24T12:56:16Z',
  notes: 'Universal macOS build.',
};

describe('release download enhancement', () => {
  it('preserves the unavailable semantic fallback', async () => {
    const link = element('iridescence-pdf-reader', 'link', 'Bientôt disponible');

    await mountReleaseDownloads(fixture([link]) as unknown as ParentNode, async () => Response.json({
      available: false,
      compatibility: 'macOS 14 ou version ultérieure',
      architecture: 'Apple Silicon',
    }));

    expect(link.textContent).toBe('Bientôt disponible');
    expect(link.attributes.has('href')).toBe(false);
  });

  it('activates every matching control from one network request', async () => {
    const heroLink = element('mass-print', 'link', 'Bientôt disponible');
    const footerLink = element('mass-print', 'link', 'Bientôt disponible');
    const version = element('mass-print', 'version');
    const format = element('mass-print', 'format');
    const notes = element('mass-print', 'notes');
    const fetchRelease = vi.fn(async () => Response.json(availableRelease));

    await mountReleaseDownloads(
      fixture([heroLink, footerLink, version, format, notes]) as unknown as ParentNode,
      fetchRelease,
      'fr',
    );

    expect(fetchRelease).toHaveBeenCalledTimes(1);
    expect(fetchRelease).toHaveBeenCalledWith('/api/releases/mass-print', expect.any(Object));
    expect(heroLink.attributes.get('href')).toBe(availableRelease.downloadUrl);
    expect(footerLink.attributes.get('href')).toBe(availableRelease.downloadUrl);
    expect(heroLink.attributes.get('aria-disabled')).toBe('false');
    expect(footerLink.attributes.get('aria-disabled')).toBe('false');
    expect(heroLink.textContent).toBe('Télécharger pour macOS');
    expect(version.textContent).toBe('Version 0.1.3');
    expect(format.textContent).toBe('DMG universel');
    expect(notes.textContent).toBe('Universal macOS build.');
    expect(notes.hidden).toBe(false);
  });

  it('localizes an available release for English pages', async () => {
    const link = element('mass-print', 'link', 'Coming soon');
    const version = element('mass-print', 'version');
    const format = element('mass-print', 'format');

    await mountReleaseDownloads(
      fixture([link, version, format]) as unknown as ParentNode,
      async () => Response.json(availableRelease),
      'en',
    );

    expect(link.textContent).toBe('Download for macOS');
    expect(version.textContent).toBe('Version 0.1.3');
    expect(format.textContent).toBe('Universal DMG');
  });

  it('localizes the macOS ZIP format in both languages', async () => {
    const englishFormat = element('iridescence-pdf-reader', 'format');
    const frenchFormat = element('iridescence-pdf-reader', 'format');
    const zipRelease = { ...availableRelease, format: 'ZIP macOS' };

    await mountReleaseDownloads(
      fixture([englishFormat]) as unknown as ParentNode,
      async () => Response.json(zipRelease),
      'en',
    );
    await mountReleaseDownloads(
      fixture([frenchFormat]) as unknown as ParentNode,
      async () => Response.json(zipRelease),
      'fr',
    );

    expect(englishFormat.textContent).toBe('macOS ZIP');
    expect(frenchFormat.textContent).toBe('ZIP macOS');
  });

  it('leaves content intact when release discovery fails', async () => {
    const link = element('mass-print', 'link', 'Bientôt disponible');
    const version = element('mass-print', 'version', 'Version détectée automatiquement');

    await mountReleaseDownloads(
      fixture([link, version]) as unknown as ParentNode,
      async () => { throw new Error('offline'); },
    );

    expect(link.textContent).toBe('Bientôt disponible');
    expect(version.textContent).toBe('Version détectée automatiquement');
    expect(link.attributes.has('href')).toBe(false);
  });
});
