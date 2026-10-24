import { describe, expect, it } from 'vitest';
import { apps, getApp } from '../../src/data/apps';

describe('macOS app catalog', () => {
  it('keeps a unique, deliberate product order', () => {
    expect(apps.map((app) => app.slug)).toEqual([
      'iridescence-pdf-reader',
      'mass-print',
    ]);
    expect(new Set(apps.map((app) => app.slug)).size).toBe(2);
  });

  it('describes PDF Reader from its verified repository contract', () => {
    const app = getApp('iridescence-pdf-reader');

    expect(app).toMatchObject({
      name: 'Iridescence PDF Reader',
      repository: 'gobelet69/iridecence-pdf-reader',
      compatibility: 'macOS 14 ou version ultérieure',
      architecture: 'Apple Silicon',
      publicationStatus: 'coming-soon',
      releasePolicy: {
        acceptedAssets: ['dmg', 'macos-zip'],
      },
    });
    expect(app.screenshots.map((image) => image.src)).toEqual(expect.arrayContaining([
      '/apps/iridescence-pdf-reader/reader-workspace-light.png',
      '/apps/iridescence-pdf-reader/annotations.png',
      '/apps/iridescence-pdf-reader/palette-command.png',
      '/apps/iridescence-pdf-reader/ocr-panel.png',
    ]));
    expect(app.sections.map((section) => section.id)).toEqual(expect.arrayContaining([
      'workspaces',
      'reading',
      'command-palette',
      'ocr',
    ]));
  });

  it('describes Mass Print as a released universal Mac app', () => {
    const app = getApp('mass-print');

    expect(app).toMatchObject({
      name: 'Mass Print',
      tagline: 'Tous vos documents. Le bon ordre. Une seule impression.',
      repository: 'gobelet69/Mass-Print',
      compatibility: 'macOS 12.3 ou version ultérieure',
      architecture: 'Apple Silicon et Intel',
      publicationStatus: 'available',
      releasePolicy: {
        acceptedAssets: ['universal-dmg'],
      },
    });
    expect(app.features.map((feature) => feature.title)).toEqual(expect.arrayContaining([
      'Ordre maîtrisé',
      'Action rapide Finder',
      'Traitement local',
    ]));
  });

  it('rejects an unknown product instead of silently returning another app', () => {
    expect(() => getApp('unknown-app')).toThrow('Unknown app slug: unknown-app');
  });
});
