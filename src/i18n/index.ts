import type { AppSlug } from '../data/apps';

export const locales = ['en', 'fr'] as const;
export type Locale = typeof locales[number];
export type PageKey = 'home' | 'apps' | 'about' | 'product' | 'notFound';

const routes = {
  en: { home: '/', apps: '/apps', about: '/about', notFound: '/404' },
  fr: { home: '/fr/', apps: '/fr/apps', about: '/fr/a-propos', notFound: '/fr/404' },
} as const;

export function getRoute(locale: Locale, page: PageKey, slug?: AppSlug): string {
  if (page === 'product') {
    if (!slug) throw new Error('Product route requires an app slug');
    return `${routes[locale].apps}/${slug}`;
  }
  return routes[locale][page];
}

export function localeFromPath(pathname: string): Locale {
  return pathname === '/fr' || pathname.startsWith('/fr/') ? 'fr' : 'en';
}

function routeIdentity(pathname: string): { page: PageKey; slug?: AppSlug } {
  const locale = localeFromPath(pathname);
  const localized = routes[locale];
  if (pathname === localized.home || pathname === localized.home.replace(/\/$/, '')) return { page: 'home' };
  if (pathname === localized.apps) return { page: 'apps' };
  if (pathname === localized.about) return { page: 'about' };
  if (pathname === localized.notFound || pathname === `${localized.notFound}/`) return { page: 'notFound' };
  const prefix = `${localized.apps}/`;
  if (pathname.startsWith(prefix)) return { page: 'product', slug: pathname.slice(prefix.length) as AppSlug };
  return { page: 'home' };
}

export function getAlternatePath(input: string): string {
  const url = new URL(input, 'https://111iridescence.org');
  const locale = localeFromPath(url.pathname);
  const target: Locale = locale === 'en' ? 'fr' : 'en';
  const identity = routeIdentity(url.pathname);
  return `${getRoute(target, identity.page, identity.slug)}${url.search}${url.hash}`;
}

const dictionaries = {
  en: {
    nav: { apps: 'Apps', about: 'About' },
    language: { label: 'Language', en: 'English', fr: 'Français' },
    skipToContent: 'Skip to content',
    footerNavigation: 'Secondary links',
    portal: 'Portal',
  },
  fr: {
    nav: { apps: 'Mes apps', about: 'À propos' },
    language: { label: 'Langue', en: 'English', fr: 'Français' },
    skipToContent: 'Aller au contenu',
    footerNavigation: 'Liens secondaires',
    portal: 'Portail',
  },
} as const;

export function ui(locale: Locale) {
  return dictionaries[locale];
}

export const alternateLocale = (locale: Locale): Locale => locale === 'en' ? 'fr' : 'en';
