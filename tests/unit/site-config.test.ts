import { describe, expect, it } from 'vitest';
import { PORTAL_LINK, PUBLIC_NAV, SITE } from '../../src/config/site';

describe('public site contract', () => {
  it('keeps the approved anonymous identity and routes', () => {
    expect(SITE).toMatchObject({
      origin: 'https://111iridescence.org',
      title: '111iridescence',
      heroTitle: '111iridescence.',
      heroDescription: 'Développement web, outils personnels et sécurité informatique.',
      profile: "Je développe mes propres outils et je documente ce que j'apprends sur le web et la sécurité.",
    });
    expect(PUBLIC_NAV).toEqual([
      { href: '/blog', label: 'Blog' },
      { href: '/projets', label: 'Projets' },
      { href: '/a-propos', label: 'À propos' },
    ]);
    expect(PORTAL_LINK).toEqual({ href: '/portail', label: 'Portail' });
  });
});
