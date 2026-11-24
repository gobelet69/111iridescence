type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
type Locale = 'en' | 'fr';

type AvailableRelease = {
  available: true;
  version: string;
  format: string;
  downloadUrl: string;
  notes: string;
};

function isAvailableRelease(value: unknown): value is AvailableRelease {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return candidate.available === true
    && typeof candidate.version === 'string'
    && typeof candidate.format === 'string'
    && typeof candidate.downloadUrl === 'string'
    && candidate.downloadUrl.startsWith('https://github.com/')
    && typeof candidate.notes === 'string';
}

function targets(root: ParentNode, slug: string, role: string): HTMLElement[] {
  return Array.from(root.querySelectorAll(
    `[data-release-slug="${slug}"][data-release-role="${role}"]`,
  )) as HTMLElement[];
}

function labels(locale: Locale) {
  return locale === 'fr'
    ? { checking: 'Recherche de la version…', unavailable: 'Aucun téléchargement compatible disponible.', error: 'Impossible de vérifier la version. Consultez les releases ou réessayez.', ready: 'Téléchargement disponible.', download: 'Télécharger pour macOS', version: 'Version', universalDmg: 'DMG universel', macosZip: 'ZIP macOS' }
    : { checking: 'Checking the latest release…', unavailable: 'No compatible download is available.', error: 'Could not check the release. View releases or try again.', ready: 'Download available.', download: 'Download for macOS', version: 'Version', universalDmg: 'Universal DMG', macosZip: 'macOS ZIP' };
}

function applyAvailableRelease(root: ParentNode, slug: string, release: AvailableRelease, locale: Locale) {
  const copy = labels(locale);
  for (const link of targets(root, slug, 'link')) {
    link.setAttribute('href', release.downloadUrl);
    link.setAttribute('aria-disabled', 'false');
    link.setAttribute('data-release-state', 'available');
    link.textContent = copy.download;
  }
  for (const version of targets(root, slug, 'version')) version.textContent = `${copy.version} ${release.version}`;
  const formatLabel = /^(DMG universel|Universal DMG)$/i.test(release.format)
    ? copy.universalDmg
    : /^(ZIP macOS|macOS ZIP)$/i.test(release.format)
      ? copy.macosZip
      : release.format;
  for (const format of targets(root, slug, 'format')) format.textContent = formatLabel;
  if (release.notes) {
    for (const notes of targets(root, slug, 'notes')) {
      notes.textContent = release.notes;
      notes.hidden = false;
      const disclosure = notes.closest('details');
      if (disclosure) disclosure.hidden = false;
    }
  }
}

export async function mountReleaseDownloads(
  root: ParentNode = document,
  fetchRelease: FetchLike = fetch,
  locale: Locale = typeof document !== 'undefined' && document.documentElement.lang === 'fr' ? 'fr' : 'en',
): Promise<void> {
  const controls = Array.from(root.querySelectorAll('[data-release-slug]')) as HTMLElement[];
  const slugs = [...new Set(controls.map((control) => control.dataset.releaseSlug).filter(Boolean))] as string[];

  async function discover(slug: string): Promise<void> {
    const copy = labels(locale);
    function state(value: 'loading' | 'available' | 'unavailable' | 'error', message: string) {
      for (const status of targets(root, slug, 'status')) {
        status.textContent = message;
        status.setAttribute('data-release-state', value);
      }
      for (const retry of targets(root, slug, 'retry')) retry.hidden = value !== 'error';
    }
    state('loading', copy.checking);
    const controller = new AbortController();
    let deadline: ReturnType<typeof setTimeout> | undefined;
    try {
      // Bound the complete discovery, including a response body that stalls.
      const timeout = new Promise<never>((_resolve, reject) => {
        deadline = setTimeout(() => {
          controller.abort();
          reject(new Error('Release discovery timed out'));
        }, 10_000);
      });
      const discovery = (async (): Promise<unknown> => {
        const response = await fetchRelease(`/api/releases/${encodeURIComponent(slug)}`, {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Release discovery failed');
        return response.json();
      })();
      const release: unknown = await Promise.race([discovery, timeout]);
      if (isAvailableRelease(release)) {
        applyAvailableRelease(root, slug, release, locale);
        state('available', copy.ready);
      } else if (typeof release === 'object' && release !== null && 'available' in release && release.available === false) {
        state('unavailable', copy.unavailable);
      } else {
        throw new Error('Invalid release response');
      }
    } catch {
      // Keep the real releases-page link usable when discovery fails.
      state('error', copy.error);
    } finally {
      clearTimeout(deadline);
    }
  }

  for (const slug of slugs) {
    for (const retry of targets(root, slug, 'retry')) {
      if (retry.dataset.releaseRetryMounted) continue;
      retry.dataset.releaseRetryMounted = 'true';
      retry.addEventListener('click', () => { void discover(slug); });
    }
  }
  await Promise.all(slugs.map(discover));
}
