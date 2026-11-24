import { describe, expect, it, vi } from 'vitest';
import { mountReleaseDownloads } from '../../src/scripts/release-download';

type TestElement = {
  dataset: Record<string, string>;
  textContent: string;
  attributes: Map<string, string>;
  hidden: boolean;
  closest(selector: string): { hidden: boolean } | null;
  setAttribute(name: string, value: string): void;
};

function element(slug: string, role: string, text = '', disclosure?: { hidden: boolean }): TestElement {
  return {
    dataset: { releaseSlug: slug, releaseRole: role },
    textContent: text,
    attributes: new Map(),
    hidden: role === 'notes',
    closest: (selector) => selector === 'details' ? disclosure ?? null : null,
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
  compatibility: 'macOS 13 ou version ultérieure',
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
    const disclosure = { hidden: true };
    const notes = element('mass-print', 'notes', '', disclosure);
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
    expect(disclosure.hidden).toBe(false);
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


describe('release discovery feedback', () => {
  it('shows pending feedback until the request settles', async () => {
    const status = element('mass-print', 'status');
    let settle!: (response: Response) => void;
    const request = mountReleaseDownloads(fixture([status]) as unknown as ParentNode,
      () => new Promise<Response>((resolve) => { settle = resolve; }), 'en');
    expect(status.textContent).toBe('Checking the latest release…');
    settle(Response.json({ available: false }));
    await request;
    expect(status.textContent).toBe('No compatible download is available.');
  });
  it.each(['network', 'http', 'invalid'] as const)('distinguishes %s errors from an unavailable release', async (failure) => {
    const status = element('mass-print', 'status');
    const fetchRelease = async () => {
      if (failure === 'network') throw new Error('offline');
      return failure === 'http' ? new Response('', { status: 503 }) : Response.json({});
    };
    await mountReleaseDownloads(fixture([status]) as unknown as ParentNode, fetchRelease, 'fr');
    expect(status.attributes.get('data-release-state')).toBe('error');
    expect(status.textContent).toContain('Impossible de vérifier');
  });
});

describe('release request deadline', () => {
  it.each(['headers', 'body'] as const)('offers recovery when %s never settles', async (phase) => {
    vi.useFakeTimers();
    try {
      const status = element('mass-print', 'status');
      const link = element('mass-print', 'link', 'View releases on GitHub');
      link.setAttribute('href', 'https://github.com/gobelet69/Mass-Print/releases');
      const retry = element('mass-print', 'retry');
      // This fixture has no real DOM event dispatch; timeout visibility is the contract under test.
      Object.assign(retry, { addEventListener: () => {} });
      let requestSignal: AbortSignal | null | undefined;
      const stalledFetch = async (_input: RequestInfo | URL, init?: RequestInit) => {
        requestSignal = init?.signal;
        if (phase === 'headers') return new Promise<Response>(() => {});
        return { ok: true, json: () => new Promise<unknown>(() => {}) } as Response;
      };
      const pending = mountReleaseDownloads(fixture([status, link, retry]) as unknown as ParentNode, stalledFetch, 'en');
      await vi.advanceTimersByTimeAsync(9_999);
      expect(status.attributes.get('data-release-state')).toBe('loading');
      await vi.advanceTimersByTimeAsync(1);
      expect(status.attributes.get('data-release-state')).toBe('error');
      expect(retry.hidden).toBe(false);
      expect(requestSignal?.aborted).toBe(true);
      expect(link.attributes.get('href')).toBe('https://github.com/gobelet69/Mass-Print/releases');
      await pending;
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
