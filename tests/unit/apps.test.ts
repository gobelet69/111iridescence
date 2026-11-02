import { describe, expect, it } from 'vitest';
import { apps, getApp, getApps } from '../../src/data/apps';

describe('macOS app catalog', () => {
  it('keeps a unique, deliberate product order', () => {
    expect(apps.map((app) => app.slug)).toEqual([
      'iridescence-installer',
      'iridescence-pdf-reader',
      'mass-print',
      'resource-guard',
      'quickpad',
    ]);
    expect(new Set(apps.map((app) => app.slug)).size).toBe(5);
  });

  it('shares product facts while localizing every editorial field', () => {
    const english = getApp('mass-print', 'en');
    const french = getApp('mass-print', 'fr');

    expect(english.repository).toBe(french.repository);
    expect(english.icon).toBe(french.icon);
    expect(english.tagline).toBe('All your documents. The right order. One print run.');
    expect(french.tagline).toBe('Tous vos documents. Le bon ordre. Une seule impression.');
    expect(getApps('en')).toHaveLength(getApps('fr').length);
    expect(getApps('en').every((app) => app.description && app.features.every((feature) => feature.description))).toBe(true);
  });

  it('describes Iridescence Installer as a flagship ecosystem manager', () => {
    const app = getApp('iridescence-installer');

    expect(app).toMatchObject({
      name: 'Iridescence Installer',
      repository: 'gobelet69/iridescence-installer',
      compatibility: 'macOS 13 ou version ultérieure',
      architecture: 'Apple Silicon et Intel',
      publicationStatus: 'available',
      releasePolicy: {
        acceptedAssets: ['universal-dmg', 'dmg'],
      },
    });
    expect(app.screenshots.map((image) => image.src)).toEqual(expect.arrayContaining([
      '/apps/iridescence-installer/installer-main.png',
      '/apps/iridescence-installer/installer-discover.png',
      '/apps/iridescence-installer/installer-updates.png',
      '/apps/iridescence-installer/installer-installed.png',
    ]));
    expect(app.sections.map((section) => section.id)).toEqual(expect.arrayContaining([
      'discover',
      'updates',
      'quarantine',
    ]));
  });

  it('describes PDF Reader from its verified repository contract', () => {
    const app = getApp('iridescence-pdf-reader');

    expect(app).toMatchObject({
      name: 'Iridescence PDF Reader',
      repository: 'gobelet69/iridecence-pdf-reader',
      compatibility: 'macOS 14 ou version ultérieure',
      architecture: 'Apple Silicon',
      publicationStatus: 'available',
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

  it('describes Resource Guard as an Apple Silicon menu bar utility', () => {
    const app = getApp('resource-guard');

    expect(app).toMatchObject({
      name: 'Resource Guard',
      repository: 'gobelet69/mac-resource-guard',
      compatibility: 'macOS 13 ou version ultérieure',
      architecture: 'Apple Silicon',
      publicationStatus: 'available',
      releasePolicy: {
        acceptedAssets: ['dmg'],
      },
    });
    expect(app.features.map((feature) => feature.title)).toEqual(expect.arrayContaining([
      'AppKit 100% natif',
      'Surveillance adaptative',
      'Pression mémoire intelligente',
    ]));
  });

  it('describes QuickPad as a native Swift 6 and AppKit text editor', () => {
    const app = getApp('quickpad');

    expect(app).toMatchObject({
      name: 'QuickPad',
      repository: 'gobelet69/quickpad',
      compatibility: 'macOS 13 ou version ultérieure',
      architecture: 'Apple Silicon et Intel',
      publicationStatus: 'available',
      releasePolicy: {
        acceptedAssets: ['universal-dmg', 'dmg'],
      },
    });
    expect(app.features.map((feature) => feature.title)).toEqual(expect.arrayContaining([
      'Démarrage sous 100 ms',
      'Aperçus structurés',
      'Écriture atomique',
    ]));
  });

  it('rejects an unknown product instead of silently returning another app', () => {
    expect(() => getApp('unknown-app')).toThrow('Unknown app slug: unknown-app');
  });
});
