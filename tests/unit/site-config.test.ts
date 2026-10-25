import { describe, expect, it } from 'vitest';
import { PORTAL_LINK, PORTAL_ORIGIN, SITE } from '../../src/config/site';
import { getRoute, ui } from '../../src/i18n';

describe('public site contract', () => {
  it('keeps the approved anonymous identity and routes', () => {
    expect(SITE).toMatchObject({
      origin: 'https://111iridescence.org',
      title: '111iridescence',
      heroTitle: '111iridescence.',
      profile: 'Focused, native macOS software that respects your data.',
    });
    expect([getRoute('en', 'apps'), getRoute('en', 'about')]).toEqual(['/apps', '/about']);
    expect([ui('fr').nav.apps, ui('fr').nav.about]).toEqual(['Mes apps', 'À propos']);
    expect(PORTAL_ORIGIN).toBe('https://portail.111iridescence.org');
    expect(PORTAL_LINK).toEqual({ href: 'https://portail.111iridescence.org/', label: 'Portail' });
  });
});
