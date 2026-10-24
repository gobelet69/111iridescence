import { describe, expect, it } from 'vitest';
import { getApp } from '../../src/data/apps';
import { normalizeRelease, unavailableRelease } from '../../src/lib/releases';

const baseRelease = {
  tag_name: 'v0.1.3',
  name: 'Mass Print v0.1.3',
  html_url: 'https://github.com/gobelet69/Mass-Print/releases/tag/v0.1.3',
  published_at: '2026-10-24T12:56:16Z',
  body: 'Universal macOS build.',
  draft: false,
  prerelease: false,
  assets: [],
};

const asset = (name: string, url = `https://github.com/download/${encodeURIComponent(name)}`) => ({
  name,
  browser_download_url: url,
  state: 'uploaded',
  size: 7_633_472,
  content_type: 'application/octet-stream',
});

describe('release normalization', () => {
  it('selects the published universal DMG for Mass Print', () => {
    const result = normalizeRelease(getApp('mass-print'), {
      ...baseRelease,
      assets: [
        asset('Mass.Print_universal.app.tar.gz'),
        asset('Mass.Print_0.1.3_universal.dmg', 'https://github.com/download/Mass.Print_0.1.3_universal.dmg'),
      ],
    });

    expect(result).toEqual({
      available: true,
      version: '0.1.3',
      format: 'DMG universel',
      architecture: 'Apple Silicon et Intel',
      compatibility: 'macOS 12.3 ou version ultérieure',
      downloadUrl: 'https://github.com/download/Mass.Print_0.1.3_universal.dmg',
      releaseUrl: baseRelease.html_url,
      publishedAt: baseRelease.published_at,
      notes: 'Universal macOS build.',
    });
  });

  it('does not mistake an app archive for the Mass Print installer', () => {
    expect(normalizeRelease(getApp('mass-print'), {
      ...baseRelease,
      assets: [asset('Mass.Print_universal.app.tar.gz')],
    })).toEqual(unavailableRelease(getApp('mass-print')));
  });

  it('prefers a PDF Reader DMG over its documented macOS ZIP fallback', () => {
    const result = normalizeRelease(getApp('iridescence-pdf-reader'), {
      ...baseRelease,
      tag_name: 'v0.5.0',
      html_url: 'https://github.com/gobelet69/iridecence-pdf-reader/releases/tag/v0.5.0',
      assets: [
        asset('Iridecence-PDF-Reader-v0.5.0-macOS-arm64.zip'),
        asset('Iridecence-PDF-Reader-v0.5.0-macOS-arm64.dmg'),
      ],
    });

    expect(result.available).toBe(true);
    if (!result.available) return;
    expect(result.format).toBe('DMG');
    expect(result.downloadUrl).toContain('.dmg');
    expect(result.version).toBe('0.5.0');
  });

  it('falls back to the documented PDF Reader macOS arm64 ZIP', () => {
    const result = normalizeRelease(getApp('iridescence-pdf-reader'), {
      ...baseRelease,
      assets: [asset('Iridecence-PDF-Reader-v0.5.0-macOS-arm64.zip')],
    });

    expect(result.available).toBe(true);
    if (!result.available) return;
    expect(result.format).toBe('ZIP macOS');
  });

  it.each([
    ['draft', { ...baseRelease, draft: true, assets: [asset('Mass.Print_0.1.3_universal.dmg')] }],
    ['prerelease', { ...baseRelease, prerelease: true, assets: [asset('Mass.Print_0.1.3_universal.dmg')] }],
    ['wrong architecture', { ...baseRelease, assets: [asset('Mass.Print_0.1.3_arm64.dmg')] }],
    ['missing assets', { ...baseRelease, assets: [] }],
    ['malformed payload', { message: 'rate limited' }],
  ])('returns unavailable for %s', (_label, payload) => {
    expect(normalizeRelease(getApp('mass-print'), payload)).toEqual(unavailableRelease(getApp('mass-print')));
  });

  it('bounds release notes without breaking the normalized payload', () => {
    const result = normalizeRelease(getApp('mass-print'), {
      ...baseRelease,
      body: `Launch notes\n\n${'a'.repeat(900)}`,
      assets: [asset('Mass.Print_0.1.3_universal.dmg')],
    });

    expect(result.available).toBe(true);
    if (!result.available) return;
    expect(result.notes.length).toBeLessThanOrEqual(603);
    expect(result.notes.endsWith('…')).toBe(true);
  });
});
