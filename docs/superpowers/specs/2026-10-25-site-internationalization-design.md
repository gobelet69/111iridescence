# 111iridescence Internationalization Design

## Intent

Make English the canonical default experience while preserving a complete French version under `/fr/`. Both languages use the same layouts, product facts, release discovery, animation code, and visual system.

## URL contract

English routes are `/`, `/apps`, `/apps/:slug`, and `/about`. French routes are `/fr/`, `/fr/apps`, `/fr/apps/:slug`, and `/fr/a-propos`. `/a-propos` permanently redirects to `/fr/a-propos`; there is no browser-language or country redirect. The active URL is the sole locale authority.

## Architecture

- `src/i18n/index.ts` owns locale types, route pairs, path generation, shared UI dictionaries, and alternate URL lookup.
- `src/data/apps.ts` retains one product catalog: repository, release policy, assets, status, and platform are common; editorial fields are localized within each product.
- Shared page components render home, catalog, product, About, and 404 experiences from an explicit locale. Route files are thin static wrappers.
- `BaseLayout` receives locale and alternate path, sets `html[lang]`, canonical, `hreflang` (`en`, `fr`, `x-default`), translated social metadata, and localized shell components.
- The language switch is two ordinary links, works without JavaScript, preserves the equivalent page, and exposes the active language with `aria-current`.
- Runtime release data remains one locale-neutral endpoint. The client renders localized loading, unavailable, version, button, compatibility, and format labels from the document language.

## Editorial rules

English copy is written as native English, not mechanically translated. French keeps the same facts. Official product names, GitHub, technical brands, and technology names remain unchanged. Public identity is only `111iridescence`; no civil identity, portrait, precise location, or personal contact data is introduced.

## SEO and migration

Every localized page is self-canonical and declares both language alternates plus English `x-default`. Sitemap generation includes only canonical static pages. `/a-propos` is a 308 redirect. Existing unchanged paths such as `/apps` become English in place and advertise `/fr/apps` as their French alternate.

## Quality gates

Tests cover locale completeness, route mappings, HTML language, canonical/hreflang, selector page preservation, direct navigation, redirects, no-JavaScript rendering, release localization, anonymity, overflow, and sitemap contents. Visual QA covers both languages at 390, 768, 1280, and 1440 pixels without changing the pixel hero engine.
