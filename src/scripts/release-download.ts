type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

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

function applyAvailableRelease(root: ParentNode, slug: string, release: AvailableRelease) {
  for (const link of targets(root, slug, 'link')) {
    link.setAttribute('href', release.downloadUrl);
    link.setAttribute('aria-disabled', 'false');
    link.setAttribute('data-release-state', 'available');
    link.textContent = 'Télécharger pour macOS';
  }
  for (const version of targets(root, slug, 'version')) version.textContent = `Version ${release.version}`;
  for (const format of targets(root, slug, 'format')) format.textContent = release.format;
  if (release.notes) {
    for (const notes of targets(root, slug, 'notes')) {
      notes.textContent = release.notes;
      notes.hidden = false;
    }
  }
}

export async function mountReleaseDownloads(
  root: ParentNode = document,
  fetchRelease: FetchLike = fetch,
): Promise<void> {
  const controls = Array.from(root.querySelectorAll('[data-release-slug]')) as HTMLElement[];
  const slugs = [...new Set(controls.map((control) => control.dataset.releaseSlug).filter(Boolean))] as string[];

  await Promise.all(slugs.map(async (slug) => {
    try {
      const response = await fetchRelease(`/api/releases/${encodeURIComponent(slug)}`, {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) return;
      const release: unknown = await response.json();
      if (isAvailableRelease(release)) applyAvailableRelease(root, slug, release);
    } catch {
      // Static fallback intentionally remains intact when discovery is unavailable.
    }
  }));
}
