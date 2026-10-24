import { describe, expect, it } from 'vitest';
import { PORTAL_LINK, PORTAL_ORIGIN, PUBLIC_NAV, SITE } from '../../src/config/site';

describe('public site contract', () => {
  it('keeps the approved anonymous identity and routes', () => {
    expect(SITE).toMatchObject({
      origin: 'https://111iridescence.org',
      title: '111iridescence',
      heroTitle: '111iridescence.',
      heroDescription: 'Des applications macOS pensées pour la simplicité, la rapidité et le plaisir d’utilisation.',
      profile: 'Des logiciels macOS ciblés, natifs et respectueux de vos données.',
    });
    expect(PUBLIC_NAV).toEqual([
      { href: '/apps', label: 'Mes apps' },
      { href: '/a-propos', label: 'À propos' },
    ]);
    expect(PORTAL_ORIGIN).toBe('https://portail.111iridescence.org');
    expect(PORTAL_LINK).toEqual({ href: 'https://portail.111iridescence.org/', label: 'Portail' });
  });
});
