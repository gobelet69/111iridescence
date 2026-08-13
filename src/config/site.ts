export const SITE = {
  origin: 'https://111iridescence.org',
  title: '111iridescence',
  description: 'Projets personnels et notes techniques sur le développement web et la sécurité informatique.',
  heroTitle: '111iridescence.',
  heroDescription: 'Développement web, outils personnels et sécurité informatique.',
  profile: "Je développe mes propres outils et je documente ce que j'apprends sur le web et la sécurité.",
} as const;

export const PUBLIC_NAV = [
  { href: '/blog', label: 'Blog' },
  { href: '/projets', label: 'Projets' },
  { href: '/a-propos', label: 'À propos' },
] as const;

export const PORTAL_LINK = { href: '/portail', label: 'Portail' } as const;
