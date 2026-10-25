import { describe, expect, it } from 'vitest';
import { getAlternatePath, getRoute, locales, ui } from '../../src/i18n';

describe('internationalization contract', () => {
  it('maps every public page between English and French', () => {
    expect(locales).toEqual(['en', 'fr']);
    expect(getRoute('en', 'home')).toBe('/');
    expect(getRoute('fr', 'home')).toBe('/fr/');
    expect(getRoute('en', 'apps')).toBe('/apps');
    expect(getRoute('fr', 'apps')).toBe('/fr/apps');
    expect(getRoute('en', 'about')).toBe('/about');
    expect(getRoute('fr', 'about')).toBe('/fr/a-propos');
    expect(getRoute('en', 'product', 'mass-print')).toBe('/apps/mass-print');
    expect(getRoute('fr', 'product', 'mass-print')).toBe('/fr/apps/mass-print');
  });

  it('switches language without losing the current page or query', () => {
    expect(getAlternatePath('/about?from=nav')).toBe('/fr/a-propos?from=nav');
    expect(getAlternatePath('/fr/apps/mass-print?download=1')).toBe('/apps/mass-print?download=1');
    expect(getAlternatePath('/')).toBe('/fr/');
  });

  it('has complete shell dictionaries in both languages', () => {
    for (const locale of locales) {
      const copy = ui(locale);
      expect(copy.nav.apps).toBeTruthy();
      expect(copy.nav.about).toBeTruthy();
      expect(copy.language.en).toBeTruthy();
      expect(copy.language.fr).toBeTruthy();
      expect(copy.skipToContent).toBeTruthy();
    }
    expect(ui('en').nav.about).toBe('About');
    expect(ui('fr').nav.about).toBe('À propos');
  });
});
