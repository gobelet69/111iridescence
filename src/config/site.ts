export const SITE = {
  origin: 'https://111iridescence.org',
  title: '111iridescence',
  description: '111iridescence conçoit des applications macOS natives, simples et rapides : Iridescence PDF Reader et Mass Print.',
  heroTitle: '111iridescence.',
  profile: 'Des logiciels macOS ciblés, natifs et respectueux de vos données.',
} as const;

export const PUBLIC_NAV = [
  { href: '/apps', label: 'Mes apps' },
  { href: '/a-propos', label: 'À propos' },
] as const;

export const PORTAL_ORIGIN = 'https://portail.111iridescence.org';
export const PORTAL_LINK = { href: `${PORTAL_ORIGIN}/`, label: 'Portail' } as const;
