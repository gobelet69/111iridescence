import type { AcceptedAsset, AppDefinition } from '../data/apps';

export interface GitHubReleaseAsset {
  name: string;
  browser_download_url: string;
  state: string;
  size: number;
  content_type: string;
}

export interface GitHubRelease {
  tag_name: string;
  name: string;
  html_url: string;
  published_at: string;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  assets: GitHubReleaseAsset[];
}

export type ReleaseAvailability = {
  available: false;
  compatibility: string;
  architecture: string;
} | {
  available: true;
  version: string;
  format: string;
  architecture: string;
  compatibility: string;
  downloadUrl: string;
  releaseUrl: string;
  publishedAt: string;
  notes: string;
};

export function unavailableRelease(app: AppDefinition): ReleaseAvailability {
  return {
    available: false,
    compatibility: app.compatibility,
    architecture: app.architecture,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asRelease(value: unknown): GitHubRelease | null {
  if (!isRecord(value) || !Array.isArray(value.assets)) return null;
  const scalarFields = ['tag_name', 'name', 'html_url', 'published_at'] as const;
  if (scalarFields.some((field) => typeof value[field] !== 'string')) return null;
  if (typeof value.draft !== 'boolean' || typeof value.prerelease !== 'boolean') return null;
  if (value.body !== null && typeof value.body !== 'string') return null;

  const assets = value.assets.filter((candidate): candidate is GitHubReleaseAsset => {
    if (!isRecord(candidate)) return false;
    return typeof candidate.name === 'string'
      && typeof candidate.browser_download_url === 'string'
      && typeof candidate.state === 'string'
      && typeof candidate.size === 'number'
      && typeof candidate.content_type === 'string';
  });

  return { ...value, assets } as unknown as GitHubRelease;
}

function matchesPolicy(name: string, policy: AcceptedAsset): boolean {
  const normalized = name.toLowerCase();
  if (policy === 'universal-dmg') return normalized.endsWith('.dmg') && normalized.includes('universal');
  if (policy === 'dmg') {
    return normalized.endsWith('.dmg')
      && normalized.includes('macos')
      && (normalized.includes('arm64')
        || normalized.includes('apple-silicon')
        || normalized.includes('universal'));
  }
  return normalized.endsWith('.zip')
    && normalized.includes('macos')
    && (normalized.includes('arm64') || normalized.includes('apple-silicon'));
}

function formatLabel(policy: AcceptedAsset): string {
  if (policy === 'universal-dmg') return 'DMG universel';
  if (policy === 'dmg') return 'DMG';
  return 'ZIP macOS';
}

function boundedNotes(notes: string | null): string {
  const normalized = (notes ?? '').trim();
  return normalized.length <= 600 ? normalized : `${normalized.slice(0, 600).trimEnd()}…`;
}

export function normalizeRelease(app: AppDefinition, payload: unknown): ReleaseAvailability {
  const release = asRelease(payload);
  if (!release || release.draft || release.prerelease) return unavailableRelease(app);
  if (!release.html_url.startsWith('https://github.com/')) return unavailableRelease(app);

  for (const policy of app.releasePolicy.acceptedAssets) {
    const asset = release.assets.find((candidate) => (
      candidate.state === 'uploaded'
      && candidate.size > 0
      && candidate.browser_download_url.startsWith('https://github.com/')
      && matchesPolicy(candidate.name, policy)
    ));
    if (!asset) continue;

    return {
      available: true,
      version: release.tag_name.replace(/^v/i, ''),
      format: formatLabel(policy),
      architecture: app.architecture,
      compatibility: app.compatibility,
      downloadUrl: asset.browser_download_url,
      releaseUrl: release.html_url,
      publishedAt: release.published_at,
      notes: boundedNotes(release.body),
    };
  }

  return unavailableRelease(app);
}
